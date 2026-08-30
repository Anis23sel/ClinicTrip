"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Building, Globe } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();

export default function SignupForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!formData.terms) {
    alert("Please accept the Terms of Service and Privacy Policy.");
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
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("Something went wrong creating your account.");
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
      alert(profileError.message);
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
        alert(patientError.message);
        return;
      }

    router.push("/dashboard/patient");
  }

  // Create clinic record
  if (formData.userType === "clinic") {
    console.log("Selected city ID:", formData.cityId);
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
        alert(clinicError.message);
        return;
      }

    router.push("/dashboard/clinic");
  }

  } catch (error) {
    console.error("Signup failed:", error);
    alert("Something went wrong, Please try again.");
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

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type */}
            <div>
              <label className="mb-2 block font-medium">
                I am a:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(["patient", "clinic"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        userType: type,
                      })
                    }
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
        Full Name
      </label>

      <div className="relative">
        <User
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          required
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    {/* Gender */}
    <div>
      <label className="mb-2 block font-medium">
        Gender
      </label>

      <select
        required
        value={formData.gender}
        onChange={(e) =>
          setFormData({
            ...formData,
            gender: e.target.value,
          })
        }
        className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </div>
  </>
) : (
              <>
                {/* Clinic Name */}
                <div>
                  <label className="mb-2 block font-medium">
                    Clinic Name
                  </label>

                  <div className="relative">
                    <Building
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="text"
                      required
                      placeholder="Enter clinic name"
                      value={formData.clinicName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clinicName: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block font-medium">
                    Country
                  </label>

                  <select
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        country: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    
                    <option value="turkey">Turkey</option>
                  </select>
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
    City
  </label>

  <select
    required
    value={formData.cityId}
    onChange={(e) =>
      setFormData({
        ...formData,
        cityId: e.target.value,
      })
    }
    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-ring"
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
</div>

            {/* Address */}
<div>
  <label className="mb-2 block font-medium">
    Address
  </label>

  <div className="relative">
    <Building
      size={20}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    />

    <input
      type="text"
      required
      placeholder="Enter clinic address"
      value={formData.address}
      onChange={(e) =>
        setFormData({
          ...formData,
          address: e.target.value,
        })
      }
      className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
</div>

{/* Phone */}
<div>
  <label className="mb-2 block font-medium">
    Phone
  </label>

  <div className="relative">
    <input
      type="tel"
      required
      placeholder="Enter clinic phone number"
      value={formData.phone}
      onChange={(e) =>
        setFormData({
          ...formData,
          phone: e.target.value,
        })
      }
      className="w-full rounded-lg border border-border bg-input-background py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
</div>

            {/* Email */}
            <div>
              <label className="mb-2 block font-medium">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block font-medium">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block font-medium">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="password"
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terms: e.target.checked,
                    })
                  }
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