"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface LoyaltyRangeInput {
  min: string;
  max: string;
  points: string;
}

const emptyRange: LoyaltyRangeInput = { min: "", max: "", points: "" };

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [loyaltyRanges, setLoyaltyRanges] = useState<LoyaltyRangeInput[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPublicId, setLogoPublicId] = useState("");

  const hasRanges = useMemo(() => loyaltyRanges.length > 0, [loyaltyRanges.length]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (res.ok) {
          setFreeDeliveryThreshold(Number(data?.freeDeliveryThreshold) || 0);
          const ranges = Array.isArray(data?.loyaltyRanges) ? data.loyaltyRanges : [];
          setLoyaltyRanges(
            ranges.map((range: any) => ({
              min: Number.isFinite(range?.min) ? String(range.min) : "",
              max: Number.isFinite(range?.max) ? String(range.max) : "",
              points: Number.isFinite(range?.points) ? String(range.points) : "",
            })),
          );
          setLogoUrl(data?.logoUrl || "");
          setLogoPublicId(data?.logoPublicId || "");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const addRange = () => setLoyaltyRanges((prev) => [...prev, { ...emptyRange }]);

  const updateRange = (index: number, patch: Partial<LoyaltyRangeInput>) => {
    setLoyaltyRanges((prev) =>
      prev.map((range, i) => (i === index ? { ...range, ...patch } : range)),
    );
  };

  const removeRange = (index: number) => {
    setLoyaltyRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const validateRanges = () => {
    for (const range of loyaltyRanges) {
      const min = Number(range.min);
      const points = Number(range.points);
      const hasMax = range.max.trim() !== "";
      const max = hasMax ? Number(range.max) : null;

      if (!Number.isFinite(min) || min < 0) return "Min price must be 0 or higher.";
      if (!Number.isFinite(points) || points < 0) return "Points must be 0 or higher.";
      if (hasMax && (!Number.isFinite(max) || (max as number) < 0)) {
        return "Max price must be 0 or higher.";
      }
      if (hasMax && (max as number) < min) {
        return "Max price must be greater than or equal to min price.";
      }
    }
    return "";
  };

  const handleSave = async () => {
    const validationError = validateRanges();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const payloadRanges = loyaltyRanges.map((range) => ({
        min: Number(range.min),
        max: range.max.trim() === "" ? null : Number(range.max),
        points: Number(range.points),
      }));

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeDeliveryThreshold,
          loyaltyRanges: payloadRanges,
          logoUrl,
          logoPublicId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save settings.");

      setFreeDeliveryThreshold(Number(data?.freeDeliveryThreshold) || 0);
      const ranges = Array.isArray(data?.loyaltyRanges) ? data.loyaltyRanges : [];
      setLoyaltyRanges(
        ranges.map((range: any) => ({
          min: Number.isFinite(range?.min) ? String(range.min) : "",
          max: Number.isFinite(range?.max) ? String(range.max) : "",
          points: Number.isFinite(range?.points) ? String(range.points) : "",
        })),
      );
      setLogoUrl(data?.logoUrl || "");
      setLogoPublicId(data?.logoPublicId || "");
      toast.success("Settings updated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><span className="page-icon">⚙️</span> Settings</h1>
          <p className="admin-page-subtitle">Configure delivery rules and loyalty points.</p>
        </div>
        <button className="btn-admin-primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div className="admin-empty"><div className="spinner" style={{ margin: "0 auto 1rem" }} /><p>Loading…</p></div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          <div className="admin-card">
            <div className="admin-card-header">🚚 Free Delivery</div>
            <div className="admin-card-body">
              <div className="admin-field">
                <label className="admin-label">Free Delivery Threshold (BDT)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value) || 0)}
                  min={0}
                />
                <p className="admin-item-meta" style={{ marginTop: "0.5rem" }}>
                  Orders with subtotal greater than or equal to this amount will get free delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">🎯 Loyalty Points</div>
            <div className="admin-card-body">
              {!hasRanges ? (
                <div className="admin-empty" style={{ padding: "1.5rem" }}>
                  <div className="empty-icon">🎁</div>
                  <h3>No Loyalty Ranges</h3>
                  <p>Add your first range to reward customers.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Min Price</th>
                        <th>Max Price</th>
                        <th>Points</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loyaltyRanges.map((range, index) => (
                        <tr key={`range-${index}`}>
                          <td>
                            <input
                              type="number"
                              className="admin-input"
                              value={range.min}
                              min={0}
                              onChange={(e) => updateRange(index, { min: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="admin-input"
                              value={range.max}
                              min={0}
                              placeholder="Optional"
                              onChange={(e) => updateRange(index, { max: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="admin-input"
                              value={range.points}
                              min={0}
                              onChange={(e) => updateRange(index, { points: e.target.value })}
                            />
                          </td>
                          <td>
                            <button className="btn-admin-danger" onClick={() => removeRange(index)}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button className="btn-admin-secondary" onClick={addRange} style={{ marginTop: "1rem" }}>
                + Add Range
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
