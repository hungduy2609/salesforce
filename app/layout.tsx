import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "CRM Demo"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
