"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authInputClass } from "./AuthShell";

/** Password input with a show/hide toggle. */
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: "current-password" | "new-password";
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className={`${authInputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-plum/5 hover:text-text-dark"
      >
        {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
      </button>
    </div>
  );
}
