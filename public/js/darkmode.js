/*=========================================
  DARKMODE.JS
  Note: there is no dark-mode button and no dark-mode CSS in the project yet,
  so this file only does something if you add a button with id="themeBtn"
  and write CSS for body.dark-mode.
=========================================*/
(function () {
  "use strict";

  var btn = document.getElementById("themeBtn");
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}

  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    if (btn) btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  if (!btn) return;

  btn.addEventListener("click", function () {
    var dark = document.body.classList.toggle("dark-mode");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    btn.innerHTML = dark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
})();
