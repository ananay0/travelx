/*=========================================
  BOOKING CONTROLLER
  The server re-checks everything and calculates the price itself,
  so nobody can cheat by editing the form in the browser.
=========================================*/
const db = require("../db");
const v = require("../utils/validators");
const catalog = require("../catalog");
const { HttpError } = require("../utils/http");

const todayISO = () => new Date().toISOString().slice(0, 10);

function makeReference() {
  const n = db.all("bookings").length + 1;
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return "TX-" + String(n).padStart(4, "0") + rand;
}

function validDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + "T00:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== str) return false;
  const max = new Date();
  max.setUTCFullYear(max.getUTCFullYear() + 2);
  return str >= todayISO() && d <= max;
}

function create({ body, user }) {
  const errors = {};
  const name = v.clean(body.name);
  const email = v.clean(body.email).toLowerCase();
  const phone = v.clean(body.phone);
  const destination = v.clean(body.destination);
  const packageName = v.clean(body.package);
  const travelType = v.clean(body.travelType) || "Family Trip";
  const travelDate = v.clean(body.travelDate);
  const travellers = Number(body.travellers);
  const message = v.clean(body.message);

  if (!v.name(name)) errors.name = "Enter a valid full name.";
  if (!v.email(email)) errors.email = "Enter a valid email address.";
  if (!v.phone(phone)) errors.phone = "Enter a valid 10-digit mobile number.";

  const pack = catalog.findPackage(packageName);
  if (!catalog.destinations.some((d) => d.name === destination)) errors.destination = "Please select a destination.";
  if (!pack) errors.package = "Please select a package.";
  else if (!errors.destination && pack.destination !== destination) {
    errors.package = `"${pack.name}" is a ${pack.destination} package. Choose a matching destination.`;
  }

  if (!validDate(travelDate)) errors.travelDate = "Choose a travel date from today up to 2 years ahead.";
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) {
    errors.travellers = "Travellers must be a whole number from 1 to 20.";
  }
  if (!catalog.travelTypes.includes(travelType)) errors.travelType = "Select a valid travel type.";
  if (message.length > 1000) errors.message = "Special request must be under 1000 characters.";

  if (Object.keys(errors).length) throw new HttpError(400, "Please correct the errors below.", errors);

  const booking = db.insert("bookings", {
    reference: makeReference(),
    userId: user ? user.id : null,
    name, email, phone, destination,
    package: pack.name,
    travelType, travelDate, travellers, message,
    pricePerPerson: pack.price,
    totalPrice: pack.price * travellers,
    days: pack.days,
    status: "pending", // pending -> (agent confirms) -> confirmed / cancelled
  });

  return { status: 201, data: { message: "Booking request received.", booking } };
}

function list({ user }) {
  const mine = db.filter("bookings", (b) => b.userId === user.id).reverse();
  return { data: { bookings: mine } };
}

function cancel({ params, user }) {
  const booking = db.find("bookings", (b) => b.id === params.id);
  if (!booking || booking.userId !== user.id) throw new HttpError(404, "Booking not found.");
  if (booking.status === "cancelled") throw new HttpError(409, "This booking is already cancelled.");
  const updated = db.update("bookings", booking.id, { status: "cancelled" });
  return { data: { message: "Booking cancelled.", booking: updated } };
}

module.exports = { create, list, cancel };
