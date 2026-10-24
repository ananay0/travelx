/*=========================================
  DESTINATION.JS  -  search + favourite hearts on the Destinations page
  (This file was linked in destinations.html but did not exist.)
=========================================*/
(function () {
  "use strict";

  var KEY = "destinationFavourites";
  var items = document.querySelectorAll(".destination-item");
  var grid = document.querySelector(".destination-grid");
  var input = document.getElementById("searchDestination");
  var searchBtn = document.getElementById("searchBtn");

  /*---------- SEARCH ----------*/
  var noResult = document.createElement("p");
  noResult.className = "no-result";
  noResult.textContent = "No destination found. Try another name.";
  noResult.hidden = true;
  if (grid) grid.parentNode.insertBefore(noResult, grid.nextSibling);

  function runSearch() {
    var text = input ? input.value.toLowerCase().trim() : "";
    var shown = 0;
    items.forEach(function (item) {
      var match = item.textContent.toLowerCase().indexOf(text) !== -1;
      item.style.display = match ? "" : "none";
      if (match) shown++;
    });
    noResult.hidden = shown !== 0;
  }

  if (input) {
    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") runSearch();
    });
  }
  if (searchBtn) searchBtn.addEventListener("click", runSearch);

  /*---------- FAVOURITES ----------*/
  var favourites = [];
  try { favourites = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}

  function paint(button, on) {
    var icon = button.querySelector("i");
    button.classList.toggle("active", on);
    if (icon) {
      icon.classList.toggle("fa-solid", on);
      icon.classList.toggle("fa-regular", !on);
    }
  }

  document.querySelectorAll(".fav-btn").forEach(function (button) {
    var place = button.getAttribute("data-place");
    paint(button, favourites.indexOf(place) !== -1);

    button.addEventListener("click", function () {
      var index = favourites.indexOf(place);
      if (index === -1) favourites.push(place);
      else favourites.splice(index, 1);
      paint(button, index === -1);
      try { localStorage.setItem(KEY, JSON.stringify(favourites)); } catch (e) {}
    });
  });
})();
