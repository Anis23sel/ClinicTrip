import {
  ArrowDown,
  FileText,
  Info,
  ReceiptText,
} from "lucide-react";
import { useState } from "react";
import AccommodationInvoice from "./AccommodationInvoice";
import ProcessingFeeInvoice from "./ProcessingFeeInvoice";

export default function PatientInvoices() {
  const [paymentMessage, setPaymentMessage] = useState("");

  const printInvoice = (invoiceName: string) => {
    setPaymentMessage(`${invoiceName} is ready to print or save as a PDF.`);
    window.print();
  };

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

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-primary p-5 text-primary-foreground sm:col-span-1">
          <p className="text-sm text-primary-foreground/75">Total due now</p>
          <p className="mt-2 text-3xl font-bold">€415.00</p>
          <p className="mt-2 text-xs text-primary-foreground/75">
            Processing fee + accommodation
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Paid before arrival</p>
          <p className="mt-2 text-2xl font-bold">€40.00</p>
          <p className="mt-2 text-xs text-muted-foreground">Processing fee</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pay at clinic</p>
          <p className="mt-2 text-2xl font-bold">€2,460.00</p>
          <p className="mt-2 text-xs text-muted-foreground">Surgery balance</p>
        </div>
      </div>

      {paymentMessage && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {paymentMessage} This is a static demo payment action for now.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ProcessingFeeInvoice
          onProceed={() => setPaymentMessage("Processing fee payment selected.")}
          onDownload={() => printInvoice("Processing fee invoice")}
        />
        <AccommodationInvoice
          onProceed={() => setPaymentMessage("Accommodation payment selected.")}
          onDownload={() => printInvoice("Accommodation invoice")}
        />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 shrink-0 text-primary" size={22} />
          <div>
            <h3 className="font-semibold">Surgery balance at arrival</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your processing fee has already been taken off the surgery price.
            </p>
          </div>
        </div>
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
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ArrowDown size={14} />
          Keep this amount available for your arrival
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Payment history</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your recent ClinicTrip payment activity.</p>
          </div>
          <ReceiptText className="text-muted-foreground" size={21} />
        </div>
        <div className="divide-y divide-border">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">Processing fee</p>
              <p className="mt-1 text-xs text-muted-foreground">Invoice #CT-2401 · March 20, 2026</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">€40.00</p>
              <span className="text-xs text-yellow-700">Due</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">Accommodation</p>
              <p className="mt-1 text-xs text-muted-foreground">Invoice #CT-2402 · March 20, 2026</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">€375.00</p>
              <span className="text-xs text-yellow-700">Due</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">Surgery balance</p>
              <p className="mt-1 text-xs text-muted-foreground">Payable directly at the clinic on arrival</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">€2,460.00</p>
              <span className="text-xs text-muted-foreground">Not paid yet</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}