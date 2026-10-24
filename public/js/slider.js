/*=========================================
  SLIDER.JS  -  home page hero image slider
  (The images are set inside index.html. The old version replaced them
   with image files that do not exist, which made the hero blank.)
=========================================*/
(function () {
  "use strict";

  var slides = document.querySelectorAll(".hero-slider .slide");
  if (slides.length < 2) return;

  var current = 0;
  for (var i = 0; i < slides.length; i++) {
    if (slides[i].classList.contains("active")) current = i;
  }

  setInterval(function () {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 5000);
})();
