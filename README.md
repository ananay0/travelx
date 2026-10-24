# TravelX - Travel Agency Website (Full Stack)

Frontend: HTML, CSS, JavaScript (`public/`)  
Backend: Node.js server with a JSON-file database (`server/`)  
No `npm install` needed - it uses only what is built into Node.js.

## Run it on your laptop (Windows + VS Code)

1. Install Node.js (LTS) from https://nodejs.org  (version 18 or newer).
2. Open this folder in VS Code.  Open a terminal: **Terminal > New Terminal**.
3. Type:  `npm start`
4. Open **http://localhost:3000** in your browser.
5. Stop the server with **Ctrl + C**.

Do NOT double-click the HTML files. Login, booking and contact need the server.
(If you do, a yellow warning bar tells you what to do.)

## Open it on your phone

1. Phone and laptop must be on the **same Wi-Fi**.
2. After `npm start`, the terminal prints a line like `http://192.168.1.5:3000`. Type that address into your phone's browser.
3. If it does not open, Windows Firewall may be blocking Node.js: allow "Node.js JavaScript Runtime" on Private networks.

To put the site on the internet for everyone, host it on a Node.js host (for example Render or Railway). Set the start command to `npm start`. Note: free hosts may erase `data/db.json` on restart, so use a real database (see "Next steps") before real use.

## Folder map

```
travelx/
  package.json
  public/            <- the website the visitor sees
    *.html  css/  js/  images/
  server/            <- the backend
    server.js        starts the server, serves public/ files
    router.js        URL -> controller (e.g. POST /api/bookings)
    controllers/     auth, booking, contact, catalog logic
    db.js            reads/writes data/db.json
    catalog.js       destinations + packages + prices
    utils/           validators, password hashing, tokens
  data/db.json       created automatically: users, bookings, messages, subscribers
  tests/             npm test
```

## API

| Method | URL | What it does |
|---|---|---|
| GET | /api/packages | packages for the booking form |
| POST | /api/auth/register | create account |
| POST | /api/auth/login | log in, returns a token |
| GET | /api/auth/me | current user (login needed) |
| POST | /api/bookings | save a booking (login optional) |
| GET | /api/bookings | my bookings (login needed) |
| POST | /api/bookings/:id/cancel | cancel my booking |
| POST | /api/contact | save a contact message |
| POST | /api/newsletter | subscribe |

## Where is my data?

Open `data/db.json` in VS Code to see every user (password is hashed), booking, message and subscriber.

## Honest limitations

- Bookings and messages are **saved**, not emailed. Nobody is notified automatically.
- There is **no payment**. Booking status stays "pending"; there is no admin page to confirm it.
- No password reset ("Forgot password" shows a notice only).
- The JSON file database is for learning / small use. Not for many users at once.
- Images and fonts come from the internet (Unsplash, Google Fonts, Font Awesome), so the site looks plain offline.
- Dark mode code exists but there is no dark-mode button or CSS.
- The Google Map on the Contact page shows "New Delhi" only.

## Next steps (good for your portfolio)

Admin page to view/confirm bookings, email notifications (Nodemailer), switch to Express + MongoDB, deploy online.
