import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Organization - Donazion",
  description: "A donation platform for organizations and donation centers.",
};

export default function Organization() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col bg-zinc-600 items-center justify-center w-full max-w-2xl max-h-120 flex-1 px-20 text-center rounded-xl">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Organization page
        </h1>
        <Link href="/" className="text-blue-500 hover:underline mt-4">
          Go back to Home
        </Link>
      </main>
    </div>
  );
}
