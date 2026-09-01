"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";

interface ThreadItem {
  id: string;
  displayName: string;
  lastMessage: string;
  lastMessageAt?: string;
  unreadByAdmin: number;
  isGuest: boolean;
}

interface MessageItem {
  id: string;
  sender: "customer" | "admin" | "system";
  text: string;
  createdAt: string;
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const activeIdRef = useRef<string>("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) || null,
    [threads, activeId],
  );

  const loadThreads = async () => {
    const res = await fetch("/api/admin/chat/threads");
    if (!res.ok) return;
    const data = await res.json();
    setThreads(data);
    if (!activeIdRef.current && data?.length) {
      setActiveId(data[0].id);
    }
  };

  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/chat/threads/${threadId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data || []);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markRead = async (threadId: string) => {
    await fetch(`/api/admin/chat/threads/${threadId}/read`, { method: "POST" });
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unreadByAdmin: 0 } : thread,
      ),
    );
  };

  useEffect(() => {
    let alive = true;
    const boot = async () => {
      await loadThreads();
      if (alive) setLoadingThreads(false);
    };
    boot();
    const id = window.setInterval(() => loadThreads(), 12000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 900px)");
    const apply = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileView("chat");
      } else {
        setMobileView("list");
      }
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    activeIdRef.current = activeId;
    if (!activeId) return;
    loadMessages(activeId);
    markRead(activeId);
    inputRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    inputRef.current?.focus();
  }, [messages, sending]);

  const handleSend = async () => {
    if (!activeId || !input.trim()) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chat/threads/${activeId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeId
            ? { ...thread, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : thread,
        ),
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Chat</h1>
          <p className="admin-page-subtitle">Support conversations from customers and guests.</p>
        </div>
      </div>

      <div className="admin-chat-shell">
        <aside className={`admin-chat-list ${isMobile && mobileView === "chat" ? "mobile-hidden" : ""}`}>
          <div className="admin-chat-list-header">Conversations</div>
          <div className="admin-chat-list-body">
            {loadingThreads ? (
              <div className="admin-chat-empty">Loading chats...</div>
            ) : threads.length ? (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  className={`admin-chat-thread ${thread.id === activeId ? "active" : ""}`}
                  onClick={() => {
                    setActiveId(thread.id);
                    if (isMobile) setMobileView("chat");
                  }}
                >
                  <div className="admin-chat-avatar">
                    <span>{thread.displayName.slice(0, 1).toUpperCase()}</span>
                  </div>
                  <div className="admin-chat-thread-meta">
                    <div className="admin-chat-thread-row">
                      <span className="admin-chat-thread-name">{thread.displayName}</span>
                      <span className="admin-chat-thread-time">{formatTime(thread.lastMessageAt)}</span>
                    </div>
                    <div className="admin-chat-thread-row">
                      <span className="admin-chat-thread-message">{thread.lastMessage || "No messages yet"}</span>
                      {thread.unreadByAdmin > 0 && (
                        <span className="admin-chat-unread">{thread.unreadByAdmin}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="admin-chat-empty">No chats yet.</div>
            )}
          </div>
        </aside>

        <section className={`admin-chat-panel ${isMobile && mobileView === "list" ? "mobile-hidden" : ""}`}>
          <div className="admin-chat-panel-header">
            {activeThread ? (
              <>
                {isMobile && (
                  <button
                    type="button"
                    className="btn-admin-secondary"
                    onClick={() => setMobileView("list")}
                  >
                    <FiChevronLeft size={16} /> Back
                  </button>
                )}
                <div className="admin-chat-panel-name">
                  <span className="admin-chat-avatar small">{activeThread.displayName.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <div className="admin-chat-panel-title">{activeThread.displayName}</div>
                    <div className="admin-chat-panel-subtitle">
                      {activeThread.isGuest ? "Guest" : "Account holder"}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="admin-chat-panel-title">Select a chat</div>
            )}
          </div>

          <div ref={messagesRef} className="admin-chat-messages">
            {loadingMessages ? (
              <div className="admin-chat-empty">Loading messages...</div>
            ) : activeThread ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`admin-chat-message ${msg.sender === "admin" ? "admin" : "customer"}`}
                >
                  {msg.sender !== "admin" && (
                    <div className="admin-chat-avatar small">
                      {activeThread.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="admin-chat-bubble">
                    <p>{msg.text}</p>
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-chat-empty">Pick a conversation to begin.</div>
            )}
          </div>

          <div className="admin-chat-input">
            <input
              ref={inputRef}
              type="text"
              placeholder={activeThread ? "Type a reply..." : "Select a chat first"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={!activeThread || sending}
            />
            <button
              className="btn-admin-primary"
              onClick={handleSend}
              disabled={!activeThread || sending || !input.trim()}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
