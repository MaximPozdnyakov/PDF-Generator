const express = require("express");
const router = express.Router();
const fs = require("fs");
const pdf = require("html-pdf");
const pdfOptions = { format: "A4" };
const { parse } = require("node-html-parser");

const html = fs.readFileSync("dist/pdf-full.html", "utf8");
const css = fs.readFileSync("dist/css/style.min.css", "utf8");
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

const fields = [
  ["profile_number", exampleData.company.profile_number],
  ["company_name", exampleData.company.name],
  ["company_registration_number", exampleData.company.registration_number],
  ,
  [
    "user_full_name",
    `${exampleData.user.first_name} ${exampleData.user.last_name}`,
  ],
  ["company_approved_at", exampleData.company.approved_at],
  ["company_country", exampleData.company.country],
  ["company_address", exampleData.company.address],
  ["company_incorporation_date", exampleData.company.incorporation_date],
  ["company_activity", exampleData.company.activity],
];

router.get("/", (req, res) => {
  const parsedHtml = parse(html);
  parsedHtml
    .querySelector("head")
    .insertAdjacentHTML("beforeend", `<style>${css}</style>`);

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
