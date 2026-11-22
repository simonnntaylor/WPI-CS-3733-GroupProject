import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation Center - Donazion",
  description: "A donation platform for organizations and donation centers.",
};

// Placeholder data. Later this comes from the backend
// (POST /donationCenter/showDashboard).
const wishListCategories = ["Category 1", "Category 2", "Category 3"];
const inventoryItems = [
  "Item 1",
  "Item 2",
  "Item 3",
  "Item 4",
  "Item 5",
  "Item 6",
  "Item 7",
  "Item 8",
  "Item 9",
];
const totalItems = "XXX,XXX";
const totalValue = "$XXX,XXX.XX";

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
  return (
    <div className="h-screen min-h-[600px] w-full p-[50px] flex bg-NAVY font-sf text-black">
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
          <div className="flex items-center justify-end">
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
              {wishListCategories.map((category) => (
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
                <p className="h-10 flex items-end justify-center">Total Items: {totalItems}</p>
                <p className="h-10 flex items-end justify-center">Total Value: {totalValue}</p>
              </div>
            </div>
            {/* Items fill a column top to bottom, then wrap into the next column */}
            <ul className="flex-1 min-h-0 flex flex-col flex-wrap content-start gap-[5px] overflow-x-auto">
              {inventoryItems.map((item) => (
                <li
                  key={item}
                  className="w-[332px] h-10 px-5 flex items-end rounded-[20px] text-2xl leading-tight font-semibold"
                >
                  {item}
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
