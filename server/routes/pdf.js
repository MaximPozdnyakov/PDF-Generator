const express = require("express");
const router = express.Router();
const fs = require("fs");
const pdf = require("html-pdf");
const pdfOptions = {
  format: "A4",
  base: "http://localhost:3000/",
};
const { parse } = require("node-html-parser");
const getPdfFieldsWithData = require("../helpers/getPdfFieldsWithData");

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

const renderCompanyPage = (data, parsedHtml, fields) => {
  fields.forEach((field) => {
    if (
      !(
        data.company_page &&
        data.company_page[field] &&
        data.company_page[field].status == "ok"
      )
    ) {
      parsedHtml.querySelectorAll(`.${field}_status`).forEach((el) => {
        el.classList.replace(`icon-check ${field}_status`, "icon-cancel");
      });
      parsedHtml.querySelectorAll(`.${field}_description`).forEach((el) => {
        el.classList.replace(`${field}_description`, "hidden");
      });
      parsedHtml.querySelectorAll(`.${field}_icon`).forEach((el) => {
        el.setAttribute("xlink:href", "#icon-cross");
      });
    }
  });
};

router.get("/", (req, res) => {
  const parsedHtml = parse(html);

  const fieldsWithData = getPdfFieldsWithData(exampleData);
  fieldsWithData.forEach(([elementId, text]) =>
    insertTextToHTML(parsedHtml, elementId, text)
  );

  renderCompanyPage(exampleData, parsedHtml, [
    "reg_code_check",
    "name_check",
    "status_check",
  ]);

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
