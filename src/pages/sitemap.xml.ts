import type { APIRoute } from 'astro';
import { site, legalPages } from '../config';
import { getTrips } from '../lib/trips';

export const GET: APIRoute = async () => {
  const trips = await getTrips();
  const paths = [
    '/', '/trips/', '/book/', '/the-car/', '/three-tickets/', '/about/', '/faq/', '/contact/', '/concierge/',
    ...trips.map((t) => `/trips/${t.id}/`),
    ...legalPages.map((l) => l.href),
  ];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site.url).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
