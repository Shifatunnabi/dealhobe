"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { INFORMATION_LINKS } from "@/lib/information-pages";
import { FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin, FiShield } from "react-icons/fi";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Offers", href: "/offers" },
  { label: "Blogs", href: "/blogs" },
];

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState("/logo/main-logo.png");

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

  return (
    <footer className="bg-[#0f172a] text-text-light">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 md:px-8">

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1fr_1.2fr] lg:gap-8">

          {/* ── Brand column ────────────────────────────── */}
          <div className="lg:col-span-1">
            <Image
              src={logoUrl}
              alt="DealHobe"
              width={120}
              height={44}
              className="h-11 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="font-poppins text-sm leading-relaxed text-text-light/70 max-w-60">
              Premium cosmetics and beauty essentials for every woman in Bangladesh. Bringing global beauty home since 2022.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: FiFacebook, href: "#", label: "Facebook" },
                { icon: FiYoutube,  href: "#", label: "YouTube"   },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-text-light/70 transition-all hover:bg-primary-pink hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ─────────────────────────────── */}
          <div>
            <h3 className="font-poppins text-lg font-semibold text-text-light mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-poppins text-sm text-text-light/60 transition-colors hover:text-primary-pink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ─────────────────────────────────── */}
          <div>
            <h3 className="font-poppins text-lg font-semibold text-text-light mb-4">Information</h3>
            <ul className="flex flex-col gap-2.5">
              {INFORMATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-poppins text-sm text-text-light/60 transition-colors hover:text-primary-pink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-poppins text-lg font-semibold text-text-light mb-4">Contact Us</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5">
                <FiMapPin size={15} className="mt-0.5 shrink-0 text-primary-pink" />
                <span className="font-poppins text-sm text-text-light/60 leading-snug">
                  House 1/10, Block #A, Road #5, Lalmatia, Dhaka
                </span>
              </li>
              <li>
                <a
                  href="tel:+8801338886611"
                  className="flex items-center gap-2.5 font-poppins text-sm text-text-light/60 hover:text-primary-pink transition-colors"
                >
                  <FiPhone size={15} className="shrink-0 text-primary-pink" />
                  01338886611
                </a>
              </li>
              <li>
                <a
                  href="mailto:dealhobe26@gmail.com"
                  className="flex items-center gap-2.5 font-poppins text-sm text-text-light/60 hover:text-primary-pink transition-colors"
                >
                  <FiMail size={15} className="shrink-0 text-primary-pink" />
                  dealhobe26@gmail.com
                </a>
              </li>
            </ul>

            {/* Trust badge */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="flex items-center gap-1.5 font-poppins text-sm font-semibold text-primary-pink">
                <FiShield size={15} className="shrink-0" />
                Secure Shopping
              </p>
              <p className="font-poppins text-xs text-text-light/50 mt-0.5">SSL encrypted · COD available</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-white/8 pt-6 text-center md:flex-row md:justify-between">
          <p className="font-poppins text-xs text-text-light/40">
            © {new Date().getFullYear()} DealHobe Bangladesh. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: "Terms", href: "/terms-and-conditions" },
              { label: "Returns", href: "/refund-return-policy" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-poppins text-xs text-text-light/40 hover:text-primary-pink transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
