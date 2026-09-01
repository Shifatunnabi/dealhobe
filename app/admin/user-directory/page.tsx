"use client";

import { useEffect, useState, useCallback } from "react";

interface BabyEntry {
  _id?: string;
  name: string;
  birthday: string;
}

interface UserEntry {
  _id: string;
  fullName: string;
  phone: string;
  email: string | null;
  area: string;
  address: string;
  babies: BabyEntry[];
  isBanned: boolean;
  createdAt: string;
  totalOrders: number;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const text =
    parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff6b9d, #ff8fab)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {text}
    </div>
  );
}

function UserCard({
  user,
  onBanToggle,
}: {
  user: UserEntry;
  onBanToggle: (id: string, banned: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [banning, setBanning] = useState(false);

  const handleBan = async () => {
    setBanning(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}/ban`, { method: "POST" });
      const data = await res.json();
      if (res.ok) onBanToggle(user._id, data.isBanned);
    } finally {
      setBanning(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "1.25rem",
        border: user.isBanned ? "2px solid #fca5a5" : "2px solid transparent",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top row: avatar + info + ban button */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <Initials name={user.fullName} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", margin: 0 }}>
              {user.fullName}
            </p>
            {user.isBanned && (
              <span
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 20,
                  padding: "2px 8px",
                }}
              >
                Banned
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#666", margin: "3px 0 0" }}>{user.phone}</p>
          {user.email && (
            <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0" }}>{user.email}</p>
          )}
          <p style={{ fontSize: 12, color: "#aaa", margin: "3px 0 0" }}>
            {user.area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"} — {user.address}
          </p>
        </div>

        {/* Ban / Unban button */}
        <button
          onClick={handleBan}
          disabled={banning}
          style={{
            flexShrink: 0,
            padding: "5px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            cursor: banning ? "not-allowed" : "pointer",
            border: "none",
            background: user.isBanned ? "#dcfce7" : "#fee2e2",
            color: user.isBanned ? "#16a34a" : "#dc2626",
            opacity: banning ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {banning ? "..." : user.isBanned ? "Unban" : "Ban"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 10,
                padding: "10px 16px",
                flex: "1 1 140px",
              }}
            >
              <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>Date Registered</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#333", margin: "4px 0 0" }}>
                {new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 10,
                padding: "10px 16px",
                flex: "1 1 140px",
              }}
            >
              <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>Total Orders</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#333", margin: "4px 0 0" }}>
                {user.totalOrders}
              </p>
            </div>
          </div>

          {user.babies.length > 0 ? (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 8 }}>
                Baby Details
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {user.babies.map((baby, i) => (
                  <div
                    key={baby._id || `${baby.name}-${i}`}
                    style={{
                      background: "#fff0f5",
                      borderRadius: 10,
                      padding: "8px 14px",
                      border: "1px solid #ffd6e7",
                    }}
                  >
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#ff6b9d", margin: 0 }}>
                      {baby.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>
                      {new Date(baby.birthday).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#ccc", fontStyle: "italic" }}>
              No baby details added.
            </p>
          )}
        </div>
      )}

      {/* Bottom row: view details button aligned right */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: expanded ? "#fff0f5" : "#f8f9fa",
            border: "none",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: expanded ? "#ff6b9d" : "#555",
            cursor: "pointer",
          }}
        >
          {expanded ? "Hide Details ▲" : "View Details ▼"}
        </button>
      </div>
    </div>
  );
}

export default function UserDirectoryPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotal(data.total);
        setPages(data.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBanToggle = (id: string, isBanned: boolean) => {
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBanned } : u)));
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <span className="page-icon">👥</span> Users
          </h1>
          <p className="admin-page-subtitle">
            Manage registered users — view details, ban, or unban.
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          style={{
            width: "100%",
            maxWidth: 440,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {loading ? (
        <div className="admin-empty">
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p>Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">👥</div>
          <h3>No Users Found</h3>
          <p>Try adjusting your search query.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: "1rem" }}>
            {total} user{total !== 1 ? "s" : ""} total
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {users.map((user) => (
              <UserCard key={user._id} user={user} onBanToggle={handleBanToggle} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: "2rem",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  background: page === 1 ? "#f8f9fa" : "#fff",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: page === 1 ? "#ccc" : "#333",
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1.5px solid",
                    borderColor: p === page ? "#ff6b9d" : "#e5e7eb",
                    background: p === page ? "#ff6b9d" : "#fff",
                    color: p === page ? "#fff" : "#333",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  background: page === pages ? "#f8f9fa" : "#fff",
                  cursor: page === pages ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: page === pages ? "#ccc" : "#333",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
