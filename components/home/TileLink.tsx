import Link from "next/link";
import BannerMedia from "./BannerMedia";
import LateMedia from "./LateMedia";
import type { Ratio, Tile } from "@/lib/homepage/types";

/** One clickable banner tile. External links open in a new tab; empty links render a plain banner. */
export default function TileLink({ tile, ratio, mobileRatio, sizes, priority, lowPriority, late, className = "" }: {
  tile: Tile; ratio?: Ratio; mobileRatio?: Ratio; sizes: string; priority?: boolean; lowPriority?: boolean; late?: boolean; className?: string;
}) {
  const Media = late ? LateMedia : BannerMedia;
  const media = (
    <>
      <Media src={tile.image} mobileSrc={tile.mobileImage || undefined} alt={tile.alt} ratio={ratio} mobileRatio={mobileRatio} sizes={sizes} priority={priority} lowPriority={lowPriority} />
      {tile.badge && (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-primary-pink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-button">
          {tile.badge}
        </span>
      )}
    </>
  );
  const cls = `tile-link relative ${className}`;
  if (!tile.link) return <div className={cls}>{media}</div>;
  if (/^https?:\/\//.test(tile.link)) {
    return <a href={tile.link} target="_blank" rel="noopener noreferrer" className={cls} aria-label={tile.alt}>{media}</a>;
  }
  return <Link href={tile.link} className={cls} aria-label={tile.alt}>{media}</Link>;
}
