/*=========================================
  SERVER.JS  -  start here:  node server/server.js   (or: npm start)

  1. Requests that start with /api/ go to the router (the backend)
  2. Everything else is served from the /public folder (the frontend)
=========================================*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("./config");
const { handleApi } = require("./router");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end("Method not allowed");
  }

  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch (e) {
    res.writeHead(400);
    return res.end("Bad request");
  }
  if (rel.endsWith("/")) rel += "index.html";

  // Safety: never allow files outside /public (blocks ../ tricks) or hidden files
  const full = path.normalize(path.join(config.PUBLIC_DIR, rel));
  const inside = full === config.PUBLIC_DIR || full.startsWith(config.PUBLIC_DIR + path.sep);
  if (!inside || path.basename(full).startsWith(".")) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(full, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(
        '<h1 style="font-family:sans-serif">404 - Page not found</h1><p style="font-family:sans-serif"><a href="/index.html">Go to TravelX home</a></p>'
      );
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(full).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-cache", // always check for updates while you are developing
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(full).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    handleApi(req, res, pathname);
  } else {
    serveStatic(req, res, pathname);
  }
});

function lanAddresses() {
  const list = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) list.push(net.address);
    }
  }
  return list;
}

function start(port = config.PORT) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, config.HOST, () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

if (require.main === module) {
  start()
    .then(() => {
      const port = server.address().port;
      console.log("\n  TravelX is running!\n");
      console.log(`  On this computer :  http://localhost:${port}`);
      lanAddresses().forEach((ip) => console.log(`  On your phone    :  http://${ip}:${port}   (same Wi-Fi)`));
      console.log("\n  Press Ctrl + C to stop.\n");
    })
    .catch((err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n  Port ${config.PORT} is already in use. Close the other program, or run on another port:`);
        console.error("    Windows (PowerShell):  $env:PORT=3001; npm start\n");
      } else {
        console.error(err);
      }
      process.exit(1);
    });
}

module.exports = { server, start };
