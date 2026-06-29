"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "patient" as "patient" | "clinic" | "admin",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.userType === "patient") {
      router.push("/dashboard/patient");
    } else if (formData.userType === "clinic") {
      router.push("/dashboard/clinic");
    } else {
      router.push("/dashboard/admin");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            Clinic Air
          </Link>

          <h2 className="mt-6 text-3xl font-bold">
            Welcome back
          </h2>

          <p className="mt-2 text-muted-foreground">
            Sign in to your account
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

              <div className="grid grid-cols-3 gap-2">
                {(["patient", "clinic", "admin"] as const).map((type) => (
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
                  placeholder="Enter your password"
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

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">
                  Remember me
                </span>
              </label>

              <Link
                href="#"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}