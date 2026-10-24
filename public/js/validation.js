/*=========================================
  VALIDATION.JS  -  shared checks used by every form

  The browser checks give instant feedback.
  The server repeats the same checks (never trust the browser).
=========================================*/
(function () {
  "use strict";

  var NAME = /^[A-Za-z][A-Za-z .'-]{1,58}[A-Za-z.]$/;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^[6-9]\d{9}$/; // 10 digit Indian mobile number
  var PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

  window.TravelXValidate = {
    isName: function (v) { return NAME.test(String(v).trim()); },
    isEmail: function (v) { return EMAIL.test(String(v).trim()); },
    isPhone: function (v) { return PHONE.test(String(v).trim()); },
    isPassword: function (v) { return PASSWORD.test(String(v)); },

    messages: {
      name: "Enter a valid name (letters and spaces, at least 3 characters).",
      email: "Enter a valid email address.",
      phone: "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.",
      password: "Use 8+ characters with uppercase, lowercase, a number and a special character.",
    },
  };
})();
