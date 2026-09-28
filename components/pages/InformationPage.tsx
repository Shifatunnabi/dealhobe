import Link from "next/link";
import { FiArrowRight, FiMail, FiPhone } from "react-icons/fi";
import { INFORMATION_LINKS, type InformationPageContent } from "@/lib/information-pages";

export default function InformationPage({ content, pathname }: { content: InformationPageContent; pathname: string }) {
  return (
    <div className="bg-soft-bg pb-16 md:pb-24">
      <header className="border-b border-primary-pink/10 bg-linear-to-br from-white via-soft-bg to-soft-bg-alt">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Link href="/" className="hover:text-primary-pink">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{content.eyebrow}</span>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-pink">{content.eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.12]">{content.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{content.description}</p>
          <div className="mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {content.highlights.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-primary-pink/10 bg-white/90 p-6 md:p-8">
                <span aria-hidden="true" className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-pink/10 text-xs font-semibold text-primary-pink">0{index + 1}</span>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:pt-16">
        <aside>
          <div className="lg:sticky lg:top-32">
            <nav aria-label="Information pages" className="rounded-3xl border border-primary-pink/10 bg-white p-5">
              <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Explore DealHobe</p>
              <ul className="space-y-1">
                {INFORMATION_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm transition-colors ${pathname === link.href ? "bg-primary-pink text-white" : "text-slate-600 hover:bg-soft-bg hover:text-primary-pink"}`}>
                      {link.label}<FiArrowRight aria-hidden="true" className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="On this page" className="mt-6 px-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">On this page</p>
              <ul className="space-y-3">
                {content.sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="text-sm text-slate-600 hover:text-primary-pink">{section.title}</a></li>)}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="divide-y divide-primary-pink/10 rounded-3xl border border-primary-pink/10 bg-white px-6 md:px-10">
            {content.sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-32 py-8 md:py-10">
                <p aria-hidden="true" className="mb-3 text-xs font-semibold tracking-widest text-primary-pink">0{index + 1}</p>
                <h2 id={`${section.id}-title`} className="mb-5 text-xl font-semibold md:text-2xl">{section.title}</h2>
                <div className="space-y-4 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && <ul className="list-disc space-y-3 pl-5 marker:text-primary-pink">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-8 rounded-3xl bg-[#0f172a] p-7 text-white md:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary-yellow">Here to help</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Let’s talk.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">Have a question about a product or an order? Contact the DealHobe team. For order support, keep your order number handy.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:+8801338886611" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-soft-bg"><FiPhone aria-hidden="true" />01338886611</a>
              <a href="mailto:dealhobe26@gmail.com" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-sm hover:bg-white/10"><FiMail aria-hidden="true" />dealhobe26@gmail.com</a>
            </div>
          </div>
          <Link href="/products" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-pink">Explore our products <FiArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  );
}
