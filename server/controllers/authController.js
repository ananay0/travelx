/*=========================================
  AUTH CONTROLLER  -  register, login, "who am I"
=========================================*/
const db = require("../db");
const config = require("../config");
const v = require("../utils/validators");
const { HttpError } = require("../utils/http");
const { hashPassword, verifyPassword, signToken } = require("../utils/security");

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

async function register({ body }) {
  const name = v.clean(body.name);
  const email = v.clean(body.email).toLowerCase();
  const password = body.password;
  const errors = {};

  if (!v.name(name)) errors.name = "Enter a valid name (letters and spaces, 3-60 characters).";
  if (!v.email(email)) errors.email = "Enter a valid email address.";
  if (!v.password(password)) {
    errors.password = "Password needs 8+ characters with uppercase, lowercase, a number and a special character.";
  }
  if (body.confirmPassword !== undefined && body.confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (Object.keys(errors).length) throw new HttpError(400, "Please correct the errors below.", errors);

  if (db.find("users", (u) => u.email === email)) {
    throw new HttpError(409, "This email is already registered. Please log in.", { email: "Email already registered." });
  }

  const user = db.insert("users", { name, email, passwordHash: await hashPassword(password) });
  return { status: 201, data: { message: "Account created successfully.", user: publicUser(user) } };
}

async function login({ body }) {
  const email = v.clean(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const fail = new HttpError(401, "Invalid email or password.");

  if (!v.email(email) || !password) throw fail;
  const user = db.find("users", (u) => u.email === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) throw fail;

  const days = body.remember ? config.TOKEN_DAYS_LONG : config.TOKEN_DAYS_SHORT;
  const token = signToken({ uid: user.id }, days);
  return { data: { message: "Login successful.", token, user: publicUser(user) } };
}

function me({ user }) {
  return { data: { user: publicUser(user) } };
}

module.exports = { register, login, me };
