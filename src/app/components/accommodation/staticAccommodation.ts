export type AccommodationAccount = {
  email: string;
  propertyName: string;
  contactName: string;
  phone: string;
  city: string;
  address: string;
  description: string;
};

const accountsKey = "clinictrip-accommodation-accounts";
export const accommodationSessionKey = "clinictrip-accommodation-session";
export const demoAccommodationEmail = "partner@clinictrip.com";

export const demoAccommodation: AccommodationAccount = {
  email: demoAccommodationEmail,
  propertyName: "The Bosphorus Stay",
  contactName: "Alex Morgan",
  phone: "+90 212 555 0142",
  city: "Istanbul, Turkey",
  address: "Cihangir, Beyoglu, Istanbul",
  description:
    "A calm, accessible boutique stay close to partner clinics and the heart of Istanbul.",
};

export function readAccommodationAccounts(): Record<string, AccommodationAccount> {
  const stored = window.localStorage.getItem(accountsKey);
  return stored ? (JSON.parse(stored) as Record<string, AccommodationAccount>) : {};
}

export function saveAccommodationAccount(account: AccommodationAccount) {
  const accounts = readAccommodationAccounts();
  accounts[account.email.toLowerCase()] = account;
  window.localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

export function getAccommodationAccount(email: string): AccommodationAccount | null {
  if (email.toLowerCase() === demoAccommodationEmail) return demoAccommodation;
  return readAccommodationAccounts()[email.toLowerCase()] ?? null;
}
