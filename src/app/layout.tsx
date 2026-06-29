import type { Metadata } from "next";
import "./globals.css";

import Banner from "./components/layout/Banner";
import Navbar from "./components/layout/Navbar";

export const metadata: Metadata = {
  title: "Clinic Trip",
  description: "Medical Tourism Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Banner />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}