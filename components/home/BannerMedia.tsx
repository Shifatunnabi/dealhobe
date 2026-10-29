import { getImageProps } from "next/image";
import LazyVideo from "./LazyVideo";
import { isVideo, ratioCss, type Ratio } from "@/lib/homepage/types";

type Props = {
  src: string;
  mobileSrc?: string;
  /** Still frame shown first for a video (desktop / phone); Cloudinary videos get one derived automatically. */
  poster?: string;
  mobilePoster?: string;
  alt: string;
  ratio?: Ratio;
  mobileRatio?: Ratio;
  /** Rendered width hint for the image optimizer, e.g. "(min-width: 1024px) 25vw, 50vw". */
  sizes: string;
  priority?: boolean;
  /** Off-screen carousel slides: keep them from competing with the visible banner for bandwidth. */
  lowPriority?: boolean;
  className?: string;
};

/** First frame of a Cloudinary-hosted video, as a still. */
function derivePoster(file: string): string | undefined {
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+?)\.(?:mp4|webm|mov)(?:\?.*)?$/i.exec(file);
  return m ? `${m[1]}so_0,f_auto,q_auto,w_1600/${m[2]}.jpg` : undefined;
}

/**
 * An image, animated GIF/WebP or looping video inside a box locked to the banner's aspect ratio.
 * The box keeps its shape at every width, so the media is never stretched; a phone-only file
 * (and shape) can be given for art-directed banners like the hero. Videos show a sharp poster first.
 */
export default function BannerMedia({ src, mobileSrc, poster, mobilePoster, alt, ratio, mobileRatio, sizes, priority, lowPriority, className = "" }: Props) {
  const style = {
    "--ar": ratioCss(ratio),
    ...(mobileRatio ? { "--ar-m": ratioCss(mobileRatio) } : {}),
  } as React.CSSProperties;
  const loading = priority ? undefined : "lazy";
  const fetchPriority = priority ? "high" : lowPriority ? "low" : undefined;
  const imageProps = (file: string) => getImageProps({ alt, src: file, fill: true, sizes, priority, quality: 75 }).props;

  const phoneFile = mobileSrc || src;
  const anyVideo = isVideo(src) || isVideo(phoneFile);
  let media: React.ReactNode;

  if (anyVideo) {
    // Poster (what loads first, and what Lighthouse measures) + a video that fades in after page load.
    const deskPoster = poster || (isVideo(src) ? derivePoster(src) : src);
    const phonePoster = mobilePoster || (isVideo(phoneFile) ? derivePoster(phoneFile) || poster : phoneFile) || deskPoster;
    media = (
      <>
        {(deskPoster || phonePoster) && (
          <picture>
            {deskPoster && <source media="(min-width: 768px)" srcSet={deskPoster} />}
            <img src={phonePoster || deskPoster} alt={alt} decoding="async" loading={loading} fetchPriority={fetchPriority} />
          </picture>
        )}
        {mobileSrc && isVideo(mobileSrc) && <LazyVideo src={mobileSrc} label={alt} className="md:hidden" />}
        {isVideo(src) && <LazyVideo src={src} label={alt} className={mobileSrc && isVideo(mobileSrc) ? "hidden md:block" : ""} />}
      </>
    );
  } else if (!mobileSrc || mobileSrc === src) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps already optimizes; alt is in the props
    media = <img {...imageProps(src)} loading={loading} fetchPriority={fetchPriority} style={undefined} />;
  } else {
    // Art direction: the browser downloads only the image that matches the screen.
    const desktop = imageProps(src);
    media = (
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps already optimizes; alt is in the props */}
        <img {...imageProps(mobileSrc)} loading={loading} fetchPriority={fetchPriority} style={undefined} />
      </picture>
    );
  }

  return <div className={`ar-box ${className}`} style={style}>{media}</div>;
}
