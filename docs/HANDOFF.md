# Handoff: finish and launch the Three Tickets to Adventure site

You are Claude Code, continuing a build started in a claude.ai planning chat. The user wants to do as little as possible until the website is ready. Work through the tasks below **in order, without stopping for approval**, ticking each box in this file as you finish it and committing after each task. Only stop when a task needs something only the user can provide; collect those needs and ask once (see "Asking the user").

The full business plan (permits, insurance, pricing rationale, roadmap) lives in the claude.ai doc **"Three Tickets to Adventure — Master Plan"**. The decisions that matter for code are summarized here and in `CLAUDE.md`.

## What already exists (done in the planning chat)

- Astro 5 static site, 22 pages: home, all trips with filters and comparison table, 7 trip pages, booking request form, the car, the Three Tickets bundle, about, FAQ, contact, hotel-concierge page, 6 legal drafts, 404, robots.txt, sitemap.xml.
- Trip content model with build-time rules: unpermitted trips cannot be bookable; group size capped at the car's 6 guests.
- Booking request flow with live per-vehicle pricing, extra-guest fee, 48-hour notice rule, season check, referral codes (`/book/?ref=CODE`) and a mailto fallback. Tested in a headless browser.
- `npm run audit` (pages × 5 widths) and `npm run check:launch` (go-live gate), both working.
- Security headers in `public/_headers` (CSP, HSTS, no framing).

Bookable at launch (no land permit needed): **Wine country and Jerome**, **Night sky at Lowell Observatory**. Everything else shows "Opening ..." with a notify link until its permit is held.

## Decisions already made (do not re-ask)

| Topic | Decision |
| --- | --- |
| Base | Flagstaff, AZ; Sedona pickups on trips that pass through |
| Vehicle | 2021 Toyota Highlander Platinum Hybrid, FWD; max 6 guests, base price covers 4 |
| Booking now | Request form → driver confirms within 24 h → payment link. `booking.provider: 'request'` |
| Booking later | Hosted platform, default **Bókun** (operator-paid fee keeps prices all-inclusive); FareHarbor if zero monthly cost matters more. Switch via `booking.provider` + each trip's `bookingUrl` |
| Hosting | Static host with `_headers` support: **Cloudflare Pages** (default) or Netlify |
| Analytics | Cookieless only (Cloudflare Web Analytics or Plausible) |
| Scope | Arizona only; no Las Vegas, no Utah |

## Phase 1: code tasks you can finish alone (no accounts needed)

- [ ] **1. Repo hygiene.** If this code is still on the `claude/three-tickets-site` branch of the public `Personal-Projects` repo, ask the user (in the batched question) whether to move it to its own private repo; until then keep working on this branch.
- [ ] **2. CI.** Confirm `.github/workflows/ci.yml` runs `npm ci`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run audit` on every push and PR. Fix anything that fails.
- [ ] **3. Unit tests.** Add Vitest. Test: pricing (base, variants, extra guests, cap at 6), `seasonLabel`, and that `getTrips()` throws when a trip with permit `needed` is bookable (use a temporary fixture). Add `npm test` and run it in CI.
- [ ] **4. Booking form backend switch.** Make `booking.formEndpoint` work with **Web3Forms** (free, no server; needs an access key the user gets by email). Keep the mailto fallback. Extend the CSP `connect-src` for `https://api.web3forms.com` only when the endpoint is set (document it in `_headers`).
- [ ] **5. Printable driver trip sheet.** A `/trip-sheet/[slug]/` page per trip (noindex, not linked from nav) with stops, timings, emergency numbers and space for guest details, styled for print. The driver saves it before trips with no signal.
- [ ] **6. Concierge rate card.** A print-friendly `/concierge/rate-card/` page (noindex) listing bookable trips and the referral link format, one sheet of paper.
- [ ] **7. Question pages for search.** Write 3 short, genuinely useful pages linked from the FAQ, each pointing to the trip that answers it: "Grand Canyon from Flagstaff without a car", "Sedona and wine country with a designated driver", "What to do in Flagstaff at night". Plain, factual, no keyword stuffing. Add them to the sitemap.
- [ ] **8. Gift voucher page (coming soon).** `/gift-vouchers/` explaining vouchers arrive with online payment, with a notify link. No fake checkout.
- [ ] **9. Open Graph image.** Generate a 1200×630 PNG at build time or commit one static image from the illustrated landscape; reference it in `Base.astro`.
- [ ] **10. Accessibility pass.** Keyboard-walk every page, check focus order and contrast, make the booking form's error summary focusable and linked to fields. Keep `npm run audit` clean.

## Asking the user (one message, then keep going)

When Phase 1 is done, send the user **one** message with only the items still missing, in this form, and continue with anything that does not depend on the answers:

1. Domain: buy `threeticketstoadventure.com` (or tell me the domain you bought).
2. Business phone number for the site (a Google Voice or OpenPhone number, not Dad's personal or Uber number).
3. Business email addresses: `hello@` and `bookings@` on the domain, or two addresses to use for now.
4. Dad's first name and 3 to 4 true sentences about him for the About page; which languages he speaks.
5. Highlander check: 7 or 8 seats? Panoramic roof, heated/ventilated seats, USB ports at each row: yes or no? Luggage with 3 guests.
6. Cloudflare: log in once with `npx wrangler login` (or create an API token with Pages:Edit and paste it as `CLOUDFLARE_API_TOKEN`).
7. Web3Forms access key (sent to the bookings email after signing up at web3forms.com), or "use mailto for now".
8. Move the code to its own private GitHub repo: yes or no.

## Phase 2: wire in what the user provides

- [ ] **11.** Fill `src/config.ts` contact, domain, driver; remove each item from `PLACEHOLDERS`. Update `site` in `astro.config.mjs` to the domain.
- [ ] **12.** Vehicle facts from the user's answers; set `vehicle.verified: true`; update the seating plan SVG in `src/pages/the-car.astro` if 8 seats.
- [ ] **13.** Set `booking.formEndpoint` if a Web3Forms key was given; test a real submission to the bookings inbox.
- [ ] **14.** Deploy a **preview** to Cloudflare Pages (`npx wrangler pages deploy dist --project-name three-tickets`), confirm `_headers` are served (check response headers), and send the user the preview URL.
- [ ] **15.** Add cookieless analytics (Cloudflare Web Analytics beacon or Plausible) and extend CSP for it only.

## Phase 3: launch (blocked on the real world, not on code)

`npm run check:launch` lists what is left. The non-code blockers, for the user and his dad:

- ADOT Vehicle for Hire company permit; commercial auto insurance on the Highlander with the LLC as named insured; Arizona TPT license. Mark each `held` in `config.credentials` with its detail (e.g. permit number) once issued.
- Arizona attorney reviews the six legal pages; then set `draft: false` and delete the "Note for review" in `release.md`.
- Vehicle readiness in `config.readiness`: open Toyota recalls completed (two affect passenger safety: 26V128000 2nd-row seat recliner, 23V865000 passenger airbag sensor), yearly brake and tire inspection, background check on file, zero-tolerance policy adopted, first-aid kit and water.
- Real photos: the car (inside and out, with Dad), and guests at each bookable stop with permission. Replace the About placeholder.
- Measure walking distances for each trip's access table.

When `npm run check:launch` exits 0: set `launched: true`, build, audit, deploy to production on the real domain, submit the sitemap in Google Search Console, and tell the user it is live.

## Phase 4: after launch (as permits arrive)

- When a permit is issued: set that trip's `permit.status: held`, `bookable: true`, update `launch`, add the credential, rebuild. Grand Canyon CUA applications for 2027 close April 30, 2027.
- When the booking platform account exists: set `booking.provider`, add each trip's `bookingUrl`, extend CSP for the platform domain only, and test the hand-off end to end.
- Then: gift vouchers through the platform, review-request automation, Google Business Profile link in `config.social`.

## Definition of done for "website ready"

Deployed on the real domain over HTTPS with security headers; `npm run build`, `npm run audit`, `npm test` and `npm run check:launch` all pass; a test booking request reaches the bookings inbox; the user has the URL.
