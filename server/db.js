/*=========================================
  DB.JS  -  a tiny database stored in data/db.json

  Collections (like tables):
    users, bookings, messages, subscribers

  This is fine for learning and small projects.
  For a real business you would swap this file for MongoDB / MySQL / PostgreSQL;
  the controllers only use the functions exported at the bottom.
=========================================*/
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("./config");

const FILE = path.join(config.DATA_DIR, "db.json");
const COLLECTIONS = ["users", "bookings", "messages", "subscribers"];

let state = null;

function emptyState() {
  const s = {};
  COLLECTIONS.forEach((c) => (s[c] = []));
  return s;
}

function load() {
  if (state) return;
  if (fs.existsSync(FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch (e) {
      // File is damaged: keep a copy and start fresh instead of crashing
      fs.copyFileSync(FILE, FILE + ".broken-" + Date.now());
      state = emptyState();
    }
  } else {
    state = emptyState();
  }
  COLLECTIONS.forEach((c) => {
    if (!Array.isArray(state[c])) state[c] = [];
  });
}

// Write to a temp file first, then rename: protects the data if the PC shuts down mid-write
function save() {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

function uid() {
  return crypto.randomUUID();
}

function all(collection) {
  load();
  return state[collection];
}

function find(collection, predicate) {
  return all(collection).find(predicate) || null;
}

function filter(collection, predicate) {
  return all(collection).filter(predicate);
}

function insert(collection, doc) {
  load();
  const record = { id: uid(), createdAt: new Date().toISOString(), ...doc };
  state[collection].push(record);
  save();
  return record;
}

function update(collection, id, patch) {
  load();
  const record = state[collection].find((r) => r.id === id);
  if (!record) return null;
  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  save();
  return record;
}

module.exports = { all, find, filter, insert, update, FILE };
