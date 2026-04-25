// image-loader.ts

export default function customImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // For local images (e.g., stored in your public folder), return the source directly
  if (src.startsWith('/')) {
    return src;
  }

  // For remote images (like Firebase and UI Avatars), use the free wsrv.nl proxy 
  // to automatically optimize, resize, and convert to WebP format
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}&output=webp`;
}
