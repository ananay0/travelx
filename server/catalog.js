/*=========================================
  CATALOG.JS
  The destinations and packages offered by TravelX.
  (Copied from your packages.html / destinations.html so the
   website and the server always agree on names and prices.)
  Prices are in Indian Rupees (INR) per person.
=========================================*/

const destinations = [
  { name: "Paris",       country: "France" },
  { name: "Dubai",       country: "United Arab Emirates" },
  { name: "Maldives",    country: "Maldives" },
  { name: "Bali",        country: "Indonesia" },
  { name: "Switzerland", country: "Switzerland" },
  { name: "Goa",         country: "India" },
  { name: "London",      country: "United Kingdom" },
  { name: "Singapore",   country: "Singapore" },
  { name: "Tokyo",       country: "Japan" },
  { name: "New York",    country: "United States" },
  { name: "Rome",        country: "Italy" },
  { name: "Sydney",      country: "Australia" },
];

const packages = [
  { name: "Maldives Escape",   destination: "Maldives",    category: "beach",     days: 5, price: 59999 },
  { name: "Swiss Adventure",   destination: "Switzerland", category: "mountain",  days: 7, price: 89999 },
  { name: "Paris Explorer",    destination: "Paris",       category: "city",      days: 6, price: 74999 },
  { name: "Bali Honeymoon",    destination: "Bali",        category: "honeymoon", days: 6, price: 69999 },
  { name: "Goa Beach Tour",    destination: "Goa",         category: "beach",     days: 4, price: 19999 },
  { name: "Dubai Luxury",      destination: "Dubai",       category: "city",      days: 5, price: 54999 },
  { name: "London Highlights", destination: "London",      category: "city",      days: 7, price: 84999 },
  { name: "Singapore Tour",    destination: "Singapore",   category: "city",      days: 5, price: 57999 },
  { name: "Tokyo Experience",  destination: "Tokyo",       category: "city",      days: 6, price: 78999 },
  { name: "New York Tour",     destination: "New York",    category: "city",      days: 7, price: 94999 },
  { name: "Rome Heritage",     destination: "Rome",        category: "city",      days: 5, price: 66999 },
  { name: "Sydney Holiday",    destination: "Sydney",      category: "beach",     days: 6, price: 81999 },
];

const travelTypes = ["Family Trip", "Honeymoon", "Adventure", "Solo Travel", "Business Trip"];

const findPackage = (name) => packages.find((p) => p.name === name) || null;

module.exports = { destinations, packages, travelTypes, findPackage };
