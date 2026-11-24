import type { Metadata } from "next";

// The browser tab title for /center. It lives here instead of page.tsx because
// page.tsx is a "use client" component, and Next.js only allows `metadata`
// in server components.
export const metadata: Metadata = {
  title: "Donation Center - Donazion",
  description: "A donation platform for organizations and donation centers.",
};

// Just renders the page. Nothing else to add for now.
export default function CenterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
