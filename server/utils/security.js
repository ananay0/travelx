/*=========================================
  SECURITY HELPERS
  - password hashing (scrypt, built into Node)
  - login tokens (signed with HMAC-SHA256)
  - simple rate limiter
=========================================*/
const crypto = require("crypto");
const config = require("../config");

/*---------- PASSWORDS ----------*/
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt.toString("hex")}$${key.toString("hex")}`);
    });
  });
}

function verifyPassword(password, stored) {
  return new Promise((resolve) => {
    try {
      const [scheme, saltHex, keyHex] = String(stored).split("$");
      if (scheme !== "scrypt") return resolve(false);
      const expected = Buffer.from(keyHex, "hex");
      crypto.scrypt(password, Buffer.from(saltHex, "hex"), expected.length, (err, key) => {
        if (err) return resolve(false);
        resolve(crypto.timingSafeEqual(key, expected));
      });
    } catch (e) {
      resolve(false);
    }
  });
}

/*---------- TOKENS ----------*/
const b64 = (buf) => Buffer.from(buf).toString("base64url");

function signToken(payload, days) {
  const data = { ...payload, exp: Date.now() + days * 24 * 60 * 60 * 1000 };
  const body = b64(JSON.stringify(data));
  const sig = crypto.createHmac("sha256", config.SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", config.SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/*---------- RATE LIMIT ----------*/
const hits = new Map(); // key -> [timestamps]

function rateLimited(key, max, windowMs) {
  if (!config.RATE_LIMIT) return false;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, list] of hits) {
    if (!list.some((t) => now - t < 60 * 60 * 1000)) hits.delete(k);
  }
}, 10 * 60 * 1000).unref();

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, rateLimited };
