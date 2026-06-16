import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Demo Lightning Workspace",
  description: "A Salesforce Lightning inspired CRM demo built for automation practice."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
