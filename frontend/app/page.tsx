import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col bg-zinc-600 items-center justify-center w-full max-w-2xl max-h-120 flex-1 px-20 text-center rounded-xl">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome to Donazion!
        </h1>

        <div className="flex flex-col items-center justify-center mt-6">
          <div className="bg-red-500 rounded-full w-24 h-24 flex items-center justify-center">
            <a href="/donate" className="text-white text-lg font-semibold">
              Donate
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
