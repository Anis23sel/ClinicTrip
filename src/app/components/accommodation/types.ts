export type AccommodationAccount = {
  id: string;
  email: string;
  propertyName: string;
  contactName: string;
  phone: string;
  city: string;
  address: string;
  description: string;
};

export type AccommodationRoom = {
  id: string;
  name: string;
  price: number;
  available: number;
};
