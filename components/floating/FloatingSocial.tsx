"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiMessageCircle } from "react-icons/fi";

const BRAND_BLUE = "#3DA7E4";
const AUTH_TOKEN_KEY = "joytoy_auth_token_v1";
const GUEST_ID_KEY = "joytoy_chat_guest_id_v1";
const GUEST_NAME_KEY = "joytoy_chat_guest_name_v1";
const GUEST_MOBILE_KEY = "joytoy_chat_guest_mobile_v1";
const GUEST_CACHE_KEY = "joytoy_chat_cache_v1";

interface ChatMessage {
  id: string;
  sender: "customer" | "admin" | "system";
  text: string;
  createdAt: string;
}

function loadCachedGuestMessages() {
  if (typeof window === "undefined") return [] as ChatMessage[];
  try {
    const raw = window.localStorage.getItem(GUEST_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed?.messages) ? parsed.messages : [];
  } catch {
    return [] as ChatMessage[];
  }
}

function saveCachedGuestMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_CACHE_KEY, JSON.stringify({ messages }));
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ── Chat Popup ──────────────────────────────────────────────── */
function ChatPopup({ onClose }: { onClose: () => void }) {
  const [logoUrl, setLogoUrl] = useState("/logo/main-logo.png");
  const [displayName, setDisplayName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");
  const [guestId, setGuestId] = useState("");
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptName, setPromptName] = useState(false);
  const skipAutoEnsureRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setMessages((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (isGuest) saveCachedGuestMessages(next);
        return next;
      });
    },
    [isGuest],
  );

  const greetingMessage = useMemo(() => {
    if (!displayName) return null;
    return {
      id: "greeting",
      sender: "admin" as const,
      text: `Hello ${displayName}, how can I help you today?`,
      createdAt: new Date().toISOString(),
    };
  }, [displayName]);

  useEffect(() => {
    let alive = true;
    const loadLogo = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!alive) return;
        if (res.ok && data?.logoUrl) setLogoUrl(data.logoUrl);
      } catch {
        if (alive) setLogoUrl("/logo/main-logo.png");
      }
    };

    loadLogo();
    return () => {
      alive = false;
    };
  }, []);

  const visibleMessages = useMemo(() => {
    if (!greetingMessage) return messages;
    if (messages.length > 0) return messages;
    return [greetingMessage];
  }, [greetingMessage, messages]);

  const loadIdentity = useCallback(async () => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    if (token) {
      setIsGuest(false);
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const name = String(data?.user?.fullName || "").trim();
        if (name) setDisplayName(name);
      } catch {
        return;
      }
      return;
    }

    setIsGuest(true);
    const storedName = window.localStorage.getItem(GUEST_NAME_KEY) || "";
    const storedGuestId = window.localStorage.getItem(GUEST_ID_KEY) || "";
    if (storedGuestId) {
      setGuestId(storedGuestId);
    }
    if (storedName) {
      setGuestName(storedName);
      setDisplayName(storedName);
      return;
    }
    setPromptName(true);
    setMessages(loadCachedGuestMessages());
  }, []);

  const ensureThread = useCallback(async () => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const storedGuestId = window.localStorage.getItem(GUEST_ID_KEY) || "";
    const body = isGuest
      ? { displayName, guestId: guestId || storedGuestId || undefined }
      : {};

    setLoading(true);
    try {
      const res = await fetch("/api/chat/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.guestId) {
        window.localStorage.setItem(GUEST_ID_KEY, data.guestId);
        setGuestId(data.guestId);
      }
      setThreadId(data.threadId || "");
      return {
        threadId: data.threadId || "",
        guestId: data.guestId || storedGuestId || guestId || "",
      };
    } finally {
      setLoading(false);
    }
    return { threadId: "", guestId: storedGuestId || guestId || "" };
  }, [displayName, guestId, isGuest]);

  const loadThread = useCallback(async () => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const storedGuestId = window.localStorage.getItem(GUEST_ID_KEY) || "";
    const activeGuestId = guestId || storedGuestId;
    const query = isGuest ? `?guestId=${encodeURIComponent(activeGuestId)}` : "";

    const res = await fetch(`/api/chat/thread${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data?.messages)) {
      updateMessages(data.messages);
    }
  }, [guestId, isGuest, updateMessages]);

  const markRead = useCallback(async (id: string) => {
    if (!id) return;
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const storedGuestId = window.localStorage.getItem(GUEST_ID_KEY) || "";
    const activeGuestId = guestId || storedGuestId;
    await fetch("/api/chat/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ threadId: id, guestId: activeGuestId }),
    });
  }, [guestId]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const storedGuestId = window.localStorage.getItem(GUEST_ID_KEY) || "";
    const text = input.trim();
    let activeThreadId = threadId;
    let activeGuestId = guestId || storedGuestId;

    if (!activeThreadId) {
      const result = await ensureThread();
      activeThreadId = result?.threadId || "";
      activeGuestId = result?.guestId || activeGuestId;
      if (!activeThreadId) return;
    }

    setInput("");
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: "customer",
      text,
      createdAt: new Date().toISOString(),
    };
    updateMessages((prev) => [...prev, optimistic]);

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ threadId: activeThreadId, text, guestId: activeGuestId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.message) {
      updateMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("local-")).concat(data.message),
      );
    }
  }, [ensureThread, guestId, input, threadId, updateMessages]);

  useEffect(() => {
    loadIdentity();
  }, [loadIdentity]);

  useEffect(() => {
    if (!displayName || (isGuest && promptName)) return;
    if (skipAutoEnsureRef.current) {
      skipAutoEnsureRef.current = false;
      return;
    }
    ensureThread();
  }, [displayName, ensureThread, isGuest, promptName]);

  useEffect(() => {
    if (!threadId) return;
    loadThread().then(() => markRead(threadId));
    const id = window.setInterval(() => loadThread(), 12000);
    return () => window.clearInterval(id);
  }, [loadThread, markRead, threadId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, greetingMessage]);

  const handleGuestName = async () => {
    const trimmedName = guestName.trim();
    if (!trimmedName) return;
    const trimmedMobile = guestMobile.trim();

    window.localStorage.setItem(GUEST_NAME_KEY, trimmedName);
    if (trimmedMobile) window.localStorage.setItem(GUEST_MOBILE_KEY, trimmedMobile);

    // Prevent the auto-ensureThread useEffect from firing
    skipAutoEnsureRef.current = true;
    setDisplayName(trimmedName);
    setPromptName(false);

    // Create thread and send intro message
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const storedGuestId = window.localStorage.getItem(GUEST_ID_KEY) || "";
    setLoading(true);
    try {
      const identRes = await fetch("/api/chat/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ displayName: trimmedName, guestId: storedGuestId || undefined }),
      });
      if (!identRes.ok) return;
      const identData = await identRes.json();
      const newGuestId = identData?.guestId || storedGuestId;
      if (identData?.guestId) {
        window.localStorage.setItem(GUEST_ID_KEY, identData.guestId);
        setGuestId(identData.guestId);
      }
      const newThreadId = identData?.threadId || "";
      setThreadId(newThreadId);

      if (newThreadId) {
        const introText = trimmedMobile
          ? `${trimmedName} with Contact no. ${trimmedMobile} is trying to contact.`
          : `${trimmedName} is trying to contact.`;

        await fetch("/api/chat/intro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId: newThreadId, text: introText, guestId: newGuestId }),
        });
        // Do not load thread here — messages stays empty so the greeting message is shown
        updateMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (promptName) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute bottom-full right-0 mb-4 w-80 overflow-hidden rounded-3xl bg-white shadow-hover"
      >
        <div className="relative px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-text-muted hover:bg-black/10"
            aria-label="Close chat"
          >
            <FiX size={14} />
          </button>

          <p className="font-inter text-base font-semibold text-text-dark">
            Please fill the information
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-2.5 font-inter text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-[#3DA7E4]"
            />
            <input
              type="tel"
              value={guestMobile}
              onChange={(e) => setGuestMobile(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGuestName(); }}
              placeholder="Your mobile number"
              className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-2.5 font-inter text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-[#3DA7E4]"
            />
            <button
              onClick={handleGuestName}
              disabled={!guestName.trim() || loading}
              className="rounded-2xl bg-[#3DA7E4] py-2.5 font-inter text-sm font-semibold text-white shadow-button disabled:opacity-60"
            >
              {loading ? "Starting..." : "Start messaging"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="absolute bottom-full right-0 mb-4 w-80 overflow-hidden rounded-3xl bg-white shadow-hover"
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ background: BRAND_BLUE }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Image src={logoUrl} alt="JoyToy" width={24} height={24} />
          </div>
          <div>
            <p className="font-inter text-base font-semibold">JoyToy Support</p>
            <p className="font-inter text-xs opacity-90">We reply as soon as possible</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white/40"
          aria-label="Close chat"
        >
          <FiX size={15} />
        </motion.button>
      </div>

      <div ref={scrollRef} className="flex flex-col gap-3 px-4 py-4 min-h-60 max-h-80 overflow-y-auto">
        {loading && !visibleMessages.length ? (
          <div className="text-sm text-text-muted">Loading chat...</div>
        ) : (
          visibleMessages.map((msg, i) => (
            <div key={msg.id || i} className={`flex gap-2.5 ${msg.sender === "customer" ? "justify-end" : "items-start"}`}>
              {msg.sender !== "customer" && (
                <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-soft-bg border border-white">
                  <Image src={logoUrl} alt="JoyToy" width={20} height={20} />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                  msg.sender === "customer"
                    ? "bg-[#3DA7E4] text-white rounded-tr-sm"
                    : "bg-soft-bg text-text-dark rounded-tl-sm"
                }`}
              >
                <p className="font-inter">{msg.text}</p>
                <p className={`mt-0.5 text-[10px] ${msg.sender === "customer" ? "text-white/70" : "text-text-muted"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl border border-gray-200 bg-soft-bg px-3 py-2.5 font-inter text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-[#3DA7E4] transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white shadow-button"
          style={{ background: BRAND_BLUE }}
          aria-label="Send message"
          onClick={sendMessage}
        >
          <FiSend size={15} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Floating Chat Button ────────────────────────────────────── */
export default function FloatingSocial() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] md:bottom-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={() => setChatOpen((v) => !v)}
        aria-label="Chat with JoyToy"
        className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-button transition-shadow hover:shadow-hover"
        style={{ background: BRAND_BLUE }}
      >
        <FiMessageCircle size={18} aria-hidden />
      </motion.button>
    </div>
  );
}
