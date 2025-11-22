import type { Metadata } from "next";
import "./globals.css";
import "devextreme/dist/css/dx.light.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Case Study - User Management",
  description: "User and Order Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
