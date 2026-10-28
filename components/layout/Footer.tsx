import Link from "next/link";
import Image from "next/image";
import { INFORMATION_LINKS } from "@/lib/information-pages";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp } from "react-icons/fa";
import type { Storefront } from "@/lib/homepage/types";

export type FooterStorefront = Pick<Storefront, "contact" | "socials" | "footerAbout"> & { logoUrl: string };

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "All products", href: "/products" },
  { label: "Offers", href: "/offers" },
  { label: "Beauty blog", href: "/blogs" },
  { label: "My account", href: "/profile" },
];

const PAYMENTS = ["Cash on delivery", "bKash", "Nagad", "Visa", "Mastercard"];

export default function Footer({ storefront }: { storefront: FooterStorefront }) {
  const { contact, socials } = storefront;
  const socialLinks = [
    { href: socials.facebook, label: "Facebook", Icon: FaFacebookF },
    { href: socials.instagram, label: "Instagram", Icon: FaInstagram },
    { href: socials.youtube, label: "YouTube", Icon: FaYoutube },
    { href: socials.tiktok, label: "TikTok", Icon: FaTiktok },
    { href: contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` : "", label: "WhatsApp", Icon: FaWhatsapp },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-auto overflow-hidden bg-plum text-text-light">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-pink/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />

      <div className="shell relative pt-14 pb-28 md:pb-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Image src={storefront.logoUrl} alt="DealHobe" width={120} height={44} className="mb-4 h-12 w-auto object-contain brightness-0 invert" />
            <p className="max-w-xs text-sm leading-relaxed text-white/70">{storefront.footerAbout}</p>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-gold hover:text-plum">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-gold">Shop</h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold text-gold">Help</h3>
            <ul className="flex flex-col gap-2.5">
              {INFORMATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-4 font-display text-lg font-semibold text-gold">Contact us</h3>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              {contact.address && (
                <li className="flex items-start gap-2.5"><FiMapPin size={15} className="mt-0.5 shrink-0 text-gold" />{contact.address}</li>
              )}
              {contact.phone && (
                <li><a href={`tel:${contact.phone}`} className="flex items-center gap-2.5 transition-colors hover:text-white"><FiPhone size={15} className="shrink-0 text-gold" />{contact.phone}</a></li>
              )}
              {contact.email && (
                <li><a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 break-all transition-colors hover:text-white"><FiMail size={15} className="shrink-0 text-gold" />{contact.email}</a></li>
              )}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <span key={p} className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75">{p}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-2 border-t border-white/10 pt-6 text-center md:flex-row md:justify-between">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} DealHobe Bangladesh. All rights reserved.</p>
          <a href="https://seltiv.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/50 transition-colors hover:text-gold">
            Developed by <span className="font-semibold">SELTIV</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
