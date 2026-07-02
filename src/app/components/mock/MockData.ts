export const mockrequests = [
  { id: 1, clinicName: "Istanbul Medical Center", procedure: "Rhinoplasty", doctor: "Dr. Mehmet Yilmaz", date: "May 15, 2026", location: "Istanbul, Turkey", price: 2500, status: "confirmed" as const, accommodation: "Partner Hotel Premium - 5 nights" },
  { id: 2, clinicName: "Bangkok Dental Excellence", procedure: "Dental Implants", doctor: "Dr. Somchai Wong", date: "June 20, 2026", location: "Bangkok, Thailand", price: 1200, status: "pending" as const, accommodation: null },
  { id: 3, clinicName: "Cancun Cosmetic Surgery", procedure: "Liposuction", doctor: "Dr. Maria Garcia", date: "March 10, 2026", location: "Cancun, Mexico", price: 2800, status: "completed" as const, accommodation: "Partner Hotel Standard - 3 nights" },
];

export const mockDocuments = [
  { id: 1, name: "Blood Test Results.pdf", uploadDate: "March 5, 2026" },
  { id: 2, name: "Medical History.pdf", uploadDate: "February 20, 2026" },
  { id: 3, name: "Prescription.pdf", uploadDate: "January 15, 2026" },
];

export default { mockrequests, mockDocuments };
