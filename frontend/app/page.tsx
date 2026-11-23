import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col bg-zinc-600 items-center justify-center w-full max-w-2xl max-h-120 flex-1 px-20 text-center rounded-xl">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome to Donazion!
        </h1>

        <div className="flex flex-row items-center justify-center gap-3 mt-10">
          <div className="bg-purple-500 rounded w-40 h-12 flex items-center justify-center hover:bg-purple-600 transition hover:scale-105">
            <Link href="/Login" className="text-white text-lg font-semibold">
              Login
            </Link>
          </div>
          <div className="bg-red-500 rounded w-40 h-12 flex items-center justify-center hover:bg-red-600 transition hover:scale-105">
            <Link href="/organization" className="text-white text-lg font-semibold">
              Organization
            </Link>
          </div>
          <div className="bg-blue-500 rounded w-40 h-12 flex items-center justify-center hover:bg-blue-600 transition hover:scale-105">
            <Link href="/center" className="text-white text-lg font-semibold">
              Donation Center
            </Link>
          </div>
          <div className="bg-green-500 rounded w-40 h-12 flex items-center justify-center hover:bg-green-600 transition hover:scale-105">
            <Link href="/donate" className="text-white text-lg font-semibold">
              Donate
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
