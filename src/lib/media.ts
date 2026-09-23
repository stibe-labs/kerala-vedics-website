// Cloudflare R2 Public CDN for fast video streaming with HTTP 206 Partial Content support
// NOTE: The pub-*.r2.dev public URL is rate-limited and blocked by some ISPs.
// TODO: Add a custom domain in Cloudflare R2 settings (e.g. media.keralavedics.com)
//       then update R2_MEDIA_BASE_URL to https://media.keralavedics.com
export const R2_MEDIA_BASE_URL = "https://pub-8cf40464cda343d4a1c746d4c2343e76.r2.dev";

export function getMediaUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/videos/")) {
    return `${R2_MEDIA_BASE_URL}${path}`;
  }
  return path;
}
