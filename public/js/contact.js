/*=========================================
  CONTACT.JS  -  contact form (talks to the server)
  The message is sent to  POST /api/contact  and saved in data/db.json.
  Note: it is SAVED, not e-mailed. See README for how to add real email later.
=========================================*/
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form || !window.TravelX) return;

  var ui = TravelX.ui;
  var V = window.TravelXValidate;

  var el = {
    name: document.getElementById("contactName"),
    email: document.getElementById("contactEmail"),
    phone: document.getElementById("contactPhone"),
    subject: document.getElementById("contactSubject"),
    message: document.getElementById("contactMessage"),
    alert: document.getElementById("contactAlert"),
    button: form.querySelector("button[type=submit]"),
    popup: document.querySelector(".contact-popup"),
    closePopup: document.querySelector(".close-contact-popup"),
  };

  var FIELD_MAP = {
    name: "contactName", email: "contactEmail", phone: "contactPhone",
    subject: "contactSubject", message: "contactMessage",
  };

  /*---------- phone: digits only ----------*/
  el.phone.addEventListener("input", function () {
    el.phone.value = el.phone.value.replace(/[^0-9]/g, "").slice(0, 10);
  });

  /*---------- prefill for logged-in visitors ----------*/
  function prefill() {
    var user = TravelX.auth.getUser();
    if (user && TravelX.auth.getToken()) {
      if (!el.name.value) el.name.value = user.name || "";
      if (!el.email.value) el.email.value = user.email || "";
    }
  }
  prefill();

  /*---------- validate (browser side) ----------*/
  function validate() {
    var ok = true;
    function fail(input, message) {
      ui.fieldError(input, message);
      ok = false;
    }
    if (!V.isName(el.name.value)) fail(el.name, V.messages.name);
    if (!V.isEmail(el.email.value)) fail(el.email, V.messages.email);
    if (!V.isPhone(el.phone.value)) fail(el.phone, V.messages.phone);

    var s = el.subject.value.trim().length;
    if (s < 3 || s > 100) fail(el.subject, "Subject must be 3 to 100 characters.");

    var m = el.message.value.trim().length;
    if (m < 10) fail(el.message, "Message should be at least 10 characters.");
    else if (m > 2000) fail(el.message, "Message must be under 2000 characters.");
    return ok;
  }

  /*---------- submit ----------*/
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

    ui.busy(el.button, true, "Sending...");

    TravelX.api
      .sendMessage({
        name: el.name.value.trim(),
        email: el.email.value.trim(),
        phone: el.phone.value.trim(),
        subject: el.subject.value.trim(),
        message: el.message.value.trim(),
      })
      .then(function () {
        if (el.popup) el.popup.classList.add("active");
        form.reset();
        prefill();
      })
      .catch(function (err) {
        ui.alert(el.alert, err.message, "error");
        if (err.fields) ui.showServerErrors(form, err.fields, FIELD_MAP);
      })
      .then(function () {
        ui.busy(el.button, false);
      });
  });

  form.addEventListener("input", function (e) {
    var holder = e.target.closest(".input-box, .input-full");
    var note = holder && holder.querySelector(".field-error");
    if (note) note.remove();
    e.target.classList.remove("has-error");
  });

  /*---------- popup ----------*/
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
})();
