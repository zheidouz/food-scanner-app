# Sprint 3 — Dark Mode, Demo Scan, OCR & Quality of Life

**Date:** June 3, 2026  
**Duration:** 2 weeks  
**Status:** 🟡 In Planning

---

## 🎯 Sprint Goal

Deliver the remaining deferred features from Sprint 2: **dark mode**, **demo scan card** for first-time users, and **OCR on uploaded label images**. Lay groundwork for future advanced features with improved navigation and alternative product suggestions.

---

## 📋 Task Breakdown

### P0 — Must Have (Ship Blockers) — 4 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S3-01 | **Dark mode support** | Frontend | 🔴 Not Started | Full theme refactor — dynamic context provider, dark palette, audit every screen |
| S3-02 | **Demo scan card on first launch** | Frontend | 🔴 Not Started | Replaces 3-screen onboarding. Shows a pre-loaded product analysis on first open |
| S3-03 | **Tesseract.js OCR on uploaded images** | Backend | 🔴 Not Started | Extract ingredient text from label photos; pre-download language data |
| S3-04 | **Alternative product suggestions** | Backend | 🔴 Not Started | After scan, query OFF for similar healthier products by category/nutrition |

### P1 — Important (Should Have) — 3 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S3-05 | **Multi-scan grocery mode** | Frontend | 🔴 Not Started | Stay in camera view after scan; accumulate results in a list |
| S3-06 | **Grocery list from multi-scan** | Frontend | 🔴 Not Started | Save multi-scan session as a grocery list with checkboxes |
| S3-07 | **Eco-Score integration** | Backend | 🔴 Not Started | Add Eco-Score (A-E) from Open Food Facts alongside Nutri-Score |

### P2 — Nice to Have — 2 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S3-08 | **Intelligent meal photo analysis** | Both | 🔴 Not Started | Analyze a full meal photo (multiple foods) — identify items, score each |
| S3-09 | **Weekly nutrition summary** | Frontend | 🔴 Not Started | Aggregate scan history into weekly report: avg health score, top nutrients, trends |

---

## ✅ Success Criteria

1. App fully renders in dark mode — all screens, components, and overlays
2. First-time users see a demo product analysis on launch (skip-able)
3. Uploading a label photo extracts ingredients via OCR and analyzes them
4. Scan results show 2-3 healthier alternative products
5. Multi-scan mode accumulates products without leaving camera
6. Eco-Score shown alongside Nutri-Score on result screen

---

## 🧪 QA Checkpoints

- [ ] Dark mode: every screen tested (Camera, Result, History, Profile, modals)
- [ ] Dark mode: no white flashes during transitions
- [ ] Dark mode: loading overlays use dark colors
- [ ] Demo scan card shows on first launch, not on subsequent launches
- [ ] OCR extracts text from a clear label photo
- [ ] OCR handles blurry photo gracefully (partial text or fallback)
- [ ] Alternative suggestions load and display correctly
- [ ] Multi-scan: 5+ consecutive scans without leaving camera
- [ ] Regression: barcode scanning, photo upload, text search, share — all still work
- [ ] Regression: 12 unit tests pass

---

## 🤖 Dev Team Prompt

```
You are building Sprint 3 of the Food Scanner App.

Tech additions:
- React Context for theme provider (dark/light)
- Tesseract.js (Node.js — pre-download language data)
- Open Food Facts Eco-Score data

P0 Tasks (priority order):
1. Dark mode: Create theme context provider with light/dark palettes.
   Update theme.ts → lightTheme.ts + darkTheme.ts. Wrap app in ThemeProvider.
   Audit EVERY screen/component to use dynamic theme. No hardcoded colors.
2. Demo scan card: Check AsyncStorage for 'hasSeenDemo' flag.
   If not set, show a modal with a pre-loaded product analysis.
   On dismiss, set flag. Skip-able with "Skip" button.
3. Tesseract.js OCR: In POST /api/scan/image, run OCR before DeepSeek.
   Download eng.traineddata on server startup. Pass extracted text to LLM.
   Handle low-confidence OCR gracefully.
4. Alternative suggestions: After barcode scan, query OFF products
   in same category sorted by nutriscore. Return top 2-3 healthier options.

P1 Tasks (if time permits):
5. Multi-scan grocery mode: State flag to stay in camera after scan.
   Accumulate results in a sidebar/list. End session to save as grocery list.
6. Grocery list screen: Checkbox items, share list, delete items.
7. Eco-Score: Parse ecoscore_grade from OFF response. Display on result.

P2 (if well ahead):
8. Meal photo analysis: Send meal photo to DeepSeek, identify items, score.
9. Weekly summary: Aggregate last 7 days of scans from history.

Do NOT break Sprint 1/2 features. Report progress in docs/sprint-3/progress.md.
```

---

## ⚠️ Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dark mode: inconsistent colors missed | Medium | Medium | Systematic audit — create component checklist before starting |
| Tesseract.js cold start latency | High | Medium | Pre-download language data in a setup script or on first request |
| OCR accuracy on real-world labels | High | Medium | Display extracted text for user to edit before analysis |
| Multi-scan state management complexity | Medium | Medium | Use React context for session state; keep it simple |
| Scope creep | High | Medium | Stick to P0/P1; defer P2 to Sprint 4 |

---

## 📅 Timeline (Target)

| Week | Focus |
|---|---|
| W1 Days 1–2 | Dark mode — theme context + all screens |
| W1 Days 3–4 | Demo scan card + OCR integration |
| W1 Day 5 | Alternative suggestions |
| W2 Days 1–2 | Multi-scan grocery mode |
| W2 Days 3–4 | Grocery list + Eco-Score |
| W2 Day 5 | Polish, QA, bug fixes, merge |
