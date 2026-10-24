/*=========================================
  CONTACT + NEWSLETTER CONTROLLER
=========================================*/
const db = require("../db");
const v = require("../utils/validators");
const { HttpError } = require("../utils/http");

function send({ body }) {
  const errors = {};
  const name = v.clean(body.name);
  const email = v.clean(body.email).toLowerCase();
  const phone = v.clean(body.phone);
  const subject = v.clean(body.subject);
  const message = v.clean(body.message);

  if (!v.name(name)) errors.name = "Enter a valid name.";
  if (!v.email(email)) errors.email = "Enter a valid email address.";
  if (!v.phone(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (subject.length < 3 || subject.length > 100) errors.subject = "Subject must be 3 to 100 characters.";
  if (message.length < 10 || message.length > 2000) errors.message = "Message must be 10 to 2000 characters.";

  if (Object.keys(errors).length) throw new HttpError(400, "Please correct the errors below.", errors);

  db.insert("messages", { name, email, phone, subject, message, status: "new" });
  return { status: 201, data: { message: "Message received. We will reply soon." } };
}

function subscribe({ body }) {
  const email = v.clean(body.email).toLowerCase();
  if (!v.email(email)) throw new HttpError(400, "Enter a valid email address.", { email: "Enter a valid email address." });
  if (db.find("subscribers", (s) => s.email === email)) {
    return { data: { message: "You are already subscribed. Thank you!" } };
  }
  db.insert("subscribers", { email });
  return { status: 201, data: { message: "Thank you for subscribing!" } };
}

module.exports = { send, subscribe };
