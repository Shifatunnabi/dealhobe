import { getImageProps } from "next/image";
import LazyVideo from "./LazyVideo";
import { isVideo, ratioCss, type Ratio } from "@/lib/homepage/types";

type Props = {
  src: string;
  mobileSrc?: string;
  alt: string;
  ratio?: Ratio;
  mobileRatio?: Ratio;
  /** Rendered width hint for the image optimizer, e.g. "(min-width: 1024px) 25vw, 50vw". */
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * An image, animated GIF/WebP or looping MP4 inside a box locked to the banner's aspect ratio.
 * The box keeps its shape at every width, so the media is never stretched; a phone-only file
 * (and shape) can be given for art-directed banners like the hero.
 */
export default function BannerMedia({ src, mobileSrc, alt, ratio, mobileRatio, sizes, priority, className = "" }: Props) {
  const style = {
    "--ar": ratioCss(ratio),
    ...(mobileRatio ? { "--ar-m": ratioCss(mobileRatio) } : {}),
  } as React.CSSProperties;
  const loading = priority ? undefined : "lazy";
  const imageProps = (file: string) => getImageProps({ alt, src: file, fill: true, sizes, priority, quality: 75 }).props;

  let media: React.ReactNode;
  if (!mobileSrc || mobileSrc === src) {
    media = isVideo(src)
      ? <LazyVideo src={src} label={alt} eager={priority} />
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps already optimizes; alt is in the props
      : <img {...imageProps(src)} loading={loading} style={undefined} />;
  } else if (!isVideo(src) && !isVideo(mobileSrc)) {
    // Art direction: the browser downloads only the image that matches the screen.
    const desktop = imageProps(src);
    media = (
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps already optimizes; alt is in the props */}
        <img {...imageProps(mobileSrc)} loading={loading} style={undefined} />
      </picture>
    );
  } else {
    // A video on one screen size and an image on the other: one element per breakpoint. The hidden one never
    // loads — lazy images inside display:none are skipped and LazyVideo waits until it intersects.
    const one = (file: string, cls: string) => isVideo(file)
      ? <LazyVideo src={file} label={alt} eager={priority} className={cls} />
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps already optimizes; alt is in the props
      : <img {...imageProps(file)} loading="lazy" style={undefined} className={cls} />;
    media = <>{one(mobileSrc, "md:hidden")}{one(src, "hidden md:block")}</>;
  }

  return <div className={`ar-box ${className}`} style={style}>{media}</div>;
}
