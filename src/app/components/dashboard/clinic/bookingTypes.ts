export type Booking = {
  id: string;
  patientName: string;
  patientEmail: string;
  procedure: string | null;
  startDate: string | null;
  endDate: string | null;
  finalStartDate: string | null;
  finalEndDate: string | null;
  inquiryCompleted: boolean;
  clinicDecision: boolean;
  patientDecision: boolean;
  price: number | null;
  recoveryDays: number;
  cancelledAt: string | null;
  cancelledBy: string | null;
  clinicTripPaidAt: string | null;
};

export type DateInput = {
  startDate: string;
  endDate: string;
};
