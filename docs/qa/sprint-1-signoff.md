# Sprint 1 — QA Sign-off

**QA Engineer:** Ivy  
**Date:** June 3, 2026  
**Branch:** `feature/sprint-1`  
**Build:** `56a5362` (latest)

---

## Automated Tests

| Suite | Result |
|---|---|
| Unit tests (scoring.test.ts) | ✅ 12/12 passed |

## Manual API Playthrough

| Test | Scenario | Result | Notes |
|---|---|---|---|
| 1 | Happy path — Coca-Cola barcode | ✅ Pass | Product found, NutriScore B, fallback scoring |
| 2 | Known product — Hot chocolate | ✅ Pass | Product found, fallback scoring |
| 3 | DeepSeek direct API call | ✅ Works | Raw API responds with valid JSON |
| 4 | DeepSeek with food prompt | ⚠️ Partial | Returns valid JSON but zod validation rejects "moderate" severity |
| 5 | Unknown barcode (0000000000000) | ✅ Pass | Returns proper BARCODE_NOT_FOUND error |
| 6 | Empty barcode via POST | ✅ Pass | Returns 400 with proper error |
| 7 | Missing body on POST | ✅ Pass | Returns 400 with proper error |
| 8 | GET /api/scan/ (no barcode) | ❌ **BUG** | Returns HTML 404 page, not JSON |
| 9 | Non-food barcode | ✅ Pass | Returns "not found" gracefully |
| 10 | Product with special chars | ✅ Pass | Handled gracefully |
| 11 | Rate limiter (20 concurrent) | ✅ Pass | Rate limited after 15 req/min |
| 12 | Very long barcode | ✅ Pass | Returns "not found" gracefully |
| 13 | Wrong HTTP method | ⚠️ OK | Returns HTML 404 for unmatched route |
| 14 | CORS headers | ✅ Pass | Access-Control-Allow-Origin: * |

---

## Issues Found

| ID | Component | Severity | Description |
|---|---|---|---|
| **BUG-1** | Backend — AI schema | **Major** | DeepSeek uses "moderate" but zod schema only allows "medium" → AI analysis always falls back to nutrition scoring |
| **BUG-2** | Backend — Routes | **Minor** | GET /api/scan/ returns HTML 404 instead of JSON error |
| **BUG-3** | Mobile — TypeScript | **Major** | 8+ TS compilation errors: duplicate TabIcon, barcode type names use wrong format (ean-13 vs ean13), ResultScreen props type mismatch |
| **BUG-4** | Backend — Rate limiter | **Minor** | 15 req/min is too aggressive for normal usage — scanning 3 products could exhaust the limit |
| **BUG-5** | Backend — API design | **Minor** | Dual POST/GET endpoints for scanning creates confusion; single consistent endpoint recommended |

---

## Testing Checklist

- [x] Happy path works as described (with fallback scoring)
- [x] Error states are handled gracefully (BARCODE_NOT_FOUND, empty input, rate limited)
- [x] Edge cases tested (empty barcode, long barcode, non-food, special chars)
- [x] No console errors (server-side clean)
- [ ] **BLOCKER**: Mobile app does not compile (8+ TS errors)
- [ ] **BLOCKER**: AI analysis always falls back due to schema mismatch

---

## Blocker Status: ~~❌ BLOCKED~~ ✅ PASS (Fix verified)

~~**Two blockers prevent sign-off:**~~

~~1. **BUG-1 (Major):** DeepSeek AI analysis is effectively dead — every scan falls back to nutrition-based scoring because the zod schema rejects valid DeepSeek responses that use "moderate" instead of "medium".~~
~~2. **BUG-3 (Major):** The mobile app cannot build — 8 TypeScript compilation errors prevent the app from running on any device.~~

### Fix Verification — June 3, 2026

Both blockers have been fixed and verified:

| Bug | Fix | Status |
|---|---|---|
| **BUG-1** | eNumber regex relaxed to accept letter suffixes (`E150d`). zod preprocess normalizes "moderate" → "medium". | ✅ **Verified** — Coca-Cola scan returns AI analysis (healthScore=15, nutriScore=E, NOVA=4) with no fallback warning |
| **BUG-3** | Duplicate TabIcon removed. Stack navigator typed. Barcode names fixed (ean-13→ean13). | ✅ **Verified** — Mobile TypeScript compilation clean (0 errors) |
| **BUG-2** | Added GET /api/scan/ route handler with JSON error | ✅ **Verified** |
| **BUG-4** | Rate limit increased 15→60 req/min | ✅ **Verified** |

---

## Sign-off

**Ivy's Verdict:** ✅ **PASS** — All blockers resolved. Sprint 1 is ready to ship.
