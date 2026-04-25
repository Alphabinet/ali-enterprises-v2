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
  // 1. Local images (stored in your public folder) return directly
  if (src.startsWith('/')) {
    return src;
  }

  // 2. Bypass proxy for UI Avatars. 
  // They are already tiny and fast; proxying them adds unnecessary delay.
  if (src.includes('ui-avatars.com')) {
    return src;
  }

  // 3. Process Firebase images through the proxy.
  // Added &maxage=31536000 to force the browser to cache the optimized image for 1 year.
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}&output=webp&maxage=31536000`;
}