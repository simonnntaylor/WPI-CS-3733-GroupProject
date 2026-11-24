"use client";
// Organization dashboard (Figma: "Main Admin Panel").
// Runs in the browser, so it can fetch data after the page loads.
// (The tab title / metadata lives in ./layout.tsx, since Next.js doesn't allow
// metadata in "use client" files.)

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiGet } from "@/lib/api";

// What GET /organization/showDashboard sends back. Must match the ok({...})
// in backend/lambda/organization/showDashboard/index.ts.
type Center = {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  totalItems: number;
  totalValue: number;
};
type Category = {
  name: string;
  itemCount: number; // how many category items (e.g. Clothing: Shoes, Jacket = 2)
};
type OrgDashboard = {
  centers: Center[];
  categories: Category[];
};

// Formats a number as dollars, e.g. 176 -> "$176.00", 1234.5 -> "$1,234.50".
function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// Navy background with the faint box pattern from Figma, repeated across the
// whole screen (all the tiles in the design are the same box graphic).
const tiledBackground = {
  backgroundImage: "url(/organization/box-tile.svg)",
  backgroundSize: "379px 245px", // 369x235 tile + 10px gap, like the Figma grid
};

// Full-screen message, used while loading and if loading fails.
function StatusScreen({ message }: Readonly<{ message: string }>) {
  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-NAVY font-sf text-SECONDARY text-3xl font-semibold"
      style={tiledBackground}
    >
      {message}
    </div>
  );
}

// Small grey-blue button on each donation center card.
function CenterButton({ label }: Readonly<{ label: string }>) {
  return (
    <button
      type="button"
      className="h-[42px] w-[191px] rounded-[7px] bg-TERTIARY text-white text-2xl font-semibold whitespace-nowrap hover:brightness-110 transition"
    >
      {label}
    </button>
  );
}

export default function Organization() {
  // The dashboard from the backend (null until it arrives), and an error
  // message if the request failed.
  const [data, setData] = useState<OrgDashboard | null>(null);
  const [error, setError] = useState("");

  // Fetch the dashboard once when the page first loads. The empty [] at the
  // end means "run once", not on every re-render.
  useEffect(() => {
    apiGet<OrgDashboard>("organization/showDashboard")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  // e.g. "Unauthorized" if nobody is logged in.
  if (error) return <StatusScreen message={error} />;
  if (!data) return <StatusScreen message="Loading..." />;

  return (
    <div
      className="h-screen min-h-[600px] w-full p-[50px] flex bg-NAVY font-sans text-black"
      style={tiledBackground}
    >
      {/* Outer see-through box holding everything */}
      <div className="flex-1 min-h-0 p-[26px] flex gap-[26px] rounded-[41px] bg-gradient-to-b from-[rgba(193,205,236,0.4)] to-[rgba(153,160,179,0.4)]">
        {/* Left column: title card + categories */}
        <div className="w-[466px] shrink-0 flex flex-col gap-[23px]">
          {/* Title card */}
          <div className="h-[146px] shrink-0 px-[14px] flex flex-col justify-center rounded-[14px] bg-SECONDARY shadow-[0px_0px_8px_0px_rgba(0,0,0,0.6)] font-sf">
            <p className="text-[96px] leading-none font-black italic whitespace-nowrap">Donazion</p>
            <p className="text-[30px] font-light tracking-[10.2px] [font-stretch:132%] whitespace-nowrap">
              one box at a time
            </p>
          </div>

          {/* Categories panel */}
          <section className="flex-1 min-h-0 px-[14px] pt-[10px] pb-[14px] flex flex-col gap-[10px] rounded-[14px] bg-SECONDARY/75 shadow-[0px_0px_8px_0px_rgba(0,0,0,0.5)]">
            <h2 className="px-[5px] text-xl font-semibold">Categories</h2>
            <ul className="flex-1 min-h-0 flex flex-col gap-[27px] overflow-y-auto">
              {data.categories.length === 0 && (
                <li className="px-[5px] text-xl italic">No categories yet</li>
              )}
              {data.categories.map((category) => (
                <li key={category.name} className="relative h-[78px] shrink-0 px-4 py-4 bg-NAVY text-white">
                  <p className="text-2xl font-semibold">{category.name}</p>
                  {/* BUTTON (chevron + count): open this category's items.
                      Backend: categories / category items are their own use case
                      (not built yet). */}
                  <p className="absolute left-[162px] bottom-[10px] flex items-center text-xl font-semibold">
                    <Image src="/organization/chevron-right.svg" alt="" width={22} height={22} unoptimized />
                    {category.itemCount} {category.itemCount === 1 ? "Item" : "Items"}
                  </p>
                  {/* BUTTON (pencil): edit this category.
                      Backend: categories are their own use case (not built yet). */}
                  <button type="button" aria-label={`Edit ${category.name}`} className="absolute right-3 top-4">
                    <Image src="/organization/pencil-25.svg" alt="" width={25} height={25} unoptimized />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: donation centers panel */}
        <section className="flex-1 min-w-0 min-h-0 px-[30px] pt-[21px] pb-[30px] flex flex-col gap-[10px] rounded-[14px] bg-SECONDARY/75">
          <h2 className="text-2xl font-semibold">Donation Centers</h2>
          <ul className="flex-1 min-h-0 flex flex-col gap-[27px] overflow-y-auto">
            {data.centers.length === 0 && <li className="text-2xl italic">No donation centers yet</li>}
            {data.centers.map((center) => (
              <li
                key={center.name}
                className="min-h-[141px] shrink-0 px-[18px] py-3 flex justify-between gap-6 bg-NAVY text-white font-semibold"
              >
                {/* Left side: name, totals, buttons */}
                <div className="flex flex-col justify-between gap-3 min-w-0">
                  <div>
                    <p className="text-2xl truncate">{center.name}</p>
                    {/* Totals for this center (SUM over its inventory) */}
                    <p className="text-lg font-normal text-SECONDARY">
                      {center.totalItems.toLocaleString()} items &middot; {money(center.totalValue)}
                    </p>
                  </div>
                  <div className="flex gap-[131px]">
                    {/* BUTTON: "Show WishList": show this center's wish list.
                        Backend: not built yet. */}
                    <CenterButton label="Show WishList" />
                    {/* BUTTON: "Show Items": show this center's inventory.
                        Backend: not built yet. */}
                    <CenterButton label="Show Items" />
                  </div>
                </div>

                {/* Right side: address, coordinates, edit pencil */}
                <div className="shrink-0 flex flex-col justify-between items-end">
                  <div className="self-start">
                    <p className="text-2xl max-w-[340px]">{center.address}</p>
                    {center.latitude !== null && center.longitude !== null && (
                      <p className="mt-2 text-base">
                        @{center.latitude},{center.longitude}
                      </p>
                    )}
                  </div>
                  {/* BUTTON (pencil): edit this donation center.
                      Backend: not built yet. */}
                  <button type="button" aria-label={`Edit ${center.name}`}>
                    <Image src="/organization/pencil-44.svg" alt="" width={44} height={44} unoptimized />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
