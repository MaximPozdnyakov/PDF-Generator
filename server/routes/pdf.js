const express = require("express");
const router = express.Router();
const fs = require("fs");
const html = fs.readFileSync("dist/pdf-full.html", "utf8");
const css = fs.readFileSync("dist/css/style.min.css", "utf8");
const pdf = require("html-pdf");
const pdfOptions = { format: "A4" };
const { parse } = require("node-html-parser");

router.get("/", (req, res) => {
  const parsedHtml = parse(html);
  parsedHtml
    .querySelector("head")
    .insertAdjacentHTML("beforeend", `<style>${css}</style>`);

  pdf
    .create(parsedHtml.toString(), pdfOptions)
    .toStream(function (err, stream) {
      if (err) return console.log(err);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=SupplierProfile.pdf"
      );
      stream.pipe(res);
    });
});

module.exports = router;
