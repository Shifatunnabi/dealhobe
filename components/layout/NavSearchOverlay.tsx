"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export default function NavSearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}&limit=6`);
        const data = await res.json();
        if (requestId !== requestIdRef.current) return;
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch {
        if (requestId === requestIdRef.current) setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const trimmedQuery = query.trim();
  const showPanel = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const goToFullSearch = () => {
    if (!trimmedQuery) return;
    onClose();
    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToFullSearch();
  };

  return (
    <>
      {typeof document !== "undefined" &&
        createPortal(<div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />, document.body)}

      <form
        onSubmit={handleSubmit}
        className="flex h-full w-full items-center px-4 md:mx-auto md:w-[90%] md:max-w-[1400px]"
      >
        <div className="flex w-full items-center gap-3 rounded-2xl bg-soft-bg px-4 py-2.5">
          <FiSearch size={18} className="shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent font-poppins text-sm text-text-dark outline-none placeholder:text-text-muted md:text-base"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="shrink-0 font-poppins text-sm font-medium text-primary-pink hover:underline"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-black/5 hover:text-text-dark"
          >
            <FiX size={18} />
          </button>
        </div>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-10 px-4 md:mx-auto md:w-[90%] md:max-w-[1400px] md:px-0">
          <div className="max-h-[70vh] overflow-y-auto rounded-b-2xl border border-t-0 border-gray-100 bg-white shadow-hover">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-pink/30 border-t-primary-pink" />
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
                <div>
                  <p className="font-poppins text-base font-semibold text-text-dark">
                    No results found for &quot;{trimmedQuery}&quot;
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    Check the spelling or use a different word or phrase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goToFullSearch}
                  className="rounded-2xl bg-gradient-primary px-6 py-2.5 font-poppins text-sm font-semibold text-white shadow-button hover:shadow-hover"
                >
                  Search More for &quot;{trimmedQuery}&quot;
                </button>
              </div>
            ) : (
              <div className="p-2">
                {results.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-soft-bg"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                      {product.image && (
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-poppins text-sm font-medium text-text-dark">{product.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-poppins text-sm font-semibold text-primary-pink">
                          ৳{(product.salePrice ?? product.price).toLocaleString()}
                        </span>
                        {product.salePrice != null && product.salePrice < product.price && (
                          <span className="text-xs text-text-muted line-through">
                            ৳{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-gray-100 p-3 text-center">
                  <button
                    type="button"
                    onClick={goToFullSearch}
                    className="rounded-2xl bg-gradient-primary px-6 py-2.5 font-poppins text-sm font-semibold text-white shadow-button hover:shadow-hover"
                  >
                    Search More for &quot;{trimmedQuery}&quot;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
