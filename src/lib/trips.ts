import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../config';

export type Trip = CollectionEntry<'trips'>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * All trips, sorted, with the permit rule enforced. Every page goes through
 * this function, so breaking the rule fails `astro build` with a clear error.
 */
export async function getTrips(): Promise<Trip[]> {
  const trips = await getCollection('trips');
  const problems: string[] = [];
  for (const t of trips) {
    const { permit, bookable, maxGuests, bookingUrl } = t.data;
    if (bookable && !(permit.status === 'none' || permit.status === 'held')) {
      problems.push(
        `"${t.id}" is marked bookable but its permit status is "${permit.status}" (${permit.authority}). ` +
          `Set bookable: false until the permit is held.`,
      );
    }
    if (maxGuests > site.vehicle.maxGuests) {
      problems.push(`"${t.id}" allows ${maxGuests} guests; the car takes ${site.vehicle.maxGuests}.`);
    }
    if (bookable && site.booking.provider !== 'request' && !bookingUrl) {
      problems.push(`"${t.id}" is bookable but has no bookingUrl for provider "${site.booking.provider}".`);
    }
  }
  if (problems.length) {
    throw new Error('Trip content failed the permit and capacity rules:\n- ' + problems.join('\n- '));
  }
  return trips.sort((a, b) => {
    if (a.data.bookable !== b.data.bookable) return a.data.bookable ? -1 : 1;
    return a.data.order - b.data.order;
  });
}

export const extraGuestFee = (t: Trip) => t.data.extraGuest ?? site.booking.extraGuestDefault;

export const fromPrice = (t: Trip) =>
  t.data.variants?.length ? Math.min(t.data.priceBase, ...t.data.variants.map((v) => v.price)) : t.data.priceBase;

export const usd = (n: number) => '$' + n.toLocaleString('en-US');

/** "Year-round" or a compact month span such as "Apr to Oct". */
export function seasonLabel(months: number[]): string {
  if (months.length === 12) return 'Year-round';
  const sorted = [...months].sort((a, b) => a - b);
  return `${MONTHS[sorted[0] - 1]} to ${MONTHS[sorted[sorted.length - 1] - 1]}`;
}

export const permitLabel: Record<Trip['data']['permit']['status'], string> = {
  none: 'No land permit needed',
  held: 'Permit held',
  needed: 'Opens once our permit is issued',
  unconfirmed: 'Opens once the route is cleared with the land manager',
};
