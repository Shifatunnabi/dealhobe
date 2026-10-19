// Shared by the server homepage (app/page.tsx) and the client grids, so it must not live in a
// "use client" module — a server component importing a value from one gets a client reference, not the value.

/** Homepage product grids (Trending, For You) show 3 rows: 3 × 4 = 12 from md up, 3 × 2 = 6 on mobile. */
export const HOMEPAGE_GRID_ITEMS = 12;
export const HOMEPAGE_GRID_CLASS =
  "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 max-md:[&>*:nth-child(n+7)]:hidden";
