/*=========================================
  LOCALSTORAGE.JS  -  small things that stay in the visitor's own browser

  Moved to the server (see api.js):  users, logins, bookings, contact messages.
  Still here:  newsletter signup, "last visited page", "last package clicked".
  (Gallery and Destination favourites are handled in gallery.js / destination.js.)
=========================================*/
(function () {
  "use strict";

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  /*---------- NEWSLETTER (footer / home page) ----------*/
  var newsletterForm = document.getElementById("newsletterForm");

  if (newsletterForm && window.TravelX) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailBox = document.getElementById("newsletterEmail");
      var button = newsletterForm.querySelector("button[type=submit]");
      var email = emailBox.value.trim();

      if (!window.TravelXValidate.isEmail(email)) {
        TravelX.ui.toast("Please enter a valid email address.");
        emailBox.focus();
        return;
      }

      TravelX.ui.busy(button, true, "Subscribing...");
      TravelX.api
        .subscribe(email)
        .then(function (data) {
          TravelX.ui.toast(data.message);
          newsletterForm.reset();
        })
        .catch(function (err) {
          TravelX.ui.toast(err.message);
        })
        .then(function () {
          TravelX.ui.busy(button, false);
        });
    });
  }

  /*---------- LAST VISITED PAGE ----------*/
  save("lastPage", window.location.pathname);

  /*---------- LAST PACKAGE CLICKED ----------*/
  document.querySelectorAll(".book-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      var card = button.closest(".package-card");
      var title = card && card.querySelector("h3");
      if (title) save("lastPackage", title.textContent.trim());
    });
  });
})();
