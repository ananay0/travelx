/*=========================================
  MAIN.JS  -  things every page needs:
  loader, sticky navbar, mobile menu, back-to-top, active link, footer year
=========================================*/
(function () {
  "use strict";

  /*---------- PAGE LOADER ----------*/
  var loader = document.querySelector(".loader");

  function hideLoader() {
    if (!loader) return;
    loader.style.opacity = "0";
    setTimeout(function () { loader.style.display = "none"; }, 500);
  }

  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader);

  // Safety: if a slow image/font keeps "load" waiting, never trap the visitor behind the loader
  setTimeout(hideLoader, 4000);

  /*---------- STICKY NAVBAR ----------*/
  var header = document.querySelector("header");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("sticky", window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  /*---------- MOBILE MENU ----------*/
  var menuBtn = document.querySelector(".menu-btn");
  var navLinks = document.querySelector(".nav-links");

  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("active", open);
    var icon = menuBtn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("active"));
    });
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
  }

  /*---------- BACK TO TOP BUTTON ----------*/
  var topBtn = document.createElement("div");
  topBtn.className = "top-btn";
  topBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(topBtn);

  window.addEventListener("scroll", function () {
    topBtn.classList.toggle("show", window.scrollY > 400);
  });

  topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /*---------- ACTIVE NAV LINK ----------*/
  var currentPage = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });

  /*---------- CURRENT YEAR IN FOOTER ----------*/
  document.querySelectorAll(".year").forEach(function (y) {
    y.textContent = new Date().getFullYear();
  });
})();
