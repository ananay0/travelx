/*=========================================
  REGISTER.JS  -  sign-up form (talks to the server)
  The server hashes the password (scrypt) before saving it.
  Passwords are never stored in the browser.
=========================================*/
(function () {
  "use strict";

  var form = document.getElementById("registerForm");
  if (!form || !window.TravelX) return;

  var ui = TravelX.ui;
  var V = window.TravelXValidate;

  var nameInput = document.getElementById("registerName");
  var emailInput = document.getElementById("registerEmail");
  var passInput = document.getElementById("registerPassword");
  var confirmInput = document.getElementById("confirmPassword");
  var termsBox = document.getElementById("termsCheck");
  var alertBox = document.getElementById("registerAlert");
  var showPassword = document.querySelector(".show-register-password");
  var popup = document.querySelector(".register-popup");
  var closePopup = document.querySelector(".close-register-popup");
  var button = form.querySelector("button[type=submit]");

  var FIELD_MAP = {
    name: "registerName", email: "registerEmail",
    password: "registerPassword", confirmPassword: "confirmPassword",
  };

  /*---------- show / hide password ----------*/
  if (showPassword) {
    showPassword.addEventListener("click", function () {
      var hidden = passInput.type === "password";
      passInput.type = hidden ? "text" : "password";
      showPassword.innerHTML = hidden
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
    });
  }

  /*---------- popup ----------*/
  function goLogin() {
    window.location.href = "login.html";
  }
  if (closePopup) closePopup.addEventListener("click", goLogin);

  /*---------- validate ----------*/
  function validate() {
    var ok = true;
    function fail(input, message) {
      ui.fieldError(input, message);
      ok = false;
    }
    if (!V.isName(nameInput.value)) fail(nameInput, V.messages.name);
    if (!V.isEmail(emailInput.value)) fail(emailInput, V.messages.email);
    if (!V.isPassword(passInput.value)) fail(passInput, V.messages.password);
    if (confirmInput.value !== passInput.value) fail(confirmInput, "Passwords do not match.");
    if (termsBox && !termsBox.checked) {
      ui.alert(alertBox, "Please accept the Terms & Conditions to continue.", "error");
      ok = false;
    }
    return ok;
  }

  /*---------- submit ----------*/
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ui.clearErrors(form);
    ui.hideAlert(alertBox);

    if (!validate()) {
      if (alertBox.hidden) ui.alert(alertBox, "Please correct the highlighted fields.", "error");
      return;
    }

    ui.busy(button, true, "Creating account...");

    TravelX.api
      .register({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passInput.value,
        confirmPassword: confirmInput.value,
      })
      .then(function () {
        form.reset();
        if (popup) popup.classList.add("active");
        else goLogin();
      })
      .catch(function (err) {
        ui.alert(alertBox, err.message, "error");
        if (err.fields) ui.showServerErrors(form, err.fields, FIELD_MAP);
        ui.busy(button, false);
      });
  });

  form.addEventListener("input", function (e) {
    var holder = e.target.closest(".register-input");
    var note = holder && holder.querySelector(".field-error");
    if (note) note.remove();
    e.target.classList.remove("has-error");
  });
})();
