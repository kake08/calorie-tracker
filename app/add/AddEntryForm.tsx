"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FoodResult } from "../api/food-search/route";
import { addEntry } from "../actions";
import { Card, Message, buttonClass, inputClass } from "../components/ui";

export default function AddEntryForm() {
  const [state, action, pending] = useActionState(addEntry, undefined);
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [picked, setPicked] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");

  const pendingSearch = useRef<{ timer?: ReturnType<typeof setTimeout>; controller?: AbortController }>({});
  useEffect(() => () => cancelSearch(), []);

  function cancelSearch() {
    clearTimeout(pendingSearch.current.timer);
    pendingSearch.current.controller?.abort();
  }

  // Search shortly after typing stops, and drop replies to older searches.
  function onSearchChange(value: string) {
    setSearch(value);
    cancelSearch();
    setSearchError("");
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    pendingSearch.current = {
      controller,
      timer: setTimeout(async () => {
        setSearching(true);
        try {
          const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
          const data = await res.json();
          setResults(data.results ?? []);
          if (data.error) setSearchError(data.error);
          else if (!data.results?.length) setSearchError("No matches. Try a simpler word, or type the calories in.");
        } catch (err) {
          if ((err as Error).name !== "AbortError") setSearchError("Search failed. Check your connection.");
        } finally {
          if (!controller.signal.aborted) setSearching(false);
        }
      }, 400),
    };
  }

  function fill(food: FoodResult, gramsText: string) {
    const g = Number(gramsText);
    setDescription(`${food.name}${food.brand ? ` (${food.brand})` : ""}${g > 0 ? `, ${g} g` : ""}`);
    setCalories(g > 0 ? String(Math.round((food.kcalPer100g * g) / 100)) : "");
  }

  function pick(food: FoodResult) {
    const g = String(food.servingGrams ?? 100);
    setPicked(food);
    setGrams(g);
    fill(food, g);
    setResults([]);
    onSearchChange("");
  }

  return (
    <>
      <Card className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Search foods (optional)</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="e.g. banana, oats, yoghurt"
            className={inputClass}
            enterKeyHint="search"
          />
        </label>
        {searching && <p className="text-sm text-muted">Searching…</p>}
        {!searching && searchError && <p className="text-sm text-muted">{searchError}</p>}
        {results.length > 0 && (
          <ul className="-mx-4 max-h-80 overflow-y-auto">
            {results.map((food) => (
              <li key={food.id} className="border-t border-line">
                <button
                  type="button"
                  onClick={() => pick(food)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-accent-soft"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{food.name}</span>
                    {food.brand && <span className="block truncate text-xs text-muted">{food.brand}</span>}
                  </span>
                  <span className="shrink-0 text-sm text-muted tabular-nums">{food.kcalPer100g} kcal/100 g</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {picked && (
          <div className="flex items-center gap-3 rounded-xl bg-accent-soft p-3">
            <span className="min-w-0 flex-1 truncate text-sm">
              {picked.name} · {picked.kcalPer100g} kcal/100 g
            </span>
            <label className="flex items-center gap-1 text-sm">
              <input
                value={grams}
                onChange={(e) => {
                  setGrams(e.target.value);
                  fill(picked, e.target.value);
                }}
                inputMode="numeric"
                aria-label="Grams eaten"
                className="w-16 rounded-lg border border-line bg-card px-2 py-2 text-right"
              />
              g
            </label>
          </div>
        )}
      </Card>

      <Card>
        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">What did you eat?</span>
            <input
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={200}
              placeholder="e.g. Chicken wrap"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">Calories (kcal)</span>
            <input
              name="calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value.replace(/\D/g, ""))}
              required
              inputMode="numeric"
              pattern="\d*"
              placeholder="e.g. 450"
              className={inputClass}
            />
          </label>
          <Message state={state} />
          <button disabled={pending} className={buttonClass}>
            {pending ? "Saving…" : "Save"}
          </button>
        </form>
      </Card>
    </>
  );
}
