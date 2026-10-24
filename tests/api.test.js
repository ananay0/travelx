// Run with:  npm test
process.env.TRAVELX_DATA_DIR = require("os").tmpdir() + "/travelx-test-" + Date.now();
process.env.TRAVELX_NO_RATELIMIT = "1";
const test = require("node:test");
const assert = require("node:assert");
const { start, server } = require("../server/server");

let base;
test.before(async () => { await start(0); base = "http://localhost:" + server.address().port; });
test.after(() => server.close());

const post = (path, body, token) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: JSON.stringify(body) });

const future = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const booking = { name: "Test User", email: "t@example.com", phone: "9876543210", destination: "Goa", package: "Goa Beach Tour", travelDate: future, travellers: 2 };

test("booking: server calculates the price", async () => {
  const r = await post("/api/bookings", booking);
  assert.equal(r.status, 201);
  assert.equal((await r.json()).booking.totalPrice, 19999 * 2);
});
test("booking: rejects mismatched destination/package and past dates", async () => {
  assert.equal((await post("/api/bookings", { ...booking, destination: "Paris" })).status, 400);
  assert.equal((await post("/api/bookings", { ...booking, travelDate: "2020-01-01" })).status, 400);
});
test("auth: register, login, wrong password, duplicate", async () => {
  const u = { name: "Asha Verma", email: "asha@example.com", password: "Travel@123" };
  assert.equal((await post("/api/auth/register", u)).status, 201);
  assert.equal((await post("/api/auth/register", u)).status, 409);
  assert.equal((await post("/api/auth/register", { ...u, email: "x@example.com", password: "weak" })).status, 400);
  assert.equal((await post("/api/auth/login", { email: u.email, password: "Wrong@123" })).status, 401);
  const ok = await post("/api/auth/login", u);
  assert.equal(ok.status, 200);
  const { token } = await ok.json();
  const mine = await fetch(base + "/api/bookings", { headers: { Authorization: "Bearer " + token } });
  assert.equal(mine.status, 200);
  assert.equal((await fetch(base + "/api/bookings")).status, 401);
});
test("contact + newsletter validate input", async () => {
  assert.equal((await post("/api/contact", { name: "A", email: "bad" })).status, 400);
  assert.equal((await post("/api/newsletter", { email: "ok@example.com" })).status, 201);
});
test("static server blocks path traversal", async () => {
  const r = await fetch(base + "/..%2Fserver%2Fconfig.js");
  assert.ok([403, 404].includes(r.status));
});
