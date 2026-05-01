export const contactFormFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "machineInterest",
  "message",
] as const;

export type ContactFormField = (typeof contactFormFields)[number];

export type ContactFormValues = Record<ContactFormField, string>;

export type ContactFormErrors = Partial<Record<ContactFormField, string>>;

export const initialContactFormValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  machineInterest: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'.-]{1,39}$/;

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
    firstName: normalizeInline(toText(input.firstName)),
    lastName: normalizeInline(toText(input.lastName)),
    email: normalizeInline(toText(input.email)).toLowerCase(),
    phone: normalizeInline(toText(input.phone)),
    machineInterest: normalizeInline(toText(input.machineInterest)),
    message: normalizeMultiline(toText(input.message)),
  };
}

export function validateContactForm(values: ContactFormValues) {
  const errors: ContactFormErrors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.firstName) {
    errors.firstName = "First name is required.";
  } else if (!NAME_PATTERN.test(values.firstName)) {
    errors.firstName = "Please enter a valid first name.";
  }

  if (values.lastName && !NAME_PATTERN.test(values.lastName)) {
    errors.lastName = "Please enter a valid last name.";
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
