// api/nocache.js
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  try {

    const filePath = path.join(process.cwd(), "public", "index.html");
    const html = fs.readFileSync(filePath, "utf8");

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.send(html);

  } catch (err) {
    res.status(500).send("HTML yüklenemedi");
  }
};