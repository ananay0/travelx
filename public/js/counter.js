/*=========================================
  COUNTER.JS  -  numbers that count up when you scroll to them
  Works with:  <h2 class="counter-value" data-target="5000">
=========================================*/
(function () {
  "use strict";

  var counters = document.querySelectorAll(".counter-value");
  if (!counters.length) return;

  function animate(el) {
    var target = Number(el.getAttribute("data-target")) || 0;
    var duration = 1800; // milliseconds
    var start = null;

    function step(time) {
      if (start === null) start = time;
      var progress = Math.min((time - start) / duration, 1);
      el.textContent = Math.floor(progress * target).toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-IN");
    }
    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    counters.forEach(function (c) { c.textContent = Number(c.getAttribute("data-target")).toLocaleString("en-IN"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(function (c) { observer.observe(c); });
})();
