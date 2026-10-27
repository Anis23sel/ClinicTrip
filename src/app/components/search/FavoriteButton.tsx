"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  clinicName: string;
  isFavorite: boolean;
  isPending?: boolean;
  isCheckingAccount?: boolean;
  isPatient: boolean;
  onToggle: () => void;
}
// This component is a button that allows users to add or remove a clinic from their favorites. It takes in several props to determine its state and behavior, including the clinic name, whether it is currently a favorite, and whether the user is a patient. The button is disabled if an action is pending or if the account status is being checked. When clicked, it either toggles the favorite status or redirects non-patient users to the login page.
export default function FavoriteButton({ clinicName, isFavorite, isPending = false, isCheckingAccount = false, isPatient, onToggle }: FavoriteButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={isFavorite ? `Remove ${clinicName} from favorites` : `Add ${clinicName} to favorites`}
      aria-pressed={isFavorite}
      title={isCheckingAccount ? "Checking account..." : isPatient ? (isFavorite ? "Remove from favorites" : "Save clinic") : "Sign in as a patient to save clinics"}
      disabled={isPending || isCheckingAccount}
      onClick={(event) => {
        event.stopPropagation();
        if (!isPatient) {
          router.push("/login");
          return;
        }
        onToggle();
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-muted-foreground shadow-md transition hover:scale-105 hover:text-rose-600 disabled:cursor-wait disabled:opacity-60"
    >
      <Heart size={19} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
    </button>
  );
}
