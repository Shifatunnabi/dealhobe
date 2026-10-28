import { FiShield, FiTruck, FiDollarSign, FiRefreshCw, FiGift, FiHeadphones, FiStar, FiAward } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { TrustBadge } from "@/lib/homepage/types";

export const TRUST_ICONS: Record<string, IconType> = {
  shield: FiShield, truck: FiTruck, cash: FiDollarSign, refresh: FiRefreshCw,
  gift: FiGift, support: FiHeadphones, star: FiStar, award: FiAward,
};

export default function TrustBadges({ badges }: { badges: TrustBadge[] }) {
  if (!badges.length) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 rounded-2xl bg-plum p-4 text-white md:grid-cols-4 md:gap-6 md:p-6">
      {badges.map((b) => {
        const Icon = TRUST_ICONS[b.icon] ?? FiShield;
        return (
          <li key={b.title} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold md:h-12 md:w-12">
              <Icon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight md:text-base">{b.title}</span>
              <span className="block text-xs leading-snug text-white/65">{b.text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
