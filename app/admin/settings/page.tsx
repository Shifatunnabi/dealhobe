"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiSettings, FiTruck } from "react-icons/fi";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPublicId, setLogoPublicId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (res.ok) {
          setFreeDeliveryThreshold(Number(data?.freeDeliveryThreshold) || 0);
          setLogoUrl(data?.logoUrl || "");
          setLogoPublicId(data?.logoPublicId || "");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeDeliveryThreshold,
          logoUrl,
          logoPublicId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save settings.");

      setFreeDeliveryThreshold(Number(data?.freeDeliveryThreshold) || 0);
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
          <h1 className="admin-page-title"><span className="page-icon"><FiSettings size={20} /></span> Settings</h1>
          <p className="admin-page-subtitle">Configure delivery rules.</p>
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
            <div className="admin-card-header"><span style={{display:"inline-flex",alignItems:"center",gap:"0.5rem"}}><FiTruck size={16} /> Free Delivery</span></div>
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
        </div>
      )}
    </div>
  );
}
