import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * A trip is one Markdown file in src/content/trips. Every field below is
 * required unless marked optional, so a trip missing its price, season,
 * permit status or accessibility notes fails the build.
 *
 * Permit rule (enforced in src/lib/trips.ts): a trip can only be `bookable`
 * when its permit status is 'none' or 'held'.
 */
const trips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/trips' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    summary: z.string().max(260),
    order: z.number(),
    art: z.enum(['canyon', 'canyon-sunset', 'redrock', 'wine', 'night', 'transfer', 'heritage', 'horseshoe']),
    category: z.enum(['Grand Canyon', 'Red rocks', 'Wine country', 'Night sky', 'Transfers', 'Ancient Arizona', 'Page']),
    hours: z.string(),
    fromFlagstaff: z.string(),
    effort: z.enum(['Relaxed', 'Some walking', 'Active']),
    maxGuests: z.number().int().min(1).max(6),
    priceBase: z.number().int().positive(),
    extraGuest: z.number().int().nonnegative().optional(),
    variants: z
      .array(z.object({ id: z.string(), label: z.string(), price: z.number().int().positive(), note: z.string() }))
      .optional(),
    months: z.array(z.number().int().min(1).max(12)).min(1),
    seasonNote: z.string(),
    permit: z.object({
      status: z.enum(['none', 'needed', 'unconfirmed', 'held']),
      authority: z.string(),
      note: z.string(),
    }),
    bookable: z.boolean(),
    launch: z.string(),
    bookingUrl: z.string().url().optional(),
    stops: z.array(z.object({ name: z.string(), note: z.string() })).min(1),
    includes: z.array(z.string()).min(1),
    passThrough: z.array(z.string()),
    bring: z.array(z.string()),
    notFor: z.array(z.string()).min(1),
    accessibility: z.object({
      stepIn: z.string(),
      walking: z.string(),
      restrooms: z.string(),
      altitude: z.string(),
    }),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })),
    description: z.string().max(170),
  }),
});

export const collections = { trips };
