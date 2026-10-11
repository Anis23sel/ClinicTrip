"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Building, Globe, AlertCircle } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();

export default function Signup() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    userType: "patient" as "patient" | "clinic",
    name: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    website: "",
    country: "turkey",
    address: "",
    phone: "",
    cityId: "",
    terms: false,
  });

  const [cities, setCities] = useState<
    { id: string; city: string }[]
  >([]);

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, city")
        .order("city");

      if (error) {
        console.error("Error fetching Cities:", error);
        return;
      }

      setCities(data || []);
    };

    fetchCities();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.userType === "patient") {
      if (!formData.name.trim()) errors.name = "Full name is required.";
      if (!formData.gender) errors.gender = "Please select a gender.";
    } else {
      if (!formData.clinicName.trim()) errors.clinicName = "Clinic name is required.";
      if (!formData.country) errors.country = "Country is required.";
    }

    if (!formData.cityId) errors.cityId = "Please select a city.";
    if (!formData.address.trim()) errors.address = "Address is required.";
    
    // Phone number validation
    const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.password) errors.password = "Password is required.";
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match!";
    }
    if (!formData.terms) {
      errors.terms = "You must accept the terms and privacy policy.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please fix the errors below before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Create the authentication user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data.user) {
        setErrorMessage("Something went wrong creating your account.");
        return;
      }

      const userId = data.user.id;

      // Create the profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          role: formData.userType,
        })
        .select("id")
        .single();

      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }

      const profileId = profile.id;

      // Create patient record
      if (formData.userType === "patient") {
        const nameParts = formData.name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        const { error: patientError } = await supabase
          .from("patients")
          .insert({
            profile_id: profileId,
            first_name: firstName,
            last_name: lastName,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email,
          });

        if (patientError) {
          setErrorMessage(patientError.message);
          return;
        }

        router.push("/dashboard/patient");
      }

      // Create clinic record
      if (formData.userType === "clinic") {
        const { error: clinicError } = await supabase
          .from("clinics")
          .insert({
            profile_id: profileId,
            clinic_name: formData.clinicName,
            website: formData.website || null,
            address: formData.address,
            phone: formData.phone,
            country: formData.country,
            city_id: formData.cityId,
            email: formData.email,
          });

        if (clinicError) {
          setErrorMessage(clinicError.message);
          return;
        }

        router.push("/dashboard/clinic");
      }

    } catch (error) {
      console.error("Signup failed:", error);
      setErrorMessage("Something went wrong, Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            ClinicTrip
          </Link>

          <h2 className="mt-6 text-3xl font-bold">
            Create an account
          </h2>

          <p className="mt-2 text-muted-foreground">
            Join the Clinic Air community
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-error/30 bg-error-background p-3 text-sm text-error-foreground">
            <AlertCircle size={18} className="shrink-0 text-error" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* User Type */}
            <div>
              <label className="mb-2 block font-medium">
                I am a: <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(["patient", "clinic"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        userType: type,
                      });
                      setErrorMessage(null);
                      setFieldErrors({});
                    }}
                    className={`rounded-lg border-2 px-4 py-2 capitalize transition-all ${
                      formData.userType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Fields */}
            {formData.userType === "patient" ? (
              <>
                {/* Full Name */}
                <div>
                  <label className="mb-2 block font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      className={`w-full rounded-lg border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                        fieldErrors.name ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                      }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block font-medium">
                    Gender <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value });
                      if (fieldErrors.gender) setFieldErrors({ ...fieldErrors, gender: "" });
                    }}
                    className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                      fieldErrors.gender ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {fieldErrors.gender && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.gender}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Clinic Name */}
                <div>
                  <label className="mb-2 block font-medium">
                    Clinic Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Building
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="text"
                      placeholder="Enter clinic name"
                      value={formData.clinicName}
                      onChange={(e) => {
                        setFormData({ ...formData, clinicName: e.target.value });
                        if (fieldErrors.clinicName) setFieldErrors({ ...fieldErrors, clinicName: "" });
                      }}
                      className={`w-full rounded-lg border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                        fieldErrors.clinicName ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                      }`}
                    />
                  </div>
                  {fieldErrors.clinicName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.clinicName}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block font-medium">
                    Country <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      if (fieldErrors.country) setFieldErrors({ ...fieldErrors, country: "" });
                    }}
                    className={`w-full rounded-lg border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 ${
                      fieldErrors.country ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                    }`}
                  >
                    <option value="turkey">Turkey</option>
                  </select>
                  {fieldErrors.country && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-error">
                      <AlertCircle size={12} /> {fieldErrors.country}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="mb-2 block font-medium">
                    Website
                  </label>

                  <div className="relative">
                    <Globe
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          website: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </>
            )}

            {/* City */}
            <div>
              <label className="mb-2 block font-medium">
                City <span className="text-red-500">*</span>
              </label>

              <select
                value={formData.cityId}
                onChange={(e) => {
                  setFormData({ ...formData, cityId: e.target.value });
                  if (fieldErrors.cityId) setFieldErrors({ ...fieldErrors, cityId: "" });
                }}
                className={`w-full rounded-lg border bg-input-background px-4 py-3 text-black focus:outline-none focus:ring-2 ${
                  fieldErrors.cityId ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                }`}
              >
                <option value="" className="text-black">
                  Select city
                </option>

                {cities.map((city) => (
                  <option
                    key={city.id}
                    value={city.id}
                    className="text-black"
                  >
                    {city.city}
                  </option>
                ))}
              </select>
              {fieldErrors.cityId && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.cityId}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block font-medium">
                Address <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Building
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="text"
                  placeholder="Enter clinic address"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: "" });
                  }}
                  className={`w-full rounded-lg border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                    fieldErrors.address ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                  }`}
                />
              </div>
              {fieldErrors.address && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.address}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block font-medium">
                Phone <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                  }}
                  className={`w-full rounded-lg border bg-input-background py-3 px-4 focus:outline-none focus:ring-2 ${
                    fieldErrors.phone ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block font-medium">
                Email <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                  }}
                  className={`w-full rounded-lg border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                    fieldErrors.email ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block font-medium">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                  className={`w-full rounded-lg border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                    fieldErrors.password ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                  }}
                  className={`w-full rounded-lg border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                    fieldErrors.confirmPassword ? "border-error focus:ring-error" : "border-border focus:ring-ring"
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => {
                    setFormData({ ...formData, terms: e.target.checked });
                    if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: "" });
                  }}
                  className="mt-1 h-4 w-4 rounded border-border"
                />

                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="mt-1 flex items-center gap-1 text-xs text-error">
                  <AlertCircle size={12} /> {fieldErrors.terms}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}