import Link from "next/link";
import { FiArrowRight, FiChevronDown, FiMail, FiPhone } from "react-icons/fi";
import { INFORMATION_LINKS, type InformationPageContent } from "@/lib/information-pages";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import TocNav from "@/components/content/TocNav";

export default function InformationPage({ content, pathname }: { content: InformationPageContent; pathname: string }) {
  const toc = content.sections.map((s) => ({ id: s.id, title: s.title }));
  const otherPages = INFORMATION_LINKS.filter((l) => l.href !== pathname);

  return (
    <div className="bg-soft-bg pb-20 pt-4 md:pb-28 md:pt-6">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: content.eyebrow }]} />

        {/* Intro */}
        <header className="mt-6 grid gap-8 border-b border-[#EADDE3] pb-10 md:mt-10 md:pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-pink">{content.eyebrow}</p>
            <h1 className="mt-3 max-w-2xl font-display text-[2.3rem] font-semibold leading-[1.06] text-text-dark text-balance md:text-[3.5rem]">
              {content.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">{content.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {content.highlights.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-[#F1E7EB] bg-white p-5 shadow-tile">
                <span aria-hidden className="font-display text-sm font-semibold text-gold-dark">0{index + 1}</span>
                <h2 className="mt-1.5 font-body text-base font-bold text-text-dark">{item.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-8 grid gap-8 md:mt-12 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
          {/* Table of contents */}
          <aside>
            <details className="group rounded-2xl border border-[#F1E7EB] bg-white px-4 py-3 shadow-tile lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-text-dark [&::-webkit-details-marker]:hidden">
                On this page
                <FiChevronDown className="text-text-muted transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <ol className="mt-3 flex flex-col gap-2 border-t border-[#F1E7EB] pt-3">
                {toc.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-3 text-sm text-text-muted hover:text-primary-pink">
                      <span className="text-xs font-bold tabular-nums text-[#B9A9B2]">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            <div className="sticky top-44 hidden lg:block">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">On this page</p>
              <nav aria-label="On this page">
                <TocNav sections={toc} />
              </nav>
              <nav aria-label="More information" className="mt-10">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Help & policies</p>
                <ul className="flex flex-col gap-1">
                  {INFORMATION_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          pathname === link.href ? "bg-plum/[0.06] font-semibold text-plum" : "text-text-muted hover:bg-white hover:text-text-dark"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            <div className="max-w-[68ch]">
              {content.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-44 border-b border-[#EFE3E8] py-8 first:pt-0 last:border-0 md:py-10"
                >
                  <p aria-hidden className="font-display text-sm font-semibold text-gold-dark">{String(index + 1).padStart(2, "0")}</p>
                  <h2 id={`${section.id}-title`} className="mt-1 font-display text-[1.55rem] font-semibold leading-tight text-text-dark md:text-[1.9rem]">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-[16px] leading-[1.8] text-[#4A3843] md:text-[17px]">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.bullets && (
                      <ul className="space-y-2.5 pl-1">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary-pink" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Help */}
            <div className="relative mt-8 overflow-hidden rounded-[24px] bg-plum p-6 text-white md:p-9">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary-pink/45 blur-3xl" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Here to help</p>
                <h2 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight">Questions? Talk to a real person.</h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75">
                  Ask about a product, an order or delivery — keep your order number handy and we’ll sort it out quickly.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="tel:+8801338886611" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-plum hover:bg-ivory">
                    <FiPhone aria-hidden /> 01338886611
                  </a>
                  <a href="mailto:dealhobe26@gmail.com" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10">
                    <FiMail aria-hidden /> dealhobe26@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/products" className="group flex items-center justify-between gap-3 rounded-2xl bg-primary-pink px-5 py-4 text-sm font-bold text-white shadow-button hover:bg-[#8E1712] sm:col-span-2 lg:col-span-1">
                Shop products <FiArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              {otherPages.map((l) => (
                <Link key={l.href} href={l.href} className="group flex items-center justify-between gap-3 rounded-2xl border border-[#F1E7EB] bg-white px-5 py-4 text-sm font-semibold text-text-dark shadow-tile hover:border-primary-pink/40 hover:text-primary-pink">
                  {l.label} <FiArrowRight className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
