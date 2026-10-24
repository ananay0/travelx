/*=========================================
  CONFIG.JS  -  all settings in one place
=========================================*/
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");

// Folder where the database file is kept (can be changed with an environment variable)
const DATA_DIR = process.env.TRAVELX_DATA_DIR || path.join(ROOT, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

// Secret key used to sign login tokens.
// 1) Use TRAVELX_SECRET if you set it   2) otherwise create one once and remember it
function loadSecret() {
  if (process.env.TRAVELX_SECRET) return process.env.TRAVELX_SECRET;
  const file = path.join(DATA_DIR, ".secret");
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim();
  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(file, secret);
  return secret;
}

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "0.0.0.0", // 0.0.0.0 = reachable from your phone on the same Wi-Fi
  PUBLIC_DIR: path.join(ROOT, "public"),
  DATA_DIR,
  SECRET: loadSecret(),
  TOKEN_DAYS_SHORT: 1,   // normal login lasts 1 day
  TOKEN_DAYS_LONG: 30,   // "Remember me" lasts 30 days
  RATE_LIMIT: process.env.TRAVELX_NO_RATELIMIT ? false : true,
};
