import { NextResponse, type NextRequest } from "next/server";

export type FoodResult = {
  id: string;
  name: string;
  brand: string;
  kcalPer100g: number;
  servingGrams: number | null;
};

type Hit = {
  code?: string;
  product_name?: string;
  brands?: string[] | string;
  serving_quantity?: number | string;
  nutriments?: { "energy-kcal_100g"?: number };
};

// Open Food Facts asks every app to identify itself with a User-Agent.
const USER_AGENT = "CalorieTracker/0.1 (github.com/kake08/calorie-tracker)";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const url = new URL("https://search.openfoodfacts.org/search");
  url.searchParams.set("q", q.slice(0, 80));
  url.searchParams.set("page_size", "40");
  url.searchParams.set("fields", "code,product_name,brands,serving_quantity,nutriments");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`);
    const data = (await res.json()) as { hits?: Hit[] };

    const results: FoodResult[] = [];
    const seen = new Set<string>();
    for (const hit of data.hits ?? []) {
      const kcal = Number(hit.nutriments?.["energy-kcal_100g"]);
      const name = hit.product_name?.trim();
      if (!name || !(kcal > 0) || kcal > 950) continue;
      const brand = (Array.isArray(hit.brands) ? hit.brands[0] : hit.brands?.split(",")[0])?.trim() ?? "";
      const key = `${name}|${brand}|${Math.round(kcal)}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const serving = Number(hit.serving_quantity);
      results.push({
        id: hit.code ?? key,
        name,
        brand,
        kcalPer100g: Math.round(kcal),
        servingGrams: serving > 0 && serving < 2000 ? Math.round(serving) : null,
      });
      if (results.length === 15) break;
    }
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Food search isn't responding right now. You can still type the calories in." },
      { status: 502 },
    );
  }
}
