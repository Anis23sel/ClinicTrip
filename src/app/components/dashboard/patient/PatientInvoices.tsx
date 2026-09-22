import {
  FileText,
  Info,
} from "lucide-react";
import { useState } from "react";
import AccommodationInvoice from "./AccommodationInvoice";
import ProcessingFeeInvoice from "./ProcessingFeeInvoice";

export default function PatientInvoices() {
  const [paymentMessage, setPaymentMessage] = useState("");

  return (
    <section aria-labelledby="invoices-heading">
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Payments
        </p>
        <h2 id="invoices-heading" className="text-2xl font-bold">
          Invoices
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find your ClinicTrip invoices here. Surgery payment is handled
          separately at the clinic when you arrive.
        </p>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-border bg-card p-4">
        <Info className="mt-0.5 shrink-0 text-primary" size={20} />
        <p className="text-sm leading-6 text-muted-foreground">
          The processing fee is paid before your trip and deducted from the
          surgery price. The remaining surgery balance is paid at arrival.
        </p>
      </div>

      {paymentMessage && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {paymentMessage} This is a static demo payment action for now.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ProcessingFeeInvoice
          onProceed={() => setPaymentMessage("Processing fee payment selected.")}
        />
        <AccommodationInvoice
          onProceed={() => setPaymentMessage("Accommodation payment selected.")}
        />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <FileText className="mx-auto mb-3 text-muted-foreground" size={30} />
        <h3 className="text-center font-semibold">Surgery balance</h3>
        <div className="mx-auto mt-4 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>Total surgery price</span>
            <span>€2,500.00</span>
          </div>
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>Processing fee paid now</span>
            <span>- €40.00</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
            <span>Payable at clinic</span>
            <span>€2,460.00</span>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          The remaining surgery amount will be paid directly to the clinic when
          you arrive.
        </p>
      </div>
    </section>
  );
}