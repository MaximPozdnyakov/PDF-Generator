const express = require("express");
const router = express.Router();
const fs = require("fs");
const pdf = require("html-pdf");
const pdfOptions = {
  format: "A4",
  base: "http://localhost:3000/",
};
const { parse } = require("node-html-parser");
const getPdfData = require("../helpers/getPdfData");

const html = fs.readFileSync("dist/pdf-full.html", "utf8");
const exampleData = JSON.parse(
  fs.readFileSync("server/data/pdf_example.json", "utf8")
);

const insertTextToHTML = (parsedHtml, elementClass, text) => {
  try {
    parsedHtml
      .querySelectorAll(`.${elementClass}`)
      .forEach((el) => (el.innerHTML = text ? text : "-"));
  } catch (e) {}
};

router.get("/", (req, res) => {
  const parsedHtml = parse(html);

  const fields = getPdfData(exampleData);
  fields.forEach(([elementId, text]) =>
    insertTextToHTML(parsedHtml, elementId, text)
  );

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
