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
  try {
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
        parsedHtml.querySelectorAll(`.${field}_icon`).forEach((el) => {
          el.setAttribute("xlink:href", "#icon-cross");
        });
      }
    });
  } catch (e) {}
};

const renderIdentificationPage = (data, parsedHtml) => {
  try {
    const { identification_page: page } = data;
    if (!(page && page.status == "ok")) {
      parsedHtml.querySelectorAll(".identification_status").forEach((el) => {
        el.classList.replace("icon-check identification_status", "icon-cancel");
      });
      parsedHtml.querySelectorAll(".identification_icon").forEach((el) => {
        el.setAttribute("xlink:href", "#icon-cross");
      });
      parsedHtml
        .querySelectorAll(".identification_status_text")
        .forEach((el) => {
          el.innerHTML = "Unapproved";
          el.setAttribute("style", "color: #F05A5C;");
        });
    }
    parsedHtml.querySelectorAll(".identification_veriff_link").forEach((el) => {
      el.setAttribute("href", page ? page.veriff_link || "-" : "-");
    });
  } catch (e) {}
};

const renderAttachmentPage = (data, parsedHtml) => {
  try {
    const { attachment_page: page } = data;
    parsedHtml.querySelectorAll(".attachment_document_1").forEach((el) => {
      el.setAttribute(
        "src",
        page && page.document && page.document[0]
          ? page.document[0] || "-"
          : "-"
      );
    });
    parsedHtml.querySelectorAll(".attachment_document_2").forEach((el) => {
      el.setAttribute(
        "src",
        page && page.document && page.document[0]
          ? page.document[1] || "-"
          : "-"
      );
    });
    parsedHtml.querySelectorAll(".attachment_face").forEach((el) => {
      el.setAttribute("src", page && page.face ? page.face : "-");
    });
  } catch (e) {}
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
  renderIdentificationPage(exampleData, parsedHtml);
  renderAttachmentPage(exampleData, parsedHtml);

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
