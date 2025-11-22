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
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* DevExpress lisans uyarı mesajını gizle */
            .dx-notification,
            .dx-notification-wrapper,
            [class*="dx-notification"],
            [class*="dx-toast"],
            [class*="dx-message"],
            div[style*="position: fixed"][style*="top"]:not([class*="dx-popup"]):not([class*="dx-overlay"]),
            div[style*="position: fixed"][style*="z-index"]:not([class*="dx-popup"]):not([class*="dx-overlay"]) {
              display: none !important;
              visibility: hidden !important;
            }
          `
        }} />
      </head>
      <body className="antialiased bg-white text-black">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
