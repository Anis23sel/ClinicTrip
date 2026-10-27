"use client";

import { useCallback, useEffect, useState } from "react";

export interface FavoriteClinic {
  id: string;
  name: string;
  city: string;
  country: string;
  image: string | null;
  rating: number | null;
  reviewCount: number;
}

interface UsePatientFavoritesOptions {
  includeClinicDetails?: boolean;
}

export function usePatientFavorites({ includeClinicDetails = false }: UsePatientFavoritesOptions = {}) {
  const [isPatient, setIsPatient] = useState(false);
  const [favoriteClinicIds, setFavoriteClinicIds] = useState<Set<string>>(() => new Set());
  const [pendingClinicIds, setPendingClinicIds] = useState<Set<string>>(() => new Set());
  const [clinics, setClinics] = useState<FavoriteClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/favorites${includeClinicDetails ? "?details=true" : ""}`, {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            setIsPatient(false);
            setFavoriteClinicIds(new Set());
            setClinics([]);
          }
          return;
        }

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "We couldn't load your saved clinics.");

        if (!cancelled) {
          setIsPatient(true);
          setFavoriteClinicIds(new Set((result.favoriteClinicIds || []).map(String)));
          setClinics((result.clinics || []) as FavoriteClinic[]);
        }
      } catch {
        if (!cancelled) setError("We couldn't load your saved clinics. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadFavorites();
    return () => { cancelled = true; };
  }, [includeClinicDetails]);

  const toggleFavorite = useCallback(async (clinicId: string | number) => {
    const id = String(clinicId);
    if (!isPatient || pendingClinicIds.has(id)) return;

    const wasFavorite = favoriteClinicIds.has(id);
    setError("");
    setPendingClinicIds((current) => new Set(current).add(id));
    setFavoriteClinicIds((current) => {
      const next = new Set(current);
      if (wasFavorite) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      const response = await fetch("/api/favorites", {
        method: wasFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId: id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn't update your saved clinics.");
    } catch {
      setFavoriteClinicIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.add(id);
        else next.delete(id);
        return next;
      });
      setError("We couldn't update your saved clinics. Please try again.");
    } finally {
      setPendingClinicIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }, [favoriteClinicIds, isPatient, pendingClinicIds]);

  return { isPatient, favoriteClinicIds, pendingClinicIds, clinics, loading, error, toggleFavorite };
}
