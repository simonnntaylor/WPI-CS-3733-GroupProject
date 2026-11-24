"use client";
// Runs in the browser, so it can fetch data after the page loads.
// (The tab title / metadata lives in ./layout.tsx, since Next.js doesn't allow
// metadata in "use client" files.)

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

// What GET /donationCenter/showDashboard sends back. Must match the ok({...})
// in backend/lambda/donationCenter/showDashboard/index.ts.
type InventoryItem = {
  id: string;
  category: string;
  name: string;
  price: number; // per unit, set by the donor
  quantity: number;
};
type Dashboard = {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  wishList: string[]; // category names
  inventory: InventoryItem[];
  totalItems: number;
  totalValue: number;
};

// Formats a number as dollars, e.g. 176 -> "$176.00", 1234.5 -> "$1,234.50".
function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// Full-screen navy background with a message in the middle. Used while the
// dashboard is loading, and if loading fails.
function StatusScreen({ message }: Readonly<{ message: string }>) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-NAVY font-sf text-SECONDARY text-3xl font-semibold">
      {message}
    </div>
  );
}

// Small light-blue button used in both panel footers (the 4 buttons at the
// bottom of the page). See the "BUTTON:" comments below for what each one does.
// None of the buttons do anything yet: each needs an onClick that calls the backend.
function PanelButton({ label }: Readonly<{ label: string }>) {
  return (
    <button
      type="button"
      className="h-11 px-6 rounded-xl bg-SECONDARY text-NAVY text-[17px] font-semibold whitespace-nowrap hover:brightness-95 transition"
    >
      {label}
    </button>
  );
}

export default function Center() {
  // The dashboard from the backend (null until it arrives), and an error
  // message if the request failed.
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  // Fetch the dashboard once when the page first loads. The empty [] at the
  // end means "run once", not on every re-render.
  // apiGet attaches the login token, so the backend knows which center this is.
  useEffect(() => {
    apiGet<Dashboard>("donationCenter/showDashboard")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  // e.g. "Donation center not found", or "Unauthorized" if nobody is logged in.
  if (error) return <StatusScreen message={error} />;
  if (!data) return <StatusScreen message="Loading..." />;

  return (
    <div className="h-screen min-h-[600px] w-full p-[50px] flex bg-NAVY font-sf text-white">
      {/* Main light panel */}
      <div className="flex-1 min-h-0 flex flex-col items-center gap-2.5 rounded-[32px] bg-SECONDARY">
        {/* Header */}
        <header className="w-full p-5 grid grid-cols-2 gap-2.5">
          <div className="flex items-center">
            <div className="flex flex-col">
              <p className="text-[55px] leading-[45px] font-black italic whitespace-nowrap">
                Donazion
              </p>
              <p className="text-[15px] font-light tracking-[6px] text-center [font-stretch:132%]">
                one box at a time
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-5">
            {/* Which center is logged in, and its address */}
            <div className="text-right">
              <p className="text-2xl font-bold">{data.name}</p>
              <p className="text-base">{data.address}</p>
            </div>
            {/* BUTTON: "Remove from Organization" (top right, red)
                What it does: permanently removes this donation center from Donazion.
                Backend: POST /removeDonationCenter  { token, confirm: true }
                TODO: ask "Are you sure?" first (that's what `confirm` is for),
                      then send the user back to the home page on success. */}
            <button
              type="button"
              className="h-full px-5 py-[7px] rounded-[32px] bg-[#eb4c46] text-xl leading-tight font-semibold whitespace-nowrap hover:brightness-95 transition"
            >
              Remove from Organization
            </button>
          </div>
        </header>

        {/* Line under the header */}
        <div className="self-stretch mx-[50px] h-px bg-black" />

        {/* Main content: wish list on the left, inventory on the right */}
        <main className="flex-1 min-h-0 w-full p-5 flex gap-[30px]">
          {/* Wish list panel */}
          <section className="w-[400px] shrink-0 flex flex-col gap-2.5 rounded-[32px] overflow-hidden">
            <div className="p-2.5 bg-TERTIARY">
              <h2 className="text-5xl leading-tight font-bold whitespace-nowrap">Wish list items</h2>
            </div>
            <ul className="flex-1 min-h-0 flex flex-col gap-[5px] overflow-y-auto">
              {/* The categories this center wants donated */}
              {data.wishList.length === 0 && (
                <li className="p-2.5 text-2xl italic">Nothing on the wish list yet</li>
              )}
              {data.wishList.map((category) => (
                <li key={category} className="p-2.5 rounded-lg text-[32px] leading-tight font-semibold">
                  {category}
                </li>
              ))}
            </ul>
            <div className="h-[92px] p-6 flex items-center justify-end gap-3 bg-TERTIARY">
              {/* BUTTON: "Remove Category" (bottom of the wish list panel)
                  What it does: removes the selected category from this center's wish list,
                  so donors stop seeing that the center needs it.
                  Backend: NOT IN APIDesign.md YET. /removeCategory is the Organization's
                  endpoint for the global category list, not a center's wish list.
                  TODO: agree on a wish list endpoint with the team. */}
              <PanelButton label="Remove Category" />
              {/* BUTTON: "Add Category" (bottom of the wish list panel)
                  What it does: adds a category to this center's wish list (what it
                  needs donated). Donors find centers by wish list via /searchDonationCenters.
                  Backend: NOT IN APIDesign.md YET (same as above; /addCategory is the
                  Organization's endpoint).
                  TODO: agree on a wish list endpoint with the team. */}
              <PanelButton label="Add Category" />
            </div>
          </section>

          {/* Inventory panel */}
          <section className="flex-1 min-w-0 flex flex-col gap-2.5 rounded-[32px] border-2 border-TERTIARY overflow-hidden">
            <div className="px-5 py-2.5 grid grid-cols-2 gap-5 bg-TERTIARY text-NAVY font-semibold">
              <h2 className="h-10 flex items-end text-[32px] leading-tight">Inventory</h2>
              <div className="grid grid-cols-2 gap-5 text-xl leading-tight text-center whitespace-nowrap">
                <p className="h-10 flex items-end justify-center">Total Items: {data.totalItems.toLocaleString()}</p>
                <p className="h-10 flex items-end justify-center">Total Value: {money(data.totalValue)}</p>
              </div>
            </div>
            {/* Items fill a column top to bottom, then wrap into the next column */}
            <ul className="flex-1 min-h-0 flex flex-col flex-wrap content-start gap-[5px] overflow-x-auto">
              {data.inventory.length === 0 && (
                <li className="w-[332px] h-10 px-5 flex items-end text-2xl italic">No items yet</li>
              )}
              {/* key={item.id}: the same item name can appear twice (different
                  donor prices), but each row's id is unique. */}
              {data.inventory.map((item) => (
                <li
                  key={item.id}
                  title={`${item.category}: ${item.quantity} x ${money(item.price)}`}
                  className="w-[332px] h-10 px-5 flex items-end justify-between gap-2 rounded-[20px] text-2xl leading-tight font-semibold"
                >
                  <span className="truncate">
                    {item.name} <span className="font-normal">x{item.quantity}</span>
                  </span>
                  <span className="text-lg font-normal">{money(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="h-[92px] p-6 flex items-center justify-end gap-3 bg-TERTIARY">
              {/* BUTTON: "Remove Item" (bottom of the inventory panel)
                  What it does: removes the selected item from this center's inventory
                  (for example, after it's been given away).
                  Backend: NOT IN APIDesign.md YET. There is no inventory-removal endpoint.
                  TODO: agree on an endpoint with the team, then refresh the list and totals. */}
              <PanelButton label="Remove Item" />
              {/* BUTTON: "Add Item" (bottom of the inventory panel)
                  What it does: adds an item to this center's inventory by hand.
                  Backend: NOT IN APIDesign.md YET. Right now items only enter inventory
                  when a donor's box is donated (/completeBoxDonation).
                  TODO: check with the team whether centers should add items directly. */}
              <PanelButton label="Add Item" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
