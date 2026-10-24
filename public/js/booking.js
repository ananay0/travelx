/*=========================================
  BOOKING.JS  -  booking form (talks to the server)

  What happens when the visitor clicks "Confirm Booking":
    1. The browser checks every field            (instant feedback)
    2. The data is sent to  POST /api/bookings   (the server checks again,
                                                  works out the price and saves it)
    3. The success popup shows the booking reference
=========================================*/
(function () {
  "use strict";

  var form = document.getElementById("bookingForm");
  if (!form || !window.TravelX) return;

  var api = TravelX.api;
  var ui = TravelX.ui;
  var auth = TravelX.auth;
  var V = window.TravelXValidate;

  var el = {
    name: document.getElementById("userName"),
    email: document.getElementById("userEmail"),
    phone: document.getElementById("userPhone"),
    destination: document.getElementById("destinationSelect"),
    date: document.getElementById("travelDate"),
    travellers: document.getElementById("travellers"),
    pack: document.getElementById("packageSelect"),
    type: document.getElementById("travelType"),
    message: document.getElementById("message"),
    alert: document.getElementById("bookingAlert"),
    estimate: document.getElementById("priceEstimate"),
    button: form.querySelector("button[type=submit]"),
    popup: document.querySelector(".booking-popup"),
    closePopup: document.querySelector(".close-popup"),
    ref: document.getElementById("bookingRef"),
    myBookings: document.getElementById("myBookings"),
    myList: document.getElementById("myBookingsList"),
  };

  // server field name -> input id (used to show server errors under the right box)
  var FIELD_MAP = {
    name: "userName", email: "userEmail", phone: "userPhone",
    destination: "destinationSelect", package: "packageSelect",
    travelDate: "travelDate", travellers: "travellers",
    travelType: "travelType", message: "message",
  };

  var packages = []; // filled from the server

  /*=========================================
      LOAD PACKAGES FROM THE SERVER
      (if the server cannot be reached, the
       options written in booking.html are kept)
  =========================================*/
  function fillSelects(data) {
    packages = data.packages;

    var places = [];
    packages.forEach(function (p) {
      if (places.indexOf(p.destination) === -1) places.push(p.destination);
    });
    places.sort();

    el.destination.innerHTML = '<option value="">Select Destination</option>';
    places.forEach(function (place) {
      var o = document.createElement("option");
      o.value = place;
      o.textContent = place;
      el.destination.appendChild(o);
    });

    el.pack.innerHTML = '<option value="">Choose Package</option>';
    packages.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p.name;
      o.textContent = p.name + " (" + p.days + " days, " + ui.money(p.price) + " per person)";
      el.pack.appendChild(o);
    });

    if (data.travelTypes && data.travelTypes.length) {
      var current = el.type.value;
      el.type.innerHTML = "";
      data.travelTypes.forEach(function (t) {
        var o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        el.type.appendChild(o);
      });
      if (current) el.type.value = current;
    }
  }

  function findPackage(name) {
    for (var i = 0; i < packages.length; i++) if (packages[i].name === name) return packages[i];
    return null;
  }

  // Choosing a package picks its destination, and the other way round
  el.pack.addEventListener("change", function () {
    var p = findPackage(el.pack.value);
    if (p) el.destination.value = p.destination;
    updateEstimate();
  });

  el.destination.addEventListener("change", function () {
    var match = packages.filter(function (p) { return p.destination === el.destination.value; })[0];
    el.pack.value = match ? match.name : "";
    updateEstimate();
  });

  // Links like booking.html?package=Bali%20Honeymoon pick the package automatically
  function applyQueryString() {
    var params = new URLSearchParams(location.search);
    var wanted = params.get("package");
    var p = wanted && findPackage(wanted);
    if (p) {
      el.pack.value = p.name;
      el.destination.value = p.destination;
    }
    updateEstimate();
  }

  /*=========================================
      PRICE ESTIMATE
  =========================================*/
  function updateEstimate() {
    var p = findPackage(el.pack.value);
    var n = parseInt(el.travellers.value, 10);
    if (!p) {
      el.estimate.hidden = true;
      return;
    }
    el.estimate.hidden = false;
    if (n >= 1 && n <= 20) {
      el.estimate.innerHTML =
        "<strong>Estimated total: " + ui.money(p.price * n) + "</strong>" +
        "<span>" + ui.money(p.price) + " x " + n + " traveller" + (n > 1 ? "s" : "") + " &middot; " + p.days + " days</span>" +
        "<small>Final price is confirmed by our team. No payment is taken on this website.</small>";
    } else {
      el.estimate.innerHTML =
        "<strong>" + ui.money(p.price) + " per person</strong><span>" + p.days + " days</span>" +
        "<small>Enter the number of travellers to see the estimated total.</small>";
    }
  }

  el.travellers.addEventListener("input", updateEstimate);

  /*=========================================
      SMALL INPUT HELPERS
  =========================================*/
  // phone: digits only
  el.phone.addEventListener("input", function () {
    el.phone.value = el.phone.value.replace(/[^0-9]/g, "").slice(0, 10);
  });

  // earliest date = today (local time)
  el.date.min = ui.todayISO();

  // logged-in visitors get their name and email filled in
  function prefill() {
    var user = auth.getUser();
    if (user && auth.getToken()) {
      if (!el.name.value) el.name.value = user.name || "";
      if (!el.email.value) el.email.value = user.email || "";
    }
  }

  /*=========================================
      VALIDATE (browser side)
  =========================================*/
  function validate() {
    var ok = true;
    function fail(input, message) {
      ui.fieldError(input, message);
      ok = false;
    }

    if (!V.isName(el.name.value)) fail(el.name, V.messages.name);
    if (!V.isEmail(el.email.value)) fail(el.email, V.messages.email);
    if (!V.isPhone(el.phone.value)) fail(el.phone, V.messages.phone);
    if (!el.destination.value) fail(el.destination, "Please select a destination.");
    if (!el.pack.value) fail(el.pack, "Please select a package.");

    var p = findPackage(el.pack.value);
    if (p && el.destination.value && p.destination !== el.destination.value) {
      fail(el.pack, "This package is for " + p.destination + ". Choose a matching destination.");
    }

    if (!el.date.value) fail(el.date, "Please select your travel date.");
    else if (el.date.value < ui.todayISO()) fail(el.date, "Travel date cannot be in the past.");

    var n = Number(el.travellers.value);
    if (!Number.isInteger(n) || n < 1 || n > 20) fail(el.travellers, "Enter 1 to 20 travellers.");

    if (el.message.value.length > 1000) fail(el.message, "Please keep your request under 1000 characters.");

    return ok;
  }

  /*=========================================
      SUBMIT
  =========================================*/
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ui.clearErrors(form);
    ui.hideAlert(el.alert);

    if (!validate()) {
      ui.alert(el.alert, "Please correct the highlighted fields.", "error");
      var firstBad = form.querySelector(".has-error");
      if (firstBad) firstBad.focus();
      return;
    }

    var payload = {
      name: el.name.value.trim(),
      email: el.email.value.trim(),
      phone: el.phone.value.trim(),
      destination: el.destination.value,
      package: el.pack.value,
      travelType: el.type.value,
      travelDate: el.date.value,
      travellers: Number(el.travellers.value),
      message: el.message.value.trim(),
    };

    ui.busy(el.button, true, "Sending your request...");

    api
      .createBooking(payload)
      .then(function (data) {
        var b = data.booking;
        el.ref.innerHTML =
          "Reference: <strong>" + ui.escape(b.reference) + "</strong><br>" +
          ui.escape(b.package) + " &middot; " + ui.money(b.totalPrice) + " (estimated)<br>" +
          "<small>Our team will contact you to confirm the details.</small>";
        showPopup();
        form.reset();
        prefill();
        updateEstimate();
        loadMyBookings();
      })
      .catch(function (err) {
        ui.alert(el.alert, err.message, "error");
        if (err.fields) ui.showServerErrors(form, err.fields, FIELD_MAP);
      })
      .then(function () {
        ui.busy(el.button, false);
      });
  });

  // remove a field's red message as soon as the visitor edits it
  form.addEventListener("input", function (e) {
    var holder = e.target.closest(".input-box, .input-full");
    var note = holder && holder.querySelector(".field-error");
    if (note) note.remove();
    e.target.classList.remove("has-error");
  });

  /*=========================================
      SUCCESS POPUP
  =========================================*/
  function showPopup() {
    if (el.popup) el.popup.classList.add("active");
  }
  function hidePopup() {
    if (el.popup) el.popup.classList.remove("active");
  }

  if (el.closePopup) el.closePopup.addEventListener("click", hidePopup);
  if (el.popup) {
    el.popup.addEventListener("click", function (e) {
      if (e.target === el.popup) hidePopup();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hidePopup();
  });

  /*=========================================
      MY BOOKINGS  (only for logged-in visitors)
  =========================================*/
  function loadMyBookings() {
    if (!el.myBookings || !auth.isLoggedIn()) return;

    api
      .myBookings()
      .then(function (data) {
        renderBookings(data.bookings);
      })
      .catch(function () {
        el.myBookings.hidden = true; // e.g. login expired
      });
  }

  function renderBookings(list) {
    el.myBookings.hidden = false;
    if (!list.length) {
      el.myList.innerHTML = '<p class="no-bookings">You have no bookings yet. Fill in the form above to make your first one.</p>';
      return;
    }

    el.myList.innerHTML = list
      .map(function (b) {
        var cancellable = b.status !== "cancelled";
        return (
          '<div class="booking-record status-' + ui.escape(b.status) + '">' +
            '<div class="record-main">' +
              "<h4>" + ui.escape(b.package) + "</h4>" +
              "<p>" + ui.escape(b.destination) + " &middot; " + ui.escape(b.travelDate) + " &middot; " +
                b.travellers + " traveller" + (b.travellers > 1 ? "s" : "") + "</p>" +
              "<small>Ref " + ui.escape(b.reference) + "</small>" +
            "</div>" +
            '<div class="record-side">' +
              "<strong>" + ui.money(b.totalPrice) + "</strong>" +
              '<span class="status-pill">' + ui.escape(b.status) + "</span>" +
              (cancellable ? '<button type="button" class="cancel-booking" data-id="' + ui.escape(b.id) + '">Cancel</button>' : "") +
            "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  if (el.myList) {
    el.myList.addEventListener("click", function (e) {
      var btn = e.target.closest(".cancel-booking");
      if (!btn) return;
      if (!window.confirm("Cancel this booking?")) return;

      btn.disabled = true;
      api
        .cancelBooking(btn.getAttribute("data-id"))
        .then(function () {
          ui.toast("Booking cancelled.");
          loadMyBookings();
        })
        .catch(function (err) {
          btn.disabled = false;
          ui.toast(err.message);
        });
    });
  }

  /*=========================================
      START
  =========================================*/
  prefill();
  loadMyBookings();

  api
    .packages()
    .then(function (data) {
      fillSelects(data);
    })
    .catch(function () {
      // keep the options already in booking.html
    })
    .then(applyQueryString);
})();
