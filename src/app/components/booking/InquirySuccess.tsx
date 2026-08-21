"use client";

import { CheckCircle } from "lucide-react";

interface InquirySuccessProps {
  clinicName: string;
  onClose: () => void;
}

export default function InquirySuccess({ clinicName, onClose }: InquirySuccessProps) {
  return (
    <div className="space-y-4 p-8 text-center">
      <CheckCircle size={56} className="mx-auto text-green-500" />
      <h3 className="text-xl font-semibold">Inquiry Sent!</h3>
      <p className="text-muted-foreground">
        Your inquiry has been forwarded to <strong>{clinicName}</strong>. They
        will contact you shortly using the email address you provided.
      </p>
      <button
        onClick={onClose}
        className="mt-4 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
      >
        Close
      </button>
    </div>
  );
}