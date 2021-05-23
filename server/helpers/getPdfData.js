module.exports = (data) => {
  const {
    company,
    representative,
    company_name,
    representative_name,
    verification_full_name,
    agreement_kind,
    bank_name,
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
  
    ["company_name_input", company_name && company_name.input],
    ["company_name_verified", company_name && company_name.verified],
    ["company_name_verified_at", company_name && company_name.verified_at],
    ["company_name_decision", company_name && company_name.decision],
  
    ["representative_name_input", representative_name && representative_name.input],
    ["representative_name_verified", representative_name && representative_name.verified],
    ["representative_name_verified_at", representative_name && representative_name.verified_at],
    ["representative_name_decision", representative_name && representative_name.decision],
  
    ["verification_full_name_input",verification_full_name && verification_full_name.input],
    ["verification_full_name_verified",verification_full_name && verification_full_name.verified],
    ["verification_full_name_verified_at",verification_full_name && verification_full_name.verified_at],
    ["verification_full_name_decision",verification_full_name && verification_full_name.decision],
  
    ["agreement_kind_input", agreement_kind && agreement_kind.input],
    ["agreement_kind_verified", agreement_kind && agreement_kind.verified],
    ["agreement_kind_verified_at", agreement_kind && agreement_kind.verified_at],
    ["agreement_kind_decision", agreement_kind && agreement_kind.decision],
  
    ["bank_name_input", bank_name && bank_name.input],
    ["bank_name_verified", bank_name && bank_name.verified],
    ["bank_name_verified_at", bank_name && bank_name.verified_at],
    ["bank_name_decision", bank_name && bank_name.decision],
  ];

  return fields;
};
