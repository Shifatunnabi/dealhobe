"use client";

import { useEffect, useState, useCallback } from "react";
import { FiUsers, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface UserEntry {
  _id: string;
  fullName: string;
  phone: string;
  email: string | null;
  area: string;
  address: string;
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
    <div className="user-avatar" aria-hidden="true">
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
    <div className={`user-card ${user.isBanned ? "is-banned" : ""}`}>
      {/* Top row: avatar + info + ban button */}
      <div className="user-card-top">
        <Initials name={user.fullName} />

        <div className="user-card-info">
          <div className="user-card-name">
            <span>{user.fullName}</span>
            {user.isBanned && <span className="badge badge-red">Banned</span>}
          </div>
          <p className="user-card-line">{user.phone}</p>
          {user.email && <p className="user-card-line">{user.email}</p>}
          <p className="user-card-line is-muted">
            {user.area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"} — {user.address}
          </p>
        </div>

        {/* Ban / Unban button */}
        <button
          type="button"
          onClick={handleBan}
          disabled={banning}
          className={`${user.isBanned ? "btn-admin-success" : "btn-admin-danger"} btn-sm`}
          style={{ flexShrink: 0 }}
        >
          {banning ? "..." : user.isBanned ? "Unban" : "Ban"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="user-card-stats">
          <div className="user-card-stat">
            <p>Date Registered</p>
            <p>
              {new Date(user.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="user-card-stat">
            <p>Total Orders</p>
            <p>{user.totalOrders}</p>
          </div>
        </div>
      )}

      {/* Bottom row: view details button aligned right */}
      <div className="user-card-footer">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="btn-admin-secondary btn-sm"
          aria-expanded={expanded}
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
            <span className="page-icon"><FiUsers size={20} /></span> Users
          </h1>
          <p className="admin-page-subtitle">
            Manage registered users — view details, ban, or unban.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="admin-toolbar" style={{ marginBottom: "1.25rem" }}>
        <input
          type="search"
          className="admin-input toolbar-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          aria-label="Search users"
        />
      </div>

      {loading ? (
        <div className="admin-empty">
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p>Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon"><FiUsers size={40} /></div>
          <h3>No Users Found</h3>
          <p>Try adjusting your search query.</p>
        </div>
      ) : (
        <>
          <p className="admin-toolbar-meta" style={{ marginBottom: "0.75rem" }}>
            {total} user{total !== 1 ? "s" : ""} total
          </p>

          <div className="user-list">
            {users.map((user) => (
              <UserCard key={user._id} user={user} onBanToggle={handleBanToggle} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <nav className="admin-pagination" aria-label="User pages">
              <div className="admin-pagination-pages">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <FiChevronLeft size={14} /> Prev
                </button>

                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={p === page ? "btn-admin-primary" : "btn-admin-secondary"}
                    aria-current={p === page ? "page" : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                >
                  Next <FiChevronRight size={14} />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
