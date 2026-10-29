import type { Metadata } from "next";

// Private / transactional page: kept out of search results (robots.txt alone does not stop indexing of linked URLs).
export const metadata: Metadata = {
  title: "Log in or register",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
