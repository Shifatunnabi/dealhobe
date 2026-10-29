import Link from "next/link";
import { FiCheck, FiGift, FiPackage, FiZap } from "react-icons/fi";
import Breadcrumbs from "./Breadcrumbs";

const BENEFITS = [
  { icon: FiPackage, title: "Track every order", text: "See status updates and order history in one place." },
  { icon: FiZap, title: "Faster checkout", text: "Saved addresses fill in for you — order in seconds." },
  { icon: FiGift, title: "Exclusive offers", text: "Members hear first about drops, deals and restocks." },
];

/** Split auth layout: brand/benefits panel on desktop, a clean single column on phones. */
export default function AuthShell({
  crumb,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  crumb: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="bg-soft-bg pb-16 pt-4 md:pb-24 md:pt-6">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: crumb }]} />

        <div className={`mx-auto mt-4 grid overflow-hidden rounded-[28px] border border-[#F1E7EB] bg-white shadow-card md:mt-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] ${wide ? "max-w-[1180px]" : "max-w-[1080px]"}`}>
          {/* Brand panel (desktop) */}
          <aside className="relative hidden overflow-hidden bg-plum p-12 text-white lg:flex lg:flex-col">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-pink/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute inset-6 rounded-[22px] border border-gold/25" />

            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">The DealHobe account</p>
              <p className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.08]">
                Your beauty edit,<br />
                <em className="font-semibold italic text-[#F2D9A6]">beautifully kept.</em>
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
                One account for every order, address and offer — made for shopping authentic cosmetics across Bangladesh.
              </p>
            </div>

            <ul className="relative mt-10 flex flex-col gap-5">
              {BENEFITS.map(({ icon: Icon, title: t, text }) => (
                <li key={t} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-white/10 text-gold">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold">{t}</span>
                    <span className="block text-sm text-white/70">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="relative mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-10 text-xs font-semibold text-white/70">
              {["100% authentic", "Cash on delivery", "Nationwide delivery"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><FiCheck className="text-gold" aria-hidden /> {t}</span>
              ))}
            </p>
          </aside>

          {/* Form column */}
          <section className="px-5 py-8 sm:px-10 md:py-12 lg:px-14">
            <div className="mx-auto w-full max-w-[460px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">{eyebrow}</p>
              <h1 className="mt-2 font-display text-[2rem] font-semibold leading-tight text-text-dark md:text-[2.4rem]">{title}</h1>
              <p className="mt-2 text-sm text-text-muted md:text-[15px]">{subtitle}</p>

              {/* Benefits, compact (phones/tablets) */}
              <ul className="mt-5 flex flex-wrap gap-2 lg:hidden">
                {BENEFITS.map(({ icon: Icon, title: t }) => (
                  <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-plum/[0.05] px-3 py-1.5 text-xs font-semibold text-plum">
                    <Icon size={13} aria-hidden className="text-primary-pink" /> {t}
                  </li>
                ))}
              </ul>

              <div className="mt-7">{children}</div>

              <div className="mt-7 border-t border-[#F1E7EB] pt-6 text-center text-sm text-text-muted">{footer}</div>
              <p className="mt-4 text-center text-xs text-text-muted">
                Just browsing?{" "}
                <Link href="/products" className="font-semibold text-text-dark underline decoration-gold underline-offset-4 hover:text-primary-pink">
                  You can shop and check out as a guest
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Labelled input row used by the auth forms (16px text, so iOS never zooms). */
export function AuthField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-semibold text-text-dark">
        {label}
        {hint && <span className="text-xs font-medium text-text-muted">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-[#E8DCE1] bg-white px-4 py-3 text-base text-text-dark outline-none transition-[border-color,box-shadow] placeholder:text-[#B3A5AE] focus:border-primary-pink focus:shadow-[0_0_0_4px_rgba(164,27,21,0.08)] aria-[invalid=true]:border-primary-pink";
