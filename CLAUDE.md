# Three Tickets to Adventure — website

Marketing and booking-request site for **Three Tickets to Adventure LLC**: private Northern Arizona trips from Flagstaff, one party per car, in a 2021 Toyota Highlander Platinum Hybrid. Static Astro 5 site. The owner's son (the person you are working with) works in cybersecurity; the driver is his dad.

**Start every session by reading `docs/HANDOFF.md`** and continuing from the first unchecked task. Work autonomously; batch every question for the user into one message (see "Asking the user" in HANDOFF).

## Commands

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # must pass; trip rules are enforced at build time
npm run audit          # every page × 5 widths: overflow, links, titles; screenshots in audit/
npm run check:launch   # go-live gate; exits 1 while anything blocks launch
```

`npm run audit` needs Chromium: `npx playwright install chromium` once (or set `CHROMIUM_PATH`).

## Where things live

- `src/config.ts`: name, contact, booking mode, vehicle facts, credentials, readiness. Change facts here, never hard-code them in pages.
- `src/content/trips/*.md`: one file per trip; schema in `src/content.config.ts`.
- `src/lib/trips.ts`: `getTrips()` enforces the permit and capacity rules; every page must load trips through it.
- `src/pages/book.astro`: booking request form (client-side pricing and validation).
- `src/pages/legal/*.md`: legal drafts, `draft: true` until an Arizona attorney reviews them.
- `scripts/prelaunch-check.mjs`, `scripts/audit.mjs`: the two gates.

## Hard rules (do not break, even if asked casually; confirm with the user first)

1. **Never mark a trip `bookable: true` unless its permit status is `none` or `held`.** The build fails otherwise. Grand Canyon, Sedona, airport transfers, the monuments loop and Page are all waiting on permits.
2. **Never show a permit, license or insurance that is not held.** Credentials render only when `status: 'held'`.
3. **No invented reviews, testimonials, ratings, guest counts or photos presented as real.** Illustrated landscapes are fine until real photos arrive.
4. **Prices are per vehicle**, Arizona tax included; park fees, tastings and tickets are pass-through at cost and listed per trip.
5. **Arizona only.** No Las Vegas pickups or Utah destinations (interstate trips need federal operating authority and $1.5M insurance).
6. **Card data never touches this site.** Payment happens on the booking platform's hosted checkout or a payment link. No embedded card fields.
7. **No cookies, no ad pixels, no third-party trackers.** Cookieless analytics only. Self-hosted fonts.
8. **`launched: false` until `npm run check:launch` exits 0.** Preview builds are noindex and block crawlers.
9. Keep copy plain and specific: short sentences, real numbers, no hype words. Mark anything unverified in `PLACEHOLDERS` or `readiness`, never present it as fact.
10. Accessibility: WCAG 2.1 AA. Keep `npm run audit` clean.

## Before every commit

`npm run build && npm run audit` must pass. Commit in small steps with clear messages.
