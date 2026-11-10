const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?<!\d)(?:\+\s?|\b00\s?)?(?:\d[\s().-]*){7,}\d(?!\d)/g;
const DATE_PATTERN =
  /^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})$/;

export function maskContactInformation(text: string) {
  return text
    .replace(EMAIL_PATTERN, "*****")
    .replace(PHONE_PATTERN, (match) =>
      DATE_PATTERN.test(match.trim()) ? match : "########"
    );
}
