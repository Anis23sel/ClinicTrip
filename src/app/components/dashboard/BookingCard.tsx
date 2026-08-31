"use client";

import React, { JSX, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import AccommodationTab from "../booking/AccommodationTab";
import TransferTab from "../booking/TransferTab";
import BookingInquiryModal from "../booking/BookingInquiryModal";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();

type Booking = {
  id: string | number;
  clinicId: string;
  clinicName: string;
  procedure: string;
  startDate: string;
  endDate: string;
  doctor: string;
  date: string;
  location: string;

  // Price can now be null until the clinic proposes one
  price: number | null;

  status:
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled";

  accommodation: string | null;
  inquiryCompleted: boolean;
  clinicDecision: boolean;
  patientDecision: boolean;
};

interface Props {
  booking: Booking;
}

const statusConfig: Record<
  Booking["status"],
  {
    color: string;
    icon: JSX.Element;
  }
> = {
  confirmed: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle size={16} />,
  },

  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock size={16} />,
  },

  completed: {
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle size={16} />,
  },

  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: <XCircle size={16} />,
  },
};

export default function BookingCard({
  booking,
}: Props) {
  const [expanded, setExpanded] =
    useState(false);

  const [inquiryOpen, setInquiryOpen] =
    useState(false);

  const [inquiryCompleted, setInquiryCompleted] =
    useState(booking.inquiryCompleted);

  const [cancelling, setCancelling] =
    useState(false);

  const [patientDecision, setPatientDecision] =
    useState(booking.patientDecision);

  const [accepting, setAccepting] =
    useState(false);

  const sampleAccommodations = [
    {
      id: "1",
      name: "Partner Hotel Premium",
      distance: "5 min from clinic",
      roomTypes: [
        {
          type: "Single Room",
          price: 60,
        },
        {
          type: "Double Bed Room",
          price: 80,
        },
        {
          type: "Suite",
          price: 120,
        },
      ],
    },

    {
      id: "2",
      name: "Partner Hotel Standard",
      distance: "10 min from clinic",
      roomTypes: [
        {
          type: "Single Room",
          price: 40,
        },
        {
          type: "Double Bed Room",
          price: 55,
        },
      ],
    },
  ];

  const [localBooking, setLocalBooking] =
    useState({
      doctorId: "",
      date: booking.date || "",
      accommodationId:
        sampleAccommodations[0]?.id || "",
      roomType:
        sampleAccommodations[0]?.roomTypes[0]
          ?.type || "",
      includeBreakfast: false,
      includeDinner: false,
      nights: 1,
      transferPackage: false,
    });

  // --------------------------------------------------
  // Cancel request
  // --------------------------------------------------

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmed) return;

    setCancelling(true);

    const { error } = await supabase
      .from("Patient_request")
      .delete()
      .eq("id", String(booking.id));

    if (error) {
      console.error(
        "Failed to cancel request:",
        error
      );

      alert(
        "We could not cancel this request. Please try again."
      );

      setCancelling(false);
      return;
    }

    window.location.reload();
  };

  // --------------------------------------------------
  // Accept request
  // --------------------------------------------------

  const handleAcceptRequest = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to accept this request?"
    );

    if (!confirmed) return;

    setAccepting(true);

    try {
      const response = await fetch(
        "/api/patient-requests/accept",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            requestId: String(booking.id),
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "We could not accept this request."
        );
      }

      setPatientDecision(true);
    } catch (error) {
      console.error(
        "Failed to accept request:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "We could not accept this request."
      );
    } finally {
      setAccepting(false);
    }
  };

  // --------------------------------------------------
  // Request status
  // --------------------------------------------------

  function getRequestStatus(
    booking: Booking
  ) {
    if (
      booking.clinicDecision &&
      booking.patientDecision
    ) {
      return {
        label: "Accepted",
        color:
          "bg-green-100 text-green-800",
        icon: <CheckCircle size={16} />,
      };
    }

    if (booking.clinicDecision) {
      return {
        label: "Clinic Accepted",
        color:
          "bg-blue-100 text-blue-800",
        icon: <CheckCircle size={16} />,
      };
    }

    if (booking.inquiryCompleted) {
      return {
        label: "Waiting for Clinic",
        color:
          "bg-yellow-100 text-yellow-800",
        icon: <Clock size={16} />,
      };
    }

    return {
      label: "Waiting for Inquiry",
      color:
        "bg-yellow-100 text-yellow-800",
      icon: <Clock size={16} />,
    };
  }

  const requestStatus =
    getRequestStatus({
      ...booking,
      inquiryCompleted,
      patientDecision,
    });

  return (
    <>
      {/* Inquiry Modal */}

      <BookingInquiryModal
        isOpen={inquiryOpen}
        onClose={() =>
          setInquiryOpen(false)
        }
        onInquiryCompleted={() => {
          setInquiryCompleted(true);
        }}
        clinicName={booking.clinicName}
        clinicId={booking.clinicId}
        requestId={String(booking.id)}
        surgeryName={booking.procedure}
        startDate={booking.startDate}
        endDate={booking.endDate}
      />

      {/* Card */}

      <div className="bg-card rounded-lg border border-border p-6">
        {/* Header */}

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">
              {booking.clinicName}
            </h3>

            <p className="text-muted-foreground">
              {booking.procedure}
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${requestStatus.color}`}
          >
            {requestStatus.icon}

            <span>
              {requestStatus.label}
            </span>
          </div>
        </div>

        {/* Information */}

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Doctor */}

          <div>
            <p className="text-sm text-muted-foreground">
              Doctor
            </p>

            <p className="font-medium">
              {booking.doctor}
            </p>
          </div>

          {/* Date */}

          <div>
            <p className="text-sm text-muted-foreground">
              Date
            </p>

            <p className="font-medium">
              {booking.date}
            </p>
          </div>

          {/* Price */}

          <div>
            <p className="text-sm text-muted-foreground">
              Price
            </p>

            <p className="font-medium text-primary">
              {booking.price !== null
                ? `$${booking.price.toLocaleString()}`
                : "TBD"}
            </p>
          </div>
        </div>

        {/* Accommodation */}

        {booking.accommodation && (
          <div className="bg-accent/30 rounded p-3 mb-4">
            <p className="text-sm font-medium">
              Accommodation Included
            </p>

            <p className="text-sm text-muted-foreground">
              {booking.accommodation}
            </p>
          </div>
        )}

        {/* Buttons */}

        <div className="flex gap-3">
          <Link
            href={`/bookings/${booking.id}`}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            View Details
          </Link>

          {booking.status === "pending" &&
            !inquiryCompleted && (
              <button
                type="button"
                onClick={() =>
                  setInquiryOpen(true)
                }
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Complete Inquiry
              </button>
            )}

          {booking.status === "pending" &&
            inquiryCompleted &&
            !booking.clinicDecision && (
              <button
                type="button"
                onClick={() =>
                  setInquiryOpen(true)
                }
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Contact the Clinic
              </button>
            )}

          {booking.status === "pending" &&
            inquiryCompleted &&
            booking.clinicDecision &&
            !patientDecision && (
              <button
                type="button"
                onClick={
                  handleAcceptRequest
                }
                disabled={accepting}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {accepting
                  ? "Accepting..."
                  : "Accept Request"}
              </button>
            )}

          {booking.status === "pending" && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-50"
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel"}
            </button>
          )}
        </div>

        {/* Manage Booking */}

        {booking.clinicDecision &&
          patientDecision && (
            <div className="mt-4">
              <button
                onClick={() =>
                  setExpanded((s) => !s)
                }
                className="text-sm font-medium text-primary hover:underline"
              >
                {expanded
                  ? "Hide"
                  : "Manage Booking"}
              </button>

              {expanded && (
                <div className="mt-3 space-y-4">
                  {/* Accommodation */}

                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center font-semibold">
                        1
                      </div>

                      <h4 className="font-semibold">
                        Accommodation
                      </h4>
                    </div>

                    <AccommodationTab
                      accommodations={
                        sampleAccommodations
                      }
                      booking={
                        localBooking as any
                      }
                      setBooking={
                        setLocalBooking as any
                      }
                    />
                  </div>

                  {/* Transfer */}

                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center font-semibold">
                        2
                      </div>

                      <h4 className="font-semibold">
                        Transfer
                      </h4>
                    </div>

                    <TransferTab
                      booking={
                        localBooking as any
                      }
                      setBooking={
                        setLocalBooking as any
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </>
  );
}