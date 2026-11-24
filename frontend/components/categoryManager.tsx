"use client";

import { useCallback, useEffect, useState } from "react";
import { addCategory, listCategories, removeCategory } from "@/lib/categoriesApi";

type Status = { kind: "success" | "error"; text: string } | null;

export default function CategoryManager() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  // "Refreshes display" step of both use cases.
  const refresh = useCallback(async () => {
    try {
      setCategories(await listCategories());
    } catch {
      setStatus({ kind: "error", text: "Could not load categories. Try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;
  listCategories()
    .then((list) => {
      if (!cancelled) setCategories(list);
    })
    .catch(() => {
      if (!cancelled)
        setStatus({ kind: "error", text: "Could not load categories. Try again." });
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
  return () => {
    cancelled = true;
  };
}, []);

  // Add Category
  async function handleAdd(e: React.SyntheticEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await addCategory(newName);
    setStatus(
      result.ok
        ? { kind: "success", text: result.message }
        : { kind: "error", text: result.error },
    );
    if (result.ok) {
      setNewName("");
      await refresh();
    }
    setBusy(false);
  }

  // Remove Category
  async function handleRemove(name: string) {
    setBusy(true);
    const result = await removeCategory(name);
    setStatus(
      result.ok
        ? { kind: "success", text: result.message }
        : { kind: "error", text: result.error },
    );
    await refresh(); // also on error, in case the list changed elsewhere
    setBusy(false);
  }

  return (
    <section className="w-full text-left">
      <h2 className="text-2xl font-semibold text-zinc-50">Categories</h2>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <label htmlFor="category-name" className="sr-only">
          Category name
        </label>
        <input
          id="category-name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={busy}
          placeholder="New category name"
          className="flex-1 rounded-md border border-zinc-400 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          Add category
        </button>
      </form>

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            status.kind === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status.text}
        </p>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="text-zinc-200">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="text-zinc-200">No categories yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-zinc-500 rounded-md bg-zinc-700">
            {categories.map((name) => (
              <li key={name} className="flex items-center justify-between px-4 py-2">
                <span className="text-zinc-50">{name}</span>
                <button
                  onClick={() => handleRemove(name)}
                  disabled={busy}
                  aria-label={`Remove ${name}`}
                  className="rounded-md px-3 py-1 text-sm text-red-300 hover:bg-zinc-600 hover:text-red-200 disabled:opacity-60"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}