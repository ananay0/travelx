/*=========================================
  ROUTER.JS  -  maps URLs like POST /api/bookings to controller functions
=========================================*/
const db = require("./db");
const { HttpError, sendJson, readJson } = require("./utils/http");
const { verifyToken, rateLimited } = require("./utils/security");

const auth = require("./controllers/authController");
const booking = require("./controllers/bookingController");
const contact = require("./controllers/contactController");
const catalog = require("./controllers/catalogController");

const MIN = 60 * 1000;
const FORM_LIMIT = { bucket: "form", max: 20, windowMs: 15 * MIN };
const AUTH_LIMIT = { bucket: "auth", max: 30, windowMs: 15 * MIN };

// method, path, handler, options
//   auth: "required" = must be logged in, "optional" = logged-in user is used if present
const routes = [
  ["GET",  "/api/health",                 () => ({ data: { status: "ok", time: new Date().toISOString() } }), {}],
  ["GET",  "/api/destinations",           catalog.destinations,   {}],
  ["GET",  "/api/packages",               catalog.packages,       {}],

  ["POST", "/api/auth/register",          auth.register,          { limit: AUTH_LIMIT }],
  ["POST", "/api/auth/login",             auth.login,             { limit: AUTH_LIMIT }],
  ["GET",  "/api/auth/me",                auth.me,                { auth: "required" }],

  ["POST", "/api/bookings",               booking.create,         { auth: "optional", limit: FORM_LIMIT }],
  ["GET",  "/api/bookings",               booking.list,           { auth: "required" }],
  ["POST", "/api/bookings/:id/cancel",    booking.cancel,         { auth: "required" }],

  ["POST", "/api/contact",                contact.send,           { limit: FORM_LIMIT }],
  ["POST", "/api/newsletter",             contact.subscribe,      { limit: FORM_LIMIT }],
].map(([method, path, handler, options]) => {
  // turn "/api/bookings/:id/cancel" into a regular expression
  const keys = [];
  const regex = new RegExp(
    "^" + path.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "/?$"
  );
  return { method, regex, keys, handler, options };
});

function currentUser(req) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);
  return payload ? db.find("users", (u) => u.id === payload.uid) : null;
}

// Returns true if the request was an API request (and has been answered)
async function handleApi(req, res, pathname) {
  const matches = routes.filter((r) => r.regex.test(pathname));
  if (matches.length === 0) {
    sendJson(res, 404, { error: "API route not found." });
    return;
  }
  const route = matches.find((r) => r.method === req.method);
  if (!route) {
    res.setHeader("Allow", matches.map((r) => r.method).join(", "));
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const ip = req.socket.remoteAddress || "unknown";
    const { limit, auth: authMode } = route.options;
    if (limit && rateLimited(`${limit.bucket}:${ip}`, limit.max, limit.windowMs)) {
      throw new HttpError(429, "Too many requests. Please wait a few minutes and try again.");
    }

    const user = currentUser(req);
    if (authMode === "required" && !user) throw new HttpError(401, "Please log in first.");

    const params = {};
    const m = pathname.match(route.regex);
    route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));

    const body = req.method === "POST" || req.method === "PUT" || req.method === "PATCH" ? await readJson(req) : {};

    const result = await route.handler({ req, params, body, user });
    sendJson(res, result.status || 200, result.data);
  } catch (err) {
    if (err instanceof HttpError) {
      sendJson(res, err.status, { error: err.message, fields: err.fields });
    } else {
      console.error("Unexpected error:", err);
      sendJson(res, 500, { error: "Something went wrong on the server." });
    }
  }
}

module.exports = { handleApi };
