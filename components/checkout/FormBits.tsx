"use client";

import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { cn } from "@/lib/utils";

/* Inputs are 16px on phones (no iOS zoom-on-focus) and at least 48px tall. */
const inputBase =
  "w-full rounded-xl border bg-white px-4 text-base text-text-dark transition-[border-color,box-shadow] duration-150 placeholder:text-text-muted/55 focus:outline-none focus:ring-4 md:text-[15px]";
const inputState = (invalid: boolean, disabled: boolean) =>
  disabled
    ? "cursor-not-allowed border-[#EFE6EA] bg-[#FBF7F8] text-text-muted"
    : invalid
    ? "border-primary-pink/70 focus:border-primary-pink focus:ring-primary-pink/10"
    : "border-[#E4D6DC] hover:border-[#D3C0C8] focus:border-plum/60 focus:ring-plum/[0.07]";

export function FieldMessage({ id, error, warning }: { id: string; error?: string; warning?: string }) {
  if (error)
    return (
      <p id={id} role="alert" className="flex items-start gap-1.5 text-[13px] font-medium text-primary-pink">
        <FiAlertCircle size={14} className="mt-[3px] shrink-0" />
        {error}
      </p>
    );
  if (warning)
    return (
      <p id={id} className="flex items-start gap-1.5 text-[13px] font-medium text-[#9A6A10]">
        <FiInfo size={14} className="mt-[3px] shrink-0" />
        {warning}
      </p>
    );
  return null;
}

export function Field({
  label,
  id,
  type = "text",
  placeholder,
  required = false,
  optional = false,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  warning,
  autoComplete,
  inputMode,
  className,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  warning?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  const msgId = `${id}-msg`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-text-dark">
        {label}
        {required && <span className="ml-0.5 text-primary-pink" aria-hidden>*</span>}
        {optional && <span className="ml-1 font-normal text-text-muted">(optional)</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || warning ? msgId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(inputBase, "h-12", inputState(Boolean(error), disabled))}
      />
      <FieldMessage id={msgId} error={error} warning={warning} />
    </div>
  );
}

export function TextareaField({
  label,
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error,
  autoComplete,
}: {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  const msgId = `${id}-msg`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-text-dark">
        {label}
        {required && <span className="ml-0.5 text-primary-pink" aria-hidden>*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        placeholder={placeholder}
        rows={3}
        value={value}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? msgId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(inputBase, "resize-none py-3 leading-relaxed", inputState(Boolean(error), disabled))}
      />
      <FieldMessage id={msgId} error={error} />
    </div>
  );
}

export function StepCard({
  step,
  title,
  aside,
  done = false,
  children,
  id,
}: {
  step: number;
  title: string;
  aside?: React.ReactNode;
  done?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id ?? `step-${step}`}-title`} className="scroll-mt-40 rounded-3xl border border-[#F1E6EA] bg-white p-5 shadow-tile md:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
              done ? "bg-[#1F8A4C] text-white" : "bg-plum text-[#E9C98C]",
            )}
            aria-hidden
          >
            {done ? "✓" : step}
          </span>
          <h2 id={`${id ?? `step-${step}`}-title`} className="font-display text-xl font-semibold text-text-dark md:text-[22px]">
            {title}
          </h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
