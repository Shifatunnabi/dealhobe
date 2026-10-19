// Shared by the server homepage (app/page.tsx) and the client grids, so it must not live in a
// "use client" module — a server component importing a value from one gets a client reference, not the value.

/** Homepage product grids (Trending, For You) show 12 products: 3 rows of 4 from md up, 6 rows of 2 on mobile. */
export const HOMEPAGE_GRID_ITEMS = 12;
export const HOMEPAGE_GRID_CLASS = "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5";
