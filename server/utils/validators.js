/*=========================================
  VALIDATORS  (the server never trusts the browser)
=========================================*/
const NAME = /^[A-Za-z][A-Za-z .'-]{1,58}[A-Za-z.]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[6-9]\d{9}$/;                       // 10 digit Indian mobile number
const PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

const clean = (v) => (typeof v === "string" ? v.trim() : "");

function name(v) { return NAME.test(clean(v)); }
function email(v) { const s = clean(v); return s.length <= 120 && EMAIL.test(s); }
function phone(v) { return PHONE.test(clean(v)); }
function password(v) { return typeof v === "string" && PASSWORD.test(v); }

module.exports = { clean, name, email, phone, password };
