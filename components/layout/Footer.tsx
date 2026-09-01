"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

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

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">

          {/* ── Brand column ────────────────────────────── */}
          <div className="lg:col-span-1">
            <Image
              src={logoUrl}
              alt="JoyToy"
              width={120}
              height={44}
              className="h-11 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="font-inter text-sm leading-relaxed text-text-light/70 max-w-60">
              Premium imported toys for curious little minds in Bangladesh. Bringing global joy home since 2022.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: FiFacebook, href: "https://www.facebook.com/people/JoyToy/61586803048218/?mibextid=wwXIfr&rdid=TgrQrd2ZmYJd8ZO7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Gw29e9PZL%2F%3Fmibextid%3DwwXIfr", label: "Facebook" },
                { icon: FiYoutube,  href: "https://youtube.com/@joytoybd",   label: "YouTube"   },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
            <h3 className="font-inter text-lg font-semibold text-text-light mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-text-light/60 transition-colors hover:text-primary-pink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ─────────────────────────────────── */}
          <div>
            <h3 className="font-inter text-lg font-semibold text-text-light mb-4">Contact Us</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5">
                <FiMapPin size={15} className="mt-0.5 shrink-0 text-primary-pink" />
                <span className="font-inter text-sm text-text-light/60 leading-snug">
                  H 3, Rd - 19/A, Sector 4, Uttara, Dhaka
                </span>
              </li>
              <li>
                <a
                  href="tel:+8801339562735"
                  className="flex items-center gap-2.5 font-inter text-sm text-text-light/60 hover:text-primary-pink transition-colors"
                >
                  <FiPhone size={15} className="shrink-0 text-primary-pink" />
                  +880 1339-562735
                </a>
              </li>
              <li>
                <a
                  href="mailto:bdjoytoy@gmail.com"
                  className="flex items-center gap-2.5 font-inter text-sm text-text-light/60 hover:text-primary-pink transition-colors"
                >
                  <FiMail size={15} className="shrink-0 text-primary-pink" />
                  bdjoytoy@gmail.com
                </a>
              </li>
            </ul>

            {/* Trust badge */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-inter text-sm font-semibold text-primary-pink">🛡️ Secure Shopping</p>
              <p className="font-inter text-xs text-text-light/50 mt-0.5">SSL encrypted · COD available</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-white/8 pt-6 text-center md:flex-row md:justify-between">
          <p className="font-inter text-xs text-text-light/40">
            © {new Date().getFullYear()} JoyToy Bangladesh. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms", "Returns"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                className="font-inter text-xs text-text-light/40 hover:text-primary-pink transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
