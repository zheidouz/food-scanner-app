# Sprint 2 — Photo Upload, Text Search & User Experience

**Date:** June 3, 2026  
**Duration:** 2 weeks  
**Status:** 🟡 In Planning (revised after team consilium)

---

## 🎯 Sprint Goal

Expand scanning options beyond barcodes — add **photo library upload** and **text search** as alternative input methods. Add **custom API key management** for power users and **share results** as images.

---

## 📋 Task Breakdown

### P0 — Must Have (Ship Blockers) — 7 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S2-01 | **Photo library upload for label scanning** | Frontend | 🔴 Not Started | Integrate `expo-image-picker`; compress client-side with `expo-image-manipulator` |
| S2-02 | **Backend image analysis endpoint** | Backend | 🔴 Not Started | POST /api/scan/image — accept multipart image, run DeepSeek analysis on visible text |
| S2-03 | **Text search input on CameraScreen** | Frontend | 🔴 Not Started | Search field as fallback when barcode/photo fails |
| S2-04 | **Backend text search endpoint** | Backend | 🔴 Not Started | GET /api/search?q=coca — proxy to OFF search, limit 10 results |
| S2-05 | **Search result list screen** | Frontend | 🔴 Not Started | Show matching products; tap to navigate to Result screen |
| S2-06 | **Custom API key management** | Both | 🔴 Not Started | Profile: input field → `expo-secure-store` (not AsyncStorage). Hidden behind tap-version 5x. |
| S2-07 | **Backend per-request API key support** | Backend | 🔴 Not Started | Accept `X-DeepSeek-Key` header in scan routes |

### P1 — Important (Should Have) — 2 tasks

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| S2-08 | **Share scan result as image** | Frontend | 🔴 Not Started | ViewShot + React Native Share; high-resolution render |
| S2-09 | **Separate rate limiter for image endpoint** | Backend | 🔴 Not Started | 10 req/min for `/api/scan/image` (heavier processing) |

### P2 — Deferred to Sprint 3 — 5 tasks

| ID | Task | Notes |
|---|---|---|
| S2-10 | Dark mode support | Full theme refactor; too big for this sprint |
| S2-11 | Demo scan card on first launch | Replaces 3-screen onboarding (Kira's suggestion) |
| S2-12 | Tesseract.js OCR on uploaded images | Heavy dependency; standalone feature |
| S2-13 | Multi-scan grocery mode | Batch scanning |
| S2-14 | Alternative product suggestions | From original blueprint |

---

## ✅ Success Criteria

1. User can pick a photo from their library, upload it, and get a food analysis
2. User can type a product name and see search results; tap to analyze one
3. User can enter a custom DeepSeek API key (hidden in Profile), stored securely
4. User can share a scan result as an image via the native share sheet
5. Image analysis endpoint has its own rate limit (10 req/min)
6. All new features work on both iOS and Android
7. **No regressions** in Sprint 1 features (barcode scanning, history, offline cache)

---

## 🧪 QA Checkpoints

- [ ] Photo picker opens, returns an image, analysis completes
- [ ] Photo picker: deny permission → show educate screen → retry works
- [ ] Non-food image upload → graceful "could not analyze" message
- [ ] Text search returns results for known products (limit 10)
- [ ] Text search: empty query handled gracefully
- [ ] Text search: special characters sanitized
- [ ] Text search: tap a result → navigates to Result screen
- [ ] Custom API key saved in secure store; persists across restart
- [ ] Custom API key: invalid key shows error, app doesn't crash
- [ ] Share generates high-resolution image; share sheet opens
- [ ] Image endpoint rate limited at 10 req/min
- [ ] **Regression: barcode scan → result → history** still works identically
- [ ] **Regression: offline cache** still works
- [ ] **Regression: haptic feedback** fires on scan

---

## 🤖 Dev Team Prompt

```
You are building Sprint 2 of the Food Scanner App.

Tech additions:
- expo-image-picker + expo-image-manipulator (photo upload + compression)
- expo-secure-store (API key storage)
- react-native-view-shot (share as image)
- Open Food Facts text search API

P0 Tasks (priority order):
1. Integrate expo-image-picker + compression on CameraScreen for photo upload
2. Create POST /api/scan/image — accept multipart image, DeepSeek analysis
3. Add text search input on CameraScreen (fallback option)
4. Create GET /api/search?q= — proxy to OFF search, ?page_size=10&json=1
5. Build search result list screen — FlatList, tap to navigate to Result
6. Add custom DeepSeek API key field in Profile — expo-secure-store, hidden
7. Update backend scan routes to accept X-DeepSeek-Key header

P1 Tasks (if time permits):
8. Share scan result as image (react-native-view-shot + Share API)
9. Separate rate limiter for POST /api/scan/image (10 req/min)

Do NOT build (deferred to Sprint 3):
- Dark mode
- Onboarding / demo scan card
- Tesseract.js OCR
- Multi-scan grocery mode
- Alternative product suggestions

Do NOT break Sprint 1 features. Report progress in docs/sprint-2/progress.md.
```

---

## ⚠️ Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| expo-image-picker permissions on Android | Low | High | Handle denied permission with education screen |
| Photo upload size (12MB+) | Medium | Low | Compress client-side with expo-image-manipulator |
| DeepSeek analysis on label photo (no OCR) | Medium | Medium | User can type visible text; OCR is Sprint 3 |
| OFF text search returns irrelevant results | Low | Medium | Limit to 10 results; show brand + image for context |
| expo-secure-store availability | Low | High | Fallback to AsyncStorage with warning on unsupported platforms |
| Scope creep (adding deferred items) | High | Medium | P0/P1 explicitly listed; don't touch P2 |

---

## 📅 Timeline (Target)

| Week | Focus |
|---|---|
| W1 Days 1–2 | Photo upload (FE) + image analysis endpoint (BE) |
| W1 Days 3–4 | Text search input (FE) + search endpoint + result list (FE) |
| W1 Day 5 | Custom API keys (FE + BE + SecureStore) |
| W2 Days 1–2 | Share as image + image rate limiter |
| W2 Days 3–4 | QA + bug fixes + regression testing |
| W2 Day 5 | Polish, merge |
