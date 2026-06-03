# Sprint 1 — Project Scaffolding, Core Scanning & Basic Analysis

**Date:** June 3, 2026  
**Duration:** 2 weeks  
**Status:** 🟡 In Planning

---

## 🎯 Sprint Goal

Establish the full project foundation: scaffold the React Native (Expo) app, set up the backend with a food analysis API, implement camera and barcode scanning, and deliver a basic "good & bad" food review result screen.

---

## 📋 Task Breakdown

### P0 — Must Have (Ship Blockers) — 14 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S1-01 | Initialize Expo + React Native project with TypeScript | Frontend | 🔴 Not Started | Use `npx create-expo-app` |
| S1-02 | Set up backend project (Node.js + Express TypeScript) | Backend | 🔴 Not Started | Scaffold with TypeScript |
| S1-03 | Create `theme.ts` design tokens (colors, typography, spacing) | Frontend | 🔴 Not Started | Calming palette: soft blues/greens |
| S1-04 | Integrate Expo Camera module for live scanning | Frontend | 🔴 Not Started | Permissions, preview, capture |
| S1-05 | Implement barcode scanning via Expo + ML Kit | Frontend | 🔴 Not Started | Detect EAN-13, UPC-A barcodes |
| S1-06 | Add manual barcode entry fallback for failed scans | Frontend | 🔴 Not Started | Text input + validation for edge cases |
| S1-07 | Set up Open Food Facts API integration (barcode lookup) | Backend | 🔴 Not Started | Fetch product data by barcode |
| S1-08 | Integrate Google Gemini for ingredient analysis | Backend | 🔴 Not Started | Structured JSON output; zod schema validation |
| S1-09 | Define Gemini response schema (zod) + validation layer | Both | 🔴 Not Started | Prevent crashes from non-deterministic LLM output |
| S1-10 | Implement NOVA classification logic | Backend | 🔴 Not Started | Determine processing level |
| S1-11 | Create basic Nutri-Score calculation | Backend | 🔴 Not Started | Per Open Food Facts algorithm |
| S1-12 | Build "Scan Result" screen with Good/Bad breakdown | Frontend | 🔴 Not Started | Health Score circular gauge, two-column layout |
| S1-13 | Build error state UI components (partial/missing/offline data) | Frontend | 🔴 Not Started | Warning badges, graceful fallbacks |
| S1-14 | Build scan history storage (local) | Both | 🔴 Not Started | AsyncStorage for persistence |
| S1-15 | Add rate limiter middleware to backend | Backend | 🔴 Not Started | express-rate-limit for Open Food Facts calls |
| S1-16 | Unit tests for Nutri-Score + NOVA classification logic | Backend | 🔴 Not Started | Core scoring algorithms — must be tested |
| S1-17 | Haptic feedback on successful scan | Frontend | 🔴 Not Started | Subtle tap/haptic pulse for delight |

### P1 — Important (Should Have) — 3 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S1-18 | Allergen detection from ingredients list | Backend | 🔴 Not Started | Dairy, nuts, gluten, soy, etc. |
| S1-19 | Loading animations during scan processing | Frontend | 🔴 Not Started | Engaging spinner/gauge animation |
| S1-20 | Single permission explainer screen (not 3-screen onboarding) | Frontend | 🔴 Not Started | One screen: "We need camera access" |

### P2 — Nice to Have — 1 task

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S1-21 | Basic offline barcode cache | Both | 🔴 Not Started | Local SQLite/AsyncStorage |

---

## ✅ Success Criteria

1. User can open the app, point camera at a barcode, and scan it
2. If barcode fails, user can type the barcode number manually
3. App looks up product from Open Food Facts by barcode
4. Gemini ingredient analysis returns structured, validated JSON
5. App displays a result screen with:
   - Product name & image
   - Overall 0–100 Health Score (circular gauge)
   - "Good" section: positive nutrients, certifications
   - "Bad" section: NOVA classification, red flags (sugar, sat fat, sodium)
   - Nutri-Score letter grade (A–E) with custom badge
6. Error states are handled: partial data, missing data, API timeout — each with a distinct UI
7. Scan is saved to history (visible in a list)
8. Nutri-Score and NOVA logic have passing unit tests
9. Haptic feedback fires on scan success
10. Running on both iOS and Android simulators/devices

---

## 🧪 QA Checkpoints

- [ ] Barcode scanning works on iOS (5+ test products)
- [ ] Barcode scanning works on Android (5+ test products)
- [ ] Manual barcode entry works when scan fails
- [ ] Non-food barcode shows appropriate "not found" state
- [ ] Open Food Facts returns data for common products
- [ ] Gemini analysis correctly identifies additives (test with 3 known products)
- [ ] Gemini response is validated by zod schema — bad JSON shows fallback UI
- [ ] NOVA classification matches known examples (e.g., fresh apple = 1, soda = 4)
- [ ] Nutri-Score matches Open Food Facts reference
- [ ] Unit tests pass for scoring logic (run `npm test`)
- [ ] Error states render: partial data badge, missing data card, timeout message
- [ ] Haptic feedback fires on successful scan
- [ ] Scan history persists across app restarts
- [ ] Permission screen shows only when camera access is needed
- [ ] App does not crash on missing data, bad API response, or offline

---

## 🤖 Dev Team Prompt (for agent chat)

```
You are building Sprint 1 of the Food Scanner App (see PROJECT_BRIEF.md and docs/sprint-1/plan.md).

Tech stack:
- Mobile: React Native + Expo (TypeScript)
- Backend: Node.js + Express (TypeScript)
- AI: Google Gemini Vision API
- Food DB: Open Food Facts API
- Validation: zod for Gemini response schema

CRITICAL — Scope is tight (14 P0 tasks in 2 weeks). Do NOT scope creep.

P0 Tasks (priority order):
1. Scaffold Expo project (mobile/) + backend/ with TypeScript
2. Create theme.ts — color palette (soft blues/greens), typography, spacing
3. Camera integration (Expo Camera) + barcode scanning (ML Kit)
4. Manual barcode entry fallback (text input)
5. Open Food Facts barcode lookup endpoint (backend)
6. Gemini ingredient analysis with structured JSON output
7. Define zod schema for Gemini response + validation layer
8. NOVA classification logic
9. Nutri-Score calculation (A-E)
10. Scan Result screen — circular Health Score gauge, Good/Bad columns
11. Error state UI components (partial data, missing data, timeout, offline)
12. Scan history (AsyncStorage)
13. Rate limiter middleware (express-rate-limit)
14. Unit tests for Nutri-Score + NOVA

P1 (if time permits):
- Allergen detection
- Loading animations
- Single permission explainer screen

Deliberately cut from this sprint (do NOT implement):
- Photo library upload → Sprint 2
- Text search fallback → Sprint 2
- 3-screen onboarding → Sprint 2
- Share scan result → Sprint 2
- Dark mode → Sprint 2

Create the mobile/ and backend/ directories. Use shared/ for types.
Report progress in docs/sprint-1/progress.md.
DO NOT merge without Producer (Remy) review.
```

---

## ⚠️ Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API latency | Medium | High | Add loading states, cache responses |
| Gemini non-deterministic JSON output | Medium | High | zod schema validation layer (P0 task) |
| Open Food Facts data quality/staleness | Medium | Medium | Cross-reference, lastUpdated timestamps |
| Open Food Facts rate limiting (~20 req/min) | Medium | Medium | Rate limiter middleware + response caching |
| Barcode format variations (EAN-8/13, UPC) | Low | Medium | Test across 20+ real products |
| Expo Camera permissions on Android | Low | High | Follow Expo docs carefully, test on physical device |
| Unknown barcode (404 from API) | Medium | Medium | Manual entry fallback + "not found" UI state |
| Scope creep (advanced features) | High | High | Cut P1/P2 tasks — team consilium already trimmed |

---

## 📅 Timeline (Target)

| Week | Focus |
|---|---|
| W1 Days 1–2 | Scaffold both projects, theme.ts, CI setup |
| W1 Days 3–4 | Camera + barcode scanning + manual entry fallback |
| W1 Day 5 | Open Food Facts integration + rate limiter |
| W2 Days 1–2 | Gemini integration + zod schema validation + scoring logic |
| W2 Days 3–4 | Result screen UI + error states + scan history |
| W2 Day 5 | Unit tests, haptic feedback, QA, bug fixes, merge |
