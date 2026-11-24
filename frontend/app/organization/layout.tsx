import type { Metadata } from "next";

// The browser tab title for /organization. It lives here instead of page.tsx
// because page.tsx is a "use client" component, and Next.js only allows
// `metadata` in server components.
export const metadata: Metadata = {
  title: "Organization - Donazion",
  description: "A donation platform for organizations and donation centers.",
};

// Just renders the page. Nothing else to add for now.
export default function OrganizationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
