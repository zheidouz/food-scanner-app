# 🧠 Team Consilium — Sprint 1 Plan Review

**Date:** June 3, 2026  
**Project:** Food Scanner App  
**Format:** Sprint Plan Validation — each agent reviews from their perspective

---

## Kira (Product Designer)

> *"Is it fun? Is it useful? Would I use this every day?"*

**Initial Read:** The sprint covers the essentials — scan, analyze, display. But I see a UX gap.

**Key Concerns:**
1. **No "wow" factor in the first scan.** The user points camera → loading → card with scores. That's functional but not delightful. We need a micro-animation or haptic feedback on scan success to make it feel magical.
2. **Onboarding is too passive.** "Skip-able 3 screens" is fine, but we should offer a demo scan (a pre-loaded product) so users see the value *before* scanning something themselves.
3. **The Good/Bad card layout needs visual parity.** If "Bad" has more red flags than "Good" has positives, it'll feel punitive. We need balanced visual weight — maybe a circular health score at top center, then two equal-width columns below.

**Suggestions:**
- Add scan success haptic + subtle particle burst (P2 → P1)
- Add a "Demo Scan" button on the camera screen (new P1 task)
- Design the result card with equal visual weight for Good/Bad

---

## Milo (Art/Visual Director)

> *"Does this look and feel right? Is the design system coherent?"*

**Initial Read:** The blueprint mentions "soft blues and greens, calming aesthetic." I love that direction. But there's nothing in Sprint 1 about establishing the design system.

**Key Concerns:**
1. **No design tokens or theme defined.** If Nova starts building screens without a color palette, typography scale, and spacing system, we'll have 5 different-looking screens by sprint end.
2. **The Health Score visualization needs thought.** A 0–100 number is boring. Let's use a circular gauge with a gradient (red→yellow→green) — visually scannable in 0.3 seconds.
3. **Nutri-Score letters need custom rendering.** The standard A–E letters with green→red backgrounds are small on mobile. We should design larger, bolder badges.

**Suggestions:**
- Sprint 1 must include a `theme.ts` file with colors, fonts, spacing (P0 — add to scaffold task)
- Design the Health Score as a circular gauge, not just a number
- Custom Nutri-Score badges with accessible color contrast

---

## Nova (Frontend Engineer)

> *"Can we actually build this in 2 weeks? What are the technical risks?"*

**Initial Read:** The task list is ambitious for 2 weeks. Let me flag scope risks.

**Key Concerns:**
1. **Expo Camera + barcode scanning:** This works well on modern devices but has inconsistent behavior on older Android phones. We need a fallback — manual barcode entry if scanning fails.
2. **18 tasks is too many for 2 weeks.** Realistically, with one FE dev, we can do ~8–10 P0 tasks. P1 tasks (onboarding, photo upload, text search) risk not shipping.
3. **Gemini API integration complexity:** We're calling Gemini to analyze ingredient text. What format does Gemini return? We need a structured output schema (JSON) specified *before* we build the backend endpoint.
4. **Navigation state management:** Scan → Result → History flow needs a clear navigation state. I'd suggest a simple tab navigator (Camera, History, Profile) with a modal for results.

**Suggestions:**
- Cut P1 onboarding to a single "permissions explainer" screen (not 3 screens)
- Define Gemini response schema as a shared type *before* coding
- Build a manual barcode entry fallback for edge cases
- Use simple tab navigation (Camera | History | Profile)

---

## Sage (Backend Engineer)

> *"Where do secrets live? What breaks at scale?"*

**Initial Read:** Good foundation, but a few architectural gaps.

**Key Concerns:**
1. **API key management:** `GEMINI_API_KEY` in `.env` on the backend is fine for now. But the blueprint mentions "custom API key management" as a future feature. Let's design the backend to support per-user API keys from day one — make the LLM service accept an optional key parameter.
2. **Open Food Facts rate limiting:** The free API has rate limits (~20 req/min). If multiple users scan simultaneously, we'll get 429s. We need a simple in-memory cache or rate limiter.
3. **Data freshness:** Open Food Facts data can be stale. We should cache responses but include a `lastUpdated` timestamp and optionally re-fetch after 24h.
4. **No mention of error handling.** What happens when Open Food Facts returns 404 (unknown barcode)? Or Gemini times out? We need graceful fallbacks — show partial data with a warning badge.

**Suggestions:**
- Add a rate limiter middleware on the backend (express-rate-limit or similar)
- Design LLM service with optional `apiKey` parameter for future custom-key support
- Cache Open Food Facts responses with TTL-based invalidation
- Define error states: partial data, missing data, API timeout — each with a UI treatment

---

## Ivy (QA Engineer)

> *"What breaks when the user does something unexpected?"*

**Initial Read:** I see several untested edge cases that will ship as bugs if we don't plan for them.

**Key Concerns:**
1. **No test strategy defined.** Sprint 1 plan mentions QA checkpoints but doesn't specify *how* we test. Unit tests for scoring logic? E2E for scanning flow? Without this, scoring bugs will slip through.
2. **Barcode edge cases:** What about:
   - Blurry/damaged barcodes?
   - Non-food barcodes (shampoo, batteries)?
   - Products with no Open Food Facts entry?
   - International barcodes (EAN-8 vs EAN-13 vs UPC)?
3. **Gemini response parsing:** LLMs are non-deterministic. If Gemini returns unexpected JSON, the app crashes. We need response validation with a fallback message.
4. **Offline behavior:** If user scans while offline, what happens? Crash? Blank screen? We need an "offline — queued for later" state.

**Suggestions:**
- Add unit tests for Nutri-Score and NOVA classification (P1 → P0 — these are core logic)
- Add a "GEMINI_RESPONSE_SCHEMA" validation layer (zod or similar)
- Define offline states before Sprint 1 ends, even if offline scanning ships later
- Test barcode scanning with at least 20 real-world products across formats

---

## Remy (Producer)

> *"Will this ship in 2 weeks? What do I need to cut?"*

**Initial Read:** The team has surfaced real issues. Let me make the hard calls.

**Key Concerns:**
1. **Scope is too big.** 18 tasks in 2 weeks with one FE + one BE dev? No. We cut to the bone.
2. **Missing foundational work.** Theme system, Gemini schema, rate limiting — these aren't in the task list but the team says they're essential.
3. **No error or offline states.** Ivy is right — these will be bugs if unplanned.

**Remy's Adjustments:**
1. **Cut from Sprint 1:**
   - Photo library upload → Sprint 2
   - Text search fallback → Sprint 2
   - 3-screen onboarding → Single permission screen only
   - Share scan result → Sprint 2
   - Dark mode → Sprint 2
2. **Add to Sprint 1 (P0):**
   - `theme.ts` design tokens (Milo)
   - Gemini response schema validation (Sage/Ivy)
   - Rate limiter middleware (Sage)
   - Error state definitions + UI treatments (Nova/Ivy)
   - Manual barcode entry fallback (Nova)
3. **Revised count:** ~12 focused tasks instead of 18. Achievable in 2 weeks.

---

## Summary of Changes to Sprint 1 Plan

| Action | Item |
|---|---|
| 🟢 Add P0 | `theme.ts` design tokens file |
| 🟢 Add P0 | Gemini JSON response schema (zod validation) |
| 🟢 Add P0 | Rate limiter middleware (express-rate-limit) |
| 🟢 Add P0 | Error state UI components (partial/missing/offline) |
| 🟢 Add P0 | Manual barcode entry fallback |
| 🟢 Add P0 | Unit tests for Nutri-Score + NOVA logic |
| 🟢 Promote P1→P0 | Haptic feedback on scan success |
| 🔴 Cut → Sprint 2 | Photo library upload |
| 🔴 Cut → Sprint 2 | Text search fallback |
| 🔴 Cut → Sprint 2 | 3-screen onboarding (replace with 1 permission screen) |
| 🔴 Cut → Sprint 2 | Share scan result |
| 🔴 Cut → Sprint 2 | Dark mode |
