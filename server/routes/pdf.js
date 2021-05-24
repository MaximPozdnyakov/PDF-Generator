const express = require("express");
const router = express.Router();
const fs = require("fs");
const pdf = require("html-pdf");
const { parse } = require("node-html-parser");
const getPdfTextData = require("../helpers/getPdfTextData");

const pdfOptions = {
  format: "A4",
  base: `http:localhost:${process.env.PORT || 5000}/`,
};

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

const makePageUnapproved = (
  parsedHtml,
  pageName,
  statusText = "Unapproved"
) => {
  try {
    parsedHtml.querySelectorAll(`.${pageName}_status`).forEach((el) => {
      el.classList.replace(`icon-check ${pageName}_status`, "icon-cancel");
    });
    parsedHtml.querySelectorAll(`.${pageName}_icon`).forEach((el) => {
      el.setAttribute("xlink:href", "#icon-cross");
    });
    parsedHtml.querySelectorAll(`.${pageName}_status_text`).forEach((el) => {
      el.innerHTML = statusText;
      el.setAttribute("style", "color: #F05A5C;");
    });
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
      makePageUnapproved(parsedHtml, field);
    }
  });
};

const renderIdentificationPage = (data, parsedHtml) => {
  try {
    const { identification_page: page } = data;
    if (!(page && page.status == "ok")) {
      makePageUnapproved(parsedHtml, "identification");
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

const renderAgreementPage = (data, parsedHtml) => {
  const { agreement_page: page } = data;
  if (!(page && page.status == "ok")) {
    makePageUnapproved(parsedHtml, "agreement");
  }
};

const renderAmlPage = (data, parsedHtml) => {
  const { aml_page: page } = data;
  if (!(page && page.status == "ok")) {
    makePageUnapproved(parsedHtml, "aml", "Incomplete");
  }
};

router.post("/", (req, res) => {
  try {
    const pdfData = Object.keys(req.body).length ? req.body : exampleData;

    const parsedHtml = parse(html);

    const fieldsWithData = getPdfTextData(pdfData);
    fieldsWithData.forEach(([elementId, text]) =>
      insertTextToHTML(parsedHtml, elementId, text)
    );

    renderCompanyPage(pdfData, parsedHtml, [
      "reg_code_check",
      "name_check",
      "status_check",
    ]);
    renderIdentificationPage(pdfData, parsedHtml);
    renderAttachmentPage(pdfData, parsedHtml);
    renderAgreementPage(pdfData, parsedHtml);
    renderAmlPage(pdfData, parsedHtml);

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
  } catch (e) {}
});

module.exports = router;
