export const CONTACT_TOPICS = [
  {
    value: "general",
    label: "General question",
    category: "general",
    subject: "General question",
  },
  {
    value: "medical",
    label: "Medical treatment inquiry",
    category: "medical_treatment",
    subject: "Medical treatment inquiry",
  },
  {
    value: "clinic",
    label: "Clinic partnership",
    category: "partnership",
    subject: "Clinic partnership",
  },
  {
    value: "accommodation",
    label: "Accommodation partnership",
    category: "partnership",
    subject: "Accommodation partnership",
  },
  {
    value: "booking",
    label: "Booking and travel support",
    category: "booking_support",
    subject: "Booking and travel support",
  },
  {
    value: "technical",
    label: "Website or account support",
    category: "technical_support",
    subject: "Website or account support",
  },
  {
    value: "other",
    label: "Other",
    category: "other",
    subject: "",
  },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export type ContactSenderRole =
  | "guest"
  | "patient"
  | "clinic"
  | "accommodation";

export function isContactSenderRole(value: unknown): value is ContactSenderRole {
  return (
    value === "guest" ||
    value === "patient" ||
    value === "clinic" ||
    value === "accommodation"
  );
}
