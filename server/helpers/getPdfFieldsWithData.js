const getTableFieldsWithData = (data, fields) => {
  let fieldsWithData = []
  fields.map((field) => {
    fieldsWithData.push([`${field}_input`, data[field] && data[field].input]);
    fieldsWithData.push([`${field}_verified`, data[field] && data[field].verified]);
    fieldsWithData.push([`${field}_verified_at`, data[field] && data[field].verified_at]);
    fieldsWithData.push([`${field}_decision`, data[field] && data[field].decision]);
  })
  return fieldsWithData;
}

const getCompanyPageFieldsWithData = (data, fields) => {
  let fieldsWithData = []
  fields.map((field) => {
    fieldsWithData.push([`${field}_approved_at`, data.company_page && data.company_page[field] && data.company_page[field].approved_at]);
    fieldsWithData.push([`${field}_input`, data.company_page && data.company_page[field] && data.company_page[field].input]);
    fieldsWithData.push([`${field}_found`, data.company_page && data.company_page[field] && data.company_page[field].found]);
    fieldsWithData.push([`${field}_comment`, data.company_page && data.company_page[field] && data.company_page[field].comment]);
    fieldsWithData.push([`${field}_state`, data.company_page && data.company_page[field] && data.company_page[field].state]);
  })
  return fieldsWithData;
}

module.exports = (data) => {
  const {
    company,
    representative,
  } = data;

  const fields = [
    ["profile_number", company && company.profile_number],
    ["company_name", company && company.name],
    ["company_registration_number", company && company.registration_number],
    ["company_approved_at", company && company.approved_at],
    ["company_country", company && company.country],
    ["company_address", company && company.address],
    ["company_incorporation_date", company && company.incorporation_date],
  
    [
      "user_full_name",
      representative && `${representative.first_name} ${representative.last_name}`,
    ],

    ...getTableFieldsWithData(data, ["company_name", "representative_name", "verification_full_name", "agreement_kind", "bank_name"]),
    ...getCompanyPageFieldsWithData(data, ["reg_code_check", "name_check", "status_check"]),

    ["identification_veriff_link", data.identification_page.veriff_link],
    ["identification_verified_at", data.identification_page.verified_at],
    ["personal_first_name", data.identification_page.personal.first_name],
    ["personal_last_name", data.identification_page.personal.last_name],
    ["personal_id", data.identification_page.personal.id],
    ["personal_birth_date", data.identification_page.personal.birth_date],
    ["document_country", data.identification_page.document.country],
    ["document_type", data.identification_page.document.type],
    ["document_serial", data.identification_page.document.serial],
    ["document_expires_at", data.identification_page.document.expires_at],
  ];

  return fields;
};
