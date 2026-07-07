export const contactFormFields = [
  "fullName",
  "country",
  "companyName",
  "companyAddress",
  "email",
  "phone",
  "machineInterest",
  "message",
] as const;

export type ContactFormField = (typeof contactFormFields)[number];

export type ContactFormValues = Record<ContactFormField, string>;

export type ContactFormErrors = Partial<Record<ContactFormField, string>>;

export const initialContactFormValues: ContactFormValues = {
  fullName: "",
  country: "",
  companyName: "",
  companyAddress: "",
  email: "",
  phone: "",
  machineInterest: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'.-]{1,59}$/;
const COUNTRY_PATTERN = /^[A-Za-z][A-Za-z\s'.()-]{1,59}$/;

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeInline(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeMultiline(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
}

export function normalizeContactForm(
  input: Partial<Record<ContactFormField, unknown>>,
): ContactFormValues {
  return {
    fullName: normalizeInline(toText(input.fullName)),
    country: normalizeInline(toText(input.country)),
    companyName: normalizeInline(toText(input.companyName)),
    companyAddress: normalizeMultiline(toText(input.companyAddress)),
    email: normalizeInline(toText(input.email)).toLowerCase(),
    phone: normalizeInline(toText(input.phone)),
    machineInterest: normalizeInline(toText(input.machineInterest)),
    message: normalizeMultiline(toText(input.message)),
  };
}

export function validateContactForm(values: ContactFormValues) {
  const errors: ContactFormErrors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.fullName) {
    errors.fullName = "Full name is required.";
  } else if (!NAME_PATTERN.test(values.fullName)) {
    errors.fullName = "Please enter a valid full name.";
  }

  if (!values.country) {
    errors.country = "Country is required.";
  } else if (!COUNTRY_PATTERN.test(values.country)) {
    errors.country = "Please select a valid country.";
  }

  if (values.companyName.length > 120) {
    errors.companyName = "Company name should stay under 120 characters.";
  }

  if (values.companyAddress.length > 300) {
    errors.companyAddress = "Company address should stay under 300 characters.";
  }

  if (!values.email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.phone) {
    errors.phone = "Phone number is required.";
  } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.phone = "Phone number should be 10 to 15 digits.";
  }

  if (!values.machineInterest) {
    errors.machineInterest = "Machine interest is required.";
  } else if (values.machineInterest.length < 3) {
    errors.machineInterest = "Please enter at least 3 characters.";
  }

  if (!values.message) {
    errors.message = "Message is required.";
  } else if (values.message.length < 20) {
    errors.message = "Please enter at least 20 characters.";
  } else if (values.message.length > 1200) {
    errors.message = "Message should stay under 1200 characters.";
  }

  return errors;
}

export function hasContactFormErrors(errors: ContactFormErrors) {
  return Object.values(errors).some(Boolean);
}
