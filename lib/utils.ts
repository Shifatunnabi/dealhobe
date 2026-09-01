/**
 * Lightweight className merger.
 * Filters falsy values and joins class names — no external deps needed.
 */
export function cn(
  ...classes: (string | undefined | null | false | 0)[]
): string {
  return classes.filter(Boolean).join(" ");
}
