"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, DollarSign } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("USD");

  const navLinks = [
    { href: "/about", label: "About us" },
    {
      href: "/search?category=plastic-surgery",
      label: "Plastic surgeries",
    },
    {
      href: "/search?category=dental",
      label: "Dental",
    },
    {
      href: "/search?category=hair-transplant",
      label: "Hair Transplant",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-2xl font-bold text-primary">
            Clinic Trip
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 md:flex">
          {/* Language */}
          <div className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
            <Globe size={16} className="text-muted-foreground" />

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="cursor-pointer border-none bg-transparent text-sm outline-none"
            >
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
              <option value="TR">TR</option>
              <option value="AR">AR</option>
            </select>
          </div>

          {/* Currency */}
          <div className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
            <DollarSign size={16} className="text-muted-foreground" />

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="cursor-pointer border-none bg-transparent text-sm outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="TRY">TRY</option>
            </select>
          </div>

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
            Start now
          </Link>

          <div className="h-5 w-px bg-border" />

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
              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-input-background px-3 py-2">
                <Globe size={16} className="text-muted-foreground" />

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

              <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-input-background px-3 py-2">
                <DollarSign size={16} className="text-muted-foreground" />

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

              <div className="flex gap-3 border-t border-border pt-2">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}