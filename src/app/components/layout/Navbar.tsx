"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "flag-icons/css/flag-icons.min.css";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  CircleUserRound,
  User as UserIcon,
  LogOut,
  Search,
  Bell,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

type NotificationItem = {
  requestId: string;
  name: string;
  procedure: string;
  createdAt: string;
};

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("USD");

  const [user, setUser] = useState<User | null>(null);
  const [dashboardPath, setDashboardPath] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const languageMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

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

  const navLinks = [{ href: "/about", label: "About us" }, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setLanguageMenuOpen(false);
      }

      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setCurrencyMenuOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }

      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Synchronisation des notifications non lues (is_read === false)
  useEffect(() => {
    let channel: any = null;

    const getUserAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoadingUser(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

      if (profile?.role === "patient") {
        setDashboardPath("/dashboard/patient");

        const { data: patient } = await supabase
          .from("patients")
          .select("id")
          .eq("profile_id", profile.id)
          .single();

        if (patient) {
          const fetchPatientNotifications = async () => {
            const { data: reqs } = await supabase
              .from("Patient_request")
              .select("id, id_clinic, procedure")
              .eq("id_patient", patient.id);

            if (reqs && reqs.length > 0) {
              const { data: messagesData } = await supabase
                .from("messages")
                .select("request_id, receiver_id, sender_id, is_read, created_at")
                .eq("receiver_id", user.id)
                .eq("is_read", false);

              const unreadItems: NotificationItem[] = [];
              for (const r of reqs) {
                const reqMsgs = (messagesData || []).filter((m) => m.request_id === r.id);
                if (reqMsgs.length > 0) {
                  reqMsgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                  const { data: clinic } = await supabase
                    .from("clinics")
                    .select("clinic_name")
                    .eq("id", r.id_clinic)
                    .single();

                  unreadItems.push({
                    requestId: r.id,
                    name: clinic?.clinic_name || "Clinic",
                    procedure: r.procedure || "Consultation",
                    createdAt: reqMsgs[0].created_at,
                  });
                }
              }
              setNotifications(unreadItems);
            } else {
              setNotifications([]);
            }
          };

          await fetchPatientNotifications();
        }
      } else if (profile?.role === "clinic") {
        setDashboardPath("/dashboard/clinic");

        const { data: clinic } = await supabase
          .from("clinics")
          .select("id")
          .eq("profile_id", profile.id)
          .single();

        if (clinic) {
          const fetchClinicNotifications = async () => {
            const { data: reqs } = await supabase
              .from("Patient_request")
              .select("id, id_patient, procedure")
              .eq("id_clinic", clinic.id);

            if (reqs && reqs.length > 0) {
              const { data: messagesData } = await supabase
                .from("messages")
                .select("request_id, receiver_id, sender_id, is_read, created_at")
                .eq("receiver_id", user.id)
                .eq("is_read", false);

              const unreadItems: NotificationItem[] = [];
              for (const r of reqs) {
                const reqMsgs = (messagesData || []).filter((m) => m.request_id === r.id);
                if (reqMsgs.length > 0) {
                  reqMsgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                  const { data: pat } = await supabase
                    .from("patients")
                    .select("first_name, last_name")
                    .eq("id", r.id_patient)
                    .single();

                  const patName = pat ? `${pat.first_name || ""} ${pat.last_name || ""}`.trim() : "Patient";

                  unreadItems.push({
                    requestId: r.id,
                    name: patName,
                    procedure: r.procedure || "Consultation",
                    createdAt: reqMsgs[0].created_at,
                  });
                }
              }
              setNotifications(unreadItems);
            } else {
              setNotifications([]);
            }
          };

          await fetchClinicNotifications();
        }
      } else if (profile?.role === "admin") {
        setDashboardPath("/dashboard/admin");
      }

      setLoadingUser(false);
    };

    getUserAndNotifications();

    // Set up a real-time subscription to the messages table to update notifications when new messages arrive
    const channelName = `navbar-messages-realtime-${Math.random()}`;
    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          getUserAndNotifications();
        }
      )
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        getUserAndNotifications();
      } else {
        setUser(null);
        setDashboardPath(null);
        setNotifications([]);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  // Handle notification click: close the menu, update local state, and navigate to the dashboard with the requestId query parameter
  const handleNotificationClick = (requestId: string) => {
    setNotificationMenuOpen(false);

    // Remove the clicked notification from the local state to reflect that it has been read
    setNotifications((prev) => prev.filter((n) => n.requestId !== requestId));

    if (dashboardPath) {
      router.push(`${dashboardPath}?requestId=${requestId}`);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDashboardPath(null);
    setNotifications([]);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="shrink-0">
            <span className="text-2xl font-bold text-primary">Clinic Trip</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/search"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search size={16} />
            <span>Search</span>
          </Link>
        </div>

        {/* Language + Currency + Notifications + Auth */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-1">
            {/* Languages */}
            <div ref={languageMenuRef} className="relative hidden h-full md:flex items-center">
              <button
                onClick={() => setLanguageMenuOpen((prev) => !prev)}
                className="flex h-full items-center gap-2 rounded-md px-2.5 transition hover:bg-accent focus:outline-none"
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
                <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg z-50">
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

            {/* Currency */}
            <div ref={currencyMenuRef} className="relative hidden h-full md:flex items-center">
              <button
                onClick={() => {
                  setCurrencyMenuOpen((prev) => !prev);
                  setLanguageMenuOpen(false);
                  setNotificationMenuOpen(false);
                }}
                className="flex h-full items-center gap-2 rounded-md px-2.5 transition hover:bg-accent focus:outline-none"
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
                <div className="absolute left-0 top-full mt-2 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg z-50">
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

          {/* Notifications Bell Dropdown */}
          {user && dashboardPath && (
            <div ref={notificationMenuRef} className="relative">
              <button
                onClick={() => {
                  setNotificationMenuOpen((prev) => !prev);
                  setLanguageMenuOpen(false);
                  setCurrencyMenuOpen(false);
                  setUserMenuOpen(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-accent focus:outline-none"
                title="Notifications"
              >
                <Bell size={18} className="text-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl z-50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <span className="text-xs text-muted-foreground">{notifications.length} unread</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        No new messages or notifications.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.requestId}
                          onClick={() => handleNotificationClick(n.requestId)}
                          className="w-full text-left flex items-start gap-3 p-3 transition hover:bg-accent block"
                        >
                          <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary shrink-0">
                            <MessageSquare size={14} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs font-semibold text-foreground">{n.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{n.procedure}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 self-center" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
                /* Profile dropdown menu */
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen((prev) => !prev);
                      setLanguageMenuOpen(false);
                      setCurrencyMenuOpen(false);
                      setNotificationMenuOpen(false);
                    }}
                    className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-foreground transition hover:bg-accent focus:outline-none"
                    title="User account"
                  >
                    <CircleUserRound
                      size={22}
                      strokeWidth={1.7}
                      className="text-primary"
                    />
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl z-50">
                      <div className="px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          Logged in as
                        </p>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.email}
                        </p>
                      </div>

                      <div className="my-1 h-px bg-border" />

                      {dashboardPath && (
                        <Link
                          href={dashboardPath}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <UserIcon size={16} />
                          My Profile
                        </Link>
                      )}

                      <div className="my-1 h-px bg-border" />

                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
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
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-center text-primary-foreground font-medium"
              >
                <Search size={16} />
                <span>Search</span>
              </Link>

              {!loadingUser && (
                <div className="border-t border-border pt-3">
                  {!user ? (
                    <div className="flex gap-3">
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
                  ) : (
                    <div className="w-full space-y-3 pt-1">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Logged in as</p>
                        <p className="truncate text-sm font-semibold text-foreground">{user.email}</p>
                      </div>

                      {dashboardPath && (
                        <Link
                          href={dashboardPath}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <UserIcon size={18} />
                          My Profile
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/20 dark:bg-red-900/10"
                      >
                        <LogOut size={18} />
                        Sign out
                      </button>
                    </div>
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