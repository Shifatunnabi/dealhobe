"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiEdit3 } from "react-icons/fi";
import Stars from "@/components/product-page/Stars";
import { cn } from "@/lib/utils";

export type ReviewItem = {
  _id: string;
  customerName: string;
  mine?: boolean;
  rating: number;
  review: string;
  createdAt: string;
};

const AUTH_KEY = "dealhobe_auth_token_v1";
const PAGE = 6;
// Fixed locale + time zone so the server and browser render identical dates.
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "C";

/** Rating summary, the write-a-review form (logged-in customers) and the review list. */
export default function ProductReviews({ productId, productName, initial }: { productId: string; productName: string; initial: ReviewItem[] }) {
  const [reviewList, setReviewList] = useState<ReviewItem[]>(initial);
  const [shown, setShown] = useState(PAGE);
  const [authToken, setAuthToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [thanks, setThanks] = useState(false);

  useEffect(() => setReviewList(initial), [initial]);

  useEffect(() => {
    let token = "";
    try { token = window.localStorage.getItem(AUTH_KEY) || ""; } catch { /* storage blocked */ }
    if (!token) return;
    setAuthToken(token);
    let alive = true;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive || !data?.user) return;
        setCustomerName(data.user.fullName || "");
        setIsLoggedIn(true);
      })
      .catch(() => alive && setIsLoggedIn(false));
    return () => { alive = false; };
  }, []);

  const reloadReviews = async () => {
    const res = await fetch(`/api/reviews?productId=${productId}`, authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined);
    if (!res.ok) return;
    const data = await res.json();
    setReviewList(Array.isArray(data) ? data : []);
  };

  // The static page carries no customer emails, so fetch the live list once we know who is logged in.
  useEffect(() => {
    if (isLoggedIn) void reloadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const hasReviewed = useMemo(
    () => isLoggedIn && reviewList.some((r) => r.mine),
    [isLoggedIn, reviewList],
  );

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    if (!authToken) {
      setReviewError("Please log in to submit a review.");
      return;
    }
    setReviewSaving(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ productId, review: reviewText.trim(), rating: reviewRating }),
      });
      if (res.status === 409) {
        setReviewError("You already reviewed this product.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setReviewError(data?.error || "Failed to submit review.");
        return;
      }
      setReviewText("");
      setReviewRating(5);
      setFormOpen(false);
      setThanks(true);
      await reloadReviews();
    } finally {
      setReviewSaving(false);
    }
  };

  const count = reviewList.length;
  const avg = count ? reviewList.reduce((n, r) => n + (Number(r.rating) || 0), 0) / count : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviewList.filter((r) => Math.round(r.rating) === s).length }));
  const stars = hoverRating || reviewRating;

  return (
    <div className={cn("grid gap-8 lg:gap-12", (count > 0 || formOpen) ? "lg:grid-cols-[320px_minmax(0,1fr)]" : "max-w-xl")}>
      {/* Summary */}
      <aside className="h-fit rounded-3xl border border-[#F1E7EB] bg-white p-6 shadow-tile lg:sticky lg:top-40">
        {count > 0 ? (
          <>
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl font-semibold leading-none text-text-dark">{avg.toFixed(1)}</span>
              <span className="pb-1">
                <Stars value={avg} className="text-base" />
                <span className="mt-1 block text-xs text-text-muted">Based on {count} {count === 1 ? "review" : "reviews"}</span>
              </span>
            </div>
            <ul className="mt-5 space-y-1.5">
              {dist.map(({ s, n }) => (
                <li key={s} className="flex items-center gap-2.5 text-xs text-text-muted">
                  <span className="w-6 font-semibold text-text-dark">{s}★</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4ECEF]">
                    <span className="block h-full rounded-full bg-[#E8A317]" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
                  </span>
                  <span className="w-6 text-right tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold text-text-dark">No reviews yet</p>
            <p className="mt-1.5 text-sm text-text-muted">Tried {productName}? Your review helps other shoppers choose.</p>
          </>
        )}

        <div className="mt-6 border-t border-[#F1E7EB] pt-5">
          {thanks ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-[#1F7A45]"><FiCheckCircle /> Thanks for your review!</p>
          ) : !isLoggedIn ? (
            <p className="text-sm text-text-muted">
              <Link href="/auth/login" className="font-bold text-primary-pink hover:underline">Log in</Link> to write a review.
            </p>
          ) : hasReviewed ? (
            <p className="text-sm text-text-muted">You have already reviewed this product.</p>
          ) : (
            <button
              type="button"
              onClick={() => setFormOpen((o) => !o)}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-plum py-2.5 text-sm font-bold text-plum transition-colors hover:bg-plum hover:text-white"
            >
              <FiEdit3 size={15} /> Write a review
            </button>
          )}
        </div>
      </aside>

      {(count > 0 || formOpen) && <div className="min-w-0">
        {/* Form */}
        {formOpen && isLoggedIn && !hasReviewed && (
          <div className="mb-6 rounded-3xl border border-[#F1E7EB] bg-white p-5 shadow-tile md:p-6">
            <p className="text-sm font-semibold text-text-dark">Writing as {customerName || "Customer"}</p>
            <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHoverRating(0)} role="radiogroup" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={reviewRating === s}
                  aria-label={`${s} star${s > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverRating(s)}
                  onClick={() => setReviewRating(s)}
                  className={cn("text-2xl leading-none transition-transform hover:scale-110", s <= stars ? "text-[#E8A317]" : "text-[#E8D9C7]")}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#EBDDE3] bg-soft-bg px-4 py-3 text-sm text-text-dark outline-none focus:border-plum"
              placeholder="What did you like? How did it work for you?"
              aria-label="Your review"
            />
            {reviewError && <p className="mt-2 text-sm text-primary-pink">{reviewError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-text-muted hover:text-text-dark">Cancel</button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={reviewSaving || !reviewText.trim()}
                className="rounded-full bg-primary-pink px-6 py-2.5 text-sm font-bold text-white shadow-button transition-opacity disabled:opacity-50"
              >
                {reviewSaving ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </div>
        )}

        {count > 0 && (
          <>
            <ul className="grid gap-4 md:grid-cols-2">
              {reviewList.slice(0, shown).map((r) => (
                <li key={r._id} className="flex flex-col rounded-3xl border border-[#F1E7EB] bg-white p-5 shadow-tile">
                  <div className="flex items-center justify-between gap-3">
                    <Stars value={Number(r.rating) || 0} />
                    <time className="text-xs text-text-muted" dateTime={r.createdAt}>{dateFmt.format(new Date(r.createdAt))}</time>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-text-dark">{r.review}</p>
                  <div className="mt-4 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush text-[11px] font-bold text-plum">{initials(r.customerName)}</span>
                    <span className="text-sm font-semibold text-text-dark">{r.customerName}</span>
                  </div>
                </li>
              ))}
            </ul>
            {count > shown && (
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setShown((n) => n + PAGE)} className="rounded-full border border-[#EBDDE3] bg-white px-6 py-2.5 text-sm font-bold text-text-dark hover:border-plum">
                  Show more reviews ({count - shown})
                </button>
              </div>
            )}
          </>
        )}
      </div>}
    </div>
  );
}
