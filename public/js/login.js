/*=========================================
  LOGIN.JS  -  login form (talks to the server)
  The server checks the password and sends back a signed token.
  The token (not the password) is kept in the browser.
=========================================*/
(function () {
  "use strict";

  var form = document.getElementById("loginForm");
  if (!form || !window.TravelX) return;

  var ui = TravelX.ui;
  var V = window.TravelXValidate;

  var emailInput = document.getElementById("loginEmail");
  var passwordInput = document.getElementById("loginPassword");
  var rememberBox = document.getElementById("rememberMe");
  var alertBox = document.getElementById("loginAlert");
  var showPassword = document.querySelector(".show-password");
  var popup = document.querySelector(".login-popup");
  var closePopup = document.querySelector(".close-login-popup");
  var button = form.querySelector("button[type=submit]");
  var forgot = document.getElementById("forgotLink");

  /*---------- already logged in? ----------*/
  if (TravelX.auth.isLoggedIn()) {
    window.location.replace("index.html");
    return;
  }

  /*---------- remember my email ----------*/
  try {
    var saved = localStorage.getItem("rememberEmail");
    if (saved) {
      emailInput.value = saved;
      if (rememberBox) rememberBox.checked = true;
    }
  } catch (e) {}

  /*---------- show / hide password ----------*/
  if (showPassword) {
    showPassword.addEventListener("click", function () {
      var hidden = passwordInput.type === "password";
      passwordInput.type = hidden ? "text" : "password";
      showPassword.innerHTML = hidden
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
    });
  }

  if (forgot) {
    forgot.addEventListener("click", function (e) {
      e.preventDefault();
      ui.toast("Password reset is not available yet. Please contact support.");
    });
  }

  /*---------- popup ----------*/
  function goHome() {
    window.location.href = "index.html";
  }
  if (closePopup) closePopup.addEventListener("click", goHome);

  /*---------- submit ----------*/
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ui.clearErrors(form);
    ui.hideAlert(alertBox);

    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var remember = !!(rememberBox && rememberBox.checked);

    if (!V.isEmail(email)) {
      ui.fieldError(emailInput, V.messages.email);
      emailInput.focus();
      return;
    }
    if (!password) {
      ui.fieldError(passwordInput, "Please enter your password.");
      passwordInput.focus();
      return;
    }

    ui.busy(button, true, "Logging in...");

    TravelX.api
      .login({ email: email, password: password, remember: remember })
      .then(function (data) {
        TravelX.auth.setSession(data.token, data.user, remember);
        try {
          if (remember) localStorage.setItem("rememberEmail", email);
          else localStorage.removeItem("rememberEmail");
        } catch (err) {}

        if (popup) {
          popup.classList.add("active");
          setTimeout(goHome, 1800);
        } else {
          goHome();
        }
      })
      .catch(function (err) {
        ui.alert(alertBox, err.message, "error");
        ui.busy(button, false);
      });
  });
})();
