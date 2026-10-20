# Three Tickets to Adventure

Website for Three Tickets to Adventure LLC: private Northern Arizona trips from Flagstaff, one party per car.

```bash
npm install
npm run dev            # http://localhost:4321
npm run build
npm run audit          # needs: npx playwright install chromium
npm run check:launch   # what still blocks going live
```

- **Continuing in Claude Code?** Open this folder and say: *"Read CLAUDE.md and docs/HANDOFF.md, then work through the handoff."*
- Facts (contact, vehicle, booking mode, credentials) live in `src/config.ts`.
- Trips are Markdown files in `src/content/trips/`.
- The site stays in preview (noindex, banner) until `launched: true`, which should only happen once `npm run check:launch` passes.
