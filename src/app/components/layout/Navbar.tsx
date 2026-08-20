"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "flag-icons/css/flag-icons.min.css";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

export default function Navbar() {
  const supabase = createClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("USD");

  const [user, setUser] = useState<any>(null);
  const [dashboardPath, setDashboardPath] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const languageOptions = {
    EN: { flag: "gb", label: "English" },
    FR: { flag: "fr", label: "Français" },
    ES: { flag: "es", label: "Español" },
    TR: { flag: "tr", label: "Türkçe" },
    AR: { flag: "sa", label: "العربية" },
  } as const;

  const currencyOptions = {
    USD: { symbol: "$", label: "USD - $" },
    EUR: { symbol: "€", label: "EUR - €" },
    GBP: { symbol: "£", label: "GBP - £" },
    TRY: { symbol: "₺", label: "TRY - ₺" },
  } as const;

  const navLinks = [
    { href: "/about", label: "About us" },
  ];

  // Check the current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        // Get the user's role from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (profile?.role === "patient") {
          setDashboardPath("/dashboard/patient");
        } else if (profile?.role === "clinic") {
          setDashboardPath("/dashboard/clinic");
        } else if (profile?.role === "admin") {
          setDashboardPath("/dashboard/admin");
        }
      }

      setLoadingUser(false);
    };

    getUser();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        setDashboardPath(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setDashboardPath(null);
    setMobileMenuOpen(false);

    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo + Language + Currency */}
        <div className="flex items-center gap-6">
          <Link href="/" className="shrink-0">
            <span className="text-2xl font-bold text-primary">
              Clinic Trip
            </span>
          </Link>

          {/* Desktop Language */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLanguageMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent"
            >
              <span
                className={`fi fi-${
                  languageOptions[
                    language as keyof typeof languageOptions
                  ].flag
                }`}
              />

              <ChevronDown size={16} />
            </button>

            {languageMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 overflow-hidden rounded-lg border bg-card shadow-lg">
                {Object.entries(languageOptions).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code);
                      setLanguageMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent"
                  >
                    <span className={`fi fi-${lang.flag}`} />

                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Currency */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCurrencyMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent"
            >
              <span className="text-sm font-medium">
                {
                  currencyOptions[
                    currency as keyof typeof currencyOptions
                  ].symbol
                }
              </span>

              <ChevronDown size={16} />
            </button>

            {currencyMenuOpen && (
              <div className="absolute left-0 mt-2 w-40 overflow-hidden rounded-lg border bg-card shadow-lg">
                {Object.entries(currencyOptions).map(([code, curr]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code);
                      setCurrencyMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent"
                  >
                    <span>{curr.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 md:flex">
          <div className="h-5 w-px bg-border" />

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/search"
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Search
          </Link>

          <div className="h-5 w-px bg-border" />

          {/* Authentication */}
          {!loadingUser && (
            <>
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-foreground transition-colors hover:text-primary"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/signup"
                    className="rounded-lg border border-primary px-4 py-2 text-sm text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    Join us
                  </Link>
                </>
              ) : (
                <>
                  {dashboardPath && (
                    <Link
                      href={dashboardPath}
                      className="text-sm text-foreground transition-colors hover:text-primary"
                    >
                      Profile
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="rounded-lg border border-primary px-4 py-2 text-sm text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    Sign out
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-2 text-foreground md:hidden"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="space-y-3 px-4 py-4">

            <div className="flex gap-3">

              {/* Mobile Language */}
              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-input-background px-3 py-2">
                <Globe
                  size={16}
                  className="text-muted-foreground"
                />

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm outline-none"
                >
                  <option value="EN">English</option>
                  <option value="FR">Français</option>
                  <option value="ES">Español</option>
                  <option value="TR">Türkçe</option>
                  <option value="AR">العربية</option>
                </select>
              </div>

              {/* Mobile Currency */}
              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-input-background px-3 py-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex-1 border-none bg-transparent text-sm outline-none"
                >
                  <option value="USD">USD - $</option>
                  <option value="EUR">EUR - €</option>
                  <option value="GBP">GBP - £</option>
                  <option value="TRY">TRY - ₺</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground"
              >
                Start now
              </Link>

              {/* Mobile Authentication */}
              {!loadingUser && (
                <div className="flex gap-3 border-t border-border pt-2">

                  {!user ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 py-2 text-center text-foreground transition-colors hover:text-primary"
                      >
                        Sign in
                      </Link>

                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 rounded-lg border border-primary px-4 py-2 text-center text-primary"
                      >
                        Join us
                      </Link>
                    </>
                  ) : (
                    <>
                      {dashboardPath && (
                        <Link
                          href={dashboardPath}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground"
                        >
                          Profile
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="flex-1 rounded-lg border border-primary px-4 py-2 text-center text-primary"
                      >
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}