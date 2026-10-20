import type { APIRoute } from 'astro';
import { site } from '../config';

// Preview builds block all crawlers; launched builds allow them and point to the sitemap.
export const GET: APIRoute = () => {
  const body = site.launched
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
