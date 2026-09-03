import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import SubCategory from "@/lib/models/SubCategory";
import Brand from "@/lib/models/Brand";

/*
 * Generic, category-agnostic product search — works the same whether the
 * catalog is cosmetics, fashion, electronics, groceries, etc. Only searches
 * fields that actually exist on the Product schema (name, sku, description,
 * shortDescription, whyLoveIt, plus category/subCategory/brand resolved via
 * their own name fields since Product stores those as id references).
 *
 * Ranking (simple, no external search engine):
 *   1. exact name match
 *   2. name starts with query
 *   3. exact SKU match
 *   4. name contains query
 *   5. category / sub-category / brand name match
 *   6. SKU contains query
 *   7. short description / description / whyLoveIt contains query
 *
 * If that yields zero results, a bounded (capped candidate pool) Levenshtein
 * fallback catches simple typos (e.g. "iphnoe" -> "iphone") without pulling
 * in a dedicated fuzzy-search engine.
 */

const MAX_QUERY_LENGTH = 100;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;
const FUZZY_CANDIDATE_CAP = 500;

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toResult = (p: any) => ({
  _id: String(p._id),
  name: p.name,
  slug: p.slug,
  image: p.images?.[0] ?? null,
  price: p.price,
  salePrice: p.salePrice ?? null,
});

/** Iterative Levenshtein edit distance — small inputs only (typo fallback). */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

async function fuzzyFallback(query: string, limit: number) {
  // Below 3 characters, typo-correction is too ambiguous to be meaningful —
  // skip straight to "no results" rather than risk false-positive matches.
  if (query.length < 3) return [];

  const [candidates, categories, subCategories, brands] = await Promise.all([
    Product.find({}, { name: 1, slug: 1, images: 1, price: 1, salePrice: 1, sku: 1, brand: 1, category: 1, subCategory: 1 })
      .sort({ updatedAt: -1 })
      .limit(FUZZY_CANDIDATE_CAP)
      .lean(),
    Category.find({}, { name: 1 }).lean(),
    SubCategory.find({}, { name: 1 }).lean(),
    Brand.find({}, { name: 1 }).lean(),
  ]);

  const categoryNameById = new Map(categories.map((c: any) => [String(c._id), c.name]));
  const subCategoryNameById = new Map(subCategories.map((c: any) => [String(c._id), c.name]));
  const brandNameById = new Map(brands.map((c: any) => [String(c._id), c.name]));

  const lowerQuery = query.toLowerCase();
  const threshold = Math.max(1, Math.min(3, Math.floor(lowerQuery.length / 3)));

  const scored = candidates
    .map((p: any) => {
      // Short tokens (e.g. "de", "of", "ml") are excluded — comparing a short
      // query against them produces coincidental low edit distances that
      // don't reflect a real typo match.
      const terms = [
        ...String(p.name || "").toLowerCase().split(/\s+/),
        String(p.sku || "").toLowerCase(),
        String(brandNameById.get(String(p.brand)) || "").toLowerCase(),
        String(categoryNameById.get(String(p.category)) || "").toLowerCase(),
        String(subCategoryNameById.get(String(p.subCategory)) || "").toLowerCase(),
      ].filter((term) => term.length >= 3);

      let best = Infinity;
      for (const term of terms) {
        const d = levenshtein(lowerQuery, term);
        if (d < best) best = d;
      }
      return { p, distance: best };
    })
    .filter((entry) => entry.distance <= threshold)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return scored.map((entry) => toResult(entry.p));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rawQuery = url.searchParams.get("q") || "";
  const query = rawQuery.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH);

  const pageParam = Number(url.searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const limitParam = Number(url.searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const headers = { "Cache-Control": "no-store" };

  if (!query) {
    return NextResponse.json({ query: "", page, perPage: limit, total: 0, results: [] }, { headers });
  }

  try {
    await connectDB();

    const escaped = escapeRegex(query);
    const regex = new RegExp(escaped, "i");
    const startRegex = new RegExp("^" + escaped, "i");
    const lowerQuery = query.toLowerCase();

    const [matchedCategories, matchedSubCategories, matchedBrands] = await Promise.all([
      Category.find({ name: regex }, { _id: 1 }).lean(),
      SubCategory.find({ name: regex }, { _id: 1 }).lean(),
      Brand.find({ name: regex }, { _id: 1 }).lean(),
    ]);

    const categoryIds = matchedCategories.map((c: any) => String(c._id));
    const subCategoryIds = matchedSubCategories.map((c: any) => String(c._id));
    const brandIds = matchedBrands.map((c: any) => String(c._id));

    const orConditions: Record<string, unknown>[] = [
      { name: regex },
      { sku: regex },
      { shortDescription: regex },
      { description: regex },
      { whyLoveIt: regex },
    ];
    if (categoryIds.length) orConditions.push({ category: { $in: categoryIds } });
    if (subCategoryIds.length) orConditions.push({ subCategory: { $in: subCategoryIds } });
    if (brandIds.length) orConditions.push({ brand: { $in: brandIds } });

    const scoreBranches: Record<string, unknown>[] = [
      { case: { $eq: [{ $toLower: "$name" }, lowerQuery] }, then: 100 },
      { case: { $regexMatch: { input: "$name", regex: startRegex } }, then: 80 },
      { case: { $eq: [{ $toLower: { $ifNull: ["$sku", ""] } }, lowerQuery] }, then: 75 },
      { case: { $regexMatch: { input: "$name", regex } }, then: 60 },
    ];
    if (categoryIds.length) scoreBranches.push({ case: { $in: ["$category", categoryIds] }, then: 45 });
    if (subCategoryIds.length) scoreBranches.push({ case: { $in: ["$subCategory", subCategoryIds] }, then: 43 });
    if (brandIds.length) scoreBranches.push({ case: { $in: ["$brand", brandIds] }, then: 41 });
    scoreBranches.push(
      { case: { $regexMatch: { input: { $ifNull: ["$sku", ""] }, regex } }, then: 35 },
      { case: { $regexMatch: { input: { $ifNull: ["$shortDescription", ""] }, regex } }, then: 20 },
      { case: { $regexMatch: { input: { $ifNull: ["$description", ""] }, regex } }, then: 10 },
    );

    const skip = (page - 1) * limit;

    const [agg] = await Product.aggregate([
      { $match: { $or: orConditions } },
      { $addFields: { _score: { $switch: { branches: scoreBranches, default: 5 } } } },
      { $sort: { _score: -1, updatedAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            { $project: { name: 1, slug: 1, images: 1, price: 1, salePrice: 1, sku: 1 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const data = agg?.data || [];
    const total = agg?.totalCount?.[0]?.count || 0;

    if (total === 0) {
      const results = await fuzzyFallback(query, limit);
      return NextResponse.json(
        { query, page: 1, perPage: limit, total: results.length, results },
        { headers },
      );
    }

    return NextResponse.json(
      { query, page, perPage: limit, total, results: data.map(toResult) },
      { headers },
    );
  } catch (err) {
    console.error("Product search failed:", err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
