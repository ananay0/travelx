/*=========================================
  API.JS  -  talks to the TravelX backend

  Everything is inside (function(){ ... })();
  That keeps our variable names private, so two JS files can
  never fight over the same name again.

  What it gives the other files:  window.TravelX
     TravelX.api   -> request functions (login, bookings, contact ...)
     TravelX.auth  -> who is logged in
     TravelX.ui    -> small helpers (alerts, field errors, money)
=========================================*/
(function () {
  "use strict";

  var TOKEN_KEY = "travelx_token";
  var USER_KEY = "travelx_user";

  /*-----------------------------------------
      FILE:// WARNING (opened by double-click)
  -----------------------------------------*/
  if (location.protocol === "file:") {
    document.addEventListener("DOMContentLoaded", function () {
      var bar = document.createElement("div");
      bar.className = "file-warning";
      bar.innerHTML =
        "<strong>Forms and login need the TravelX server.</strong> " +
        "Open a terminal in the project folder, run <code>npm start</code>, " +
        "then visit <code>http://localhost:3000</code>.";
      document.body.insertBefore(bar, document.body.firstChild);
    });
  }

  /*-----------------------------------------
      SESSION (token + user)
  -----------------------------------------*/
  function readStore(key) {
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  var auth = {
    getToken: function () {
      return readStore(TOKEN_KEY);
    },
    getUser: function () {
      try {
        return JSON.parse(readStore(USER_KEY) || "null");
      } catch (e) {
        return null;
      }
    },
    isLoggedIn: function () {
      return !!(auth.getToken() && auth.getUser());
    },
    // remember = true  -> stays after the browser is closed (localStorage)
    // remember = false -> ends when the tab is closed (sessionStorage)
    setSession: function (token, user, remember) {
      auth.clear();
      var store = remember ? localStorage : sessionStorage;
      store.setItem(TOKEN_KEY, token);
      store.setItem(USER_KEY, JSON.stringify(user));
    },
    clear: function () {
      [localStorage, sessionStorage].forEach(function (s) {
        try {
          s.removeItem(TOKEN_KEY);
          s.removeItem(USER_KEY);
        } catch (e) {}
      });
    },
    logout: function () {
      auth.clear();
      window.location.href = "login.html";
    },
  };

  /*-----------------------------------------
      REQUEST HELPER
  -----------------------------------------*/
  function ApiError(message, status, fields) {
    this.name = "ApiError";
    this.message = message;
    this.status = status || 0;
    this.fields = fields || null;
  }
  ApiError.prototype = Object.create(Error.prototype);

  function request(method, path, body) {
    if (location.protocol === "file:") {
      return Promise.reject(
        new ApiError("The TravelX server is not running. Run npm start and open http://localhost:3000")
      );
    }
    var headers = { Accept: "application/json" };
    var token = auth.getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    return fetch("/api" + path, {
      method: method,
      headers: headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
      .catch(function () {
        throw new ApiError("Cannot reach the TravelX server. Please check that it is running and try again.");
      })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!res.ok) {
              if (res.status === 401 && token) auth.clear(); // token expired
              throw new ApiError(data.error || "Request failed (" + res.status + ").", res.status, data.fields);
            }
            return data;
          });
      });
  }

  var api = {
    register: function (d) { return request("POST", "/auth/register", d); },
    login: function (d) { return request("POST", "/auth/login", d); },
    me: function () { return request("GET", "/auth/me"); },
    packages: function () { return request("GET", "/packages"); },
    createBooking: function (d) { return request("POST", "/bookings", d); },
    myBookings: function () { return request("GET", "/bookings"); },
    cancelBooking: function (id) { return request("POST", "/bookings/" + encodeURIComponent(id) + "/cancel", {}); },
    sendMessage: function (d) { return request("POST", "/contact", d); },
    subscribe: function (email) { return request("POST", "/newsletter", { email: email }); },
  };

  /*-----------------------------------------
      UI HELPERS
  -----------------------------------------*/
  var ui = {
    escape: function (text) {
      var div = document.createElement("div");
      div.textContent = text == null ? "" : String(text);
      return div.innerHTML;
    },

    money: function (n) {
      return "\u20B9" + Number(n).toLocaleString("en-IN");
    },

    // Shows a coloured message box.  type = "error" | "success"
    alert: function (box, message, type) {
      if (!box) return;
      box.textContent = message;
      box.className = "form-alert " + (type || "error");
      box.hidden = false;
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },

    hideAlert: function (box) {
      if (box) box.hidden = true;
    },

    // Puts a red message under one input
    fieldError: function (input, message) {
      if (!input) return;
      var holder = input.closest(".input-box, .input-full, .login-input, .register-input") || input.parentElement;
      var note = holder.querySelector(".field-error");
      if (!note) {
        note = document.createElement("small");
        note.className = "field-error";
        holder.appendChild(note);
      }
      note.textContent = message;
      input.classList.add("has-error");
    },

    clearErrors: function (form) {
      form.querySelectorAll(".field-error").forEach(function (n) { n.remove(); });
      form.querySelectorAll(".has-error").forEach(function (n) { n.classList.remove("has-error"); });
    },

    // Shows the errors returned by the server: fields = { serverName: "message" }, map = { serverName: "inputId" }
    showServerErrors: function (form, fields, map) {
      var first = null;
      Object.keys(fields || {}).forEach(function (key) {
        var input = document.getElementById(map[key] || key);
        if (input) {
          ui.fieldError(input, fields[key]);
          if (!first) first = input;
        }
      });
      if (first) first.focus();
    },

    // Small message at the bottom of the screen
    toast: function (message) {
      var t = document.createElement("div");
      t.className = "toast";
      t.textContent = message;
      document.body.appendChild(t);
      requestAnimationFrame(function () { t.classList.add("show"); });
      setTimeout(function () {
        t.classList.remove("show");
        setTimeout(function () { t.remove(); }, 400);
      }, 3200);
    },

    // Disable a button while we wait for the server
    busy: function (button, isBusy, busyText) {
      if (!button) return;
      if (isBusy) {
        button.dataset.original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + (busyText || "Please wait...");
      } else {
        button.disabled = false;
        if (button.dataset.original) button.innerHTML = button.dataset.original;
      }
    },

    // Local date as YYYY-MM-DD (not UTC, so it is right in India early in the morning)
    todayISO: function () {
      var d = new Date();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      return d.getFullYear() + "-" + m + "-" + day;
    },
  };

  /*-----------------------------------------
      NAVBAR: show "Hi, Name  |  Logout" when logged in
  -----------------------------------------*/
  function renderNav() {
    var loginLink = document.querySelector(".nav-right .login-btn");
    if (!loginLink) return;
    var user = auth.getUser();
    if (!user || !auth.getToken()) return;

    var first = String(user.name || "").split(" ")[0];
    var hello = document.createElement("span");
    hello.className = "nav-user";
    hello.innerHTML = '<i class="fa-solid fa-circle-user"></i> ' + ui.escape(first);
    loginLink.parentNode.insertBefore(hello, loginLink);

    loginLink.textContent = "Logout";
    loginLink.setAttribute("href", "#");
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      auth.logout();
    });
  }

  document.addEventListener("DOMContentLoaded", renderNav);

  window.TravelX = { api: api, auth: auth, ui: ui, ApiError: ApiError };
})();
