# 🧠 Team Consilium — Sprint 2 Plan Review

**Date:** June 3, 2026  
**Project:** Food Scanner App  
**Format:** Sprint Plan Validation — each agent reviews from their perspective, debates, and challenges

---

## Kira (Product Designer)

> *"Is this useful? Is it fun? Would a user care?"*

**Overall take:** Solid sprint. The three scanning methods (barcode, photo, text) finally make the app feel complete. A few concerns though.

**What I love:**
- **Photo upload** — huge win. Users open the app to scan something they're eating RIGHT NOW, and sometimes the barcode is damaged or missing. Photo fills that gap.
- **Text search** — also great for when someone knows what they want ("scanned chips yesterday, let me find them again").
- **Share as image** — viral growth channel. If users share their scan results on Instagram or WhatsApp, that's free marketing.

**What worries me:**
1. **Onboarding feels tacked on.** Three static screens with skip buttons is what every app does. It won't convert. Can we make the first scan a guided demo instead? Show a pre-loaded product analysis so they see the value *before* scanning?
2. **Custom API keys in Profile** — who is this for? Power users are <1% of the audience. This adds complexity to the Profile screen for everyone else. Can we hide it behind a "Developer Mode" toggle?
3. **No mention of alternative suggestions.** In the original blueprint, after scanning a product we should show healthier alternatives. That's WAY more useful than dark mode.

**Proposed changes:**
- Replace 3-screen static onboarding with a single "Demo Scan" card on the camera screen (first launch only)
- Move custom API keys to a hidden developer section (tap version number 5 times)
- Promote "alternative product suggestions" from future sprints into Sprint 2 P2

---

## Milo (Art/Visual Director)

> *"Does this look and feel right? Is the design system ready?"*

**Overall take:** Dark mode is overdue, but doing it right means no half-measures.

**What I like:**
- **Dark mode in Sprint 2** — thank you. Every screen must be audited. If we have one white flash in dark mode, the app feels broken.
- **Share as image** — this needs to look gorgeous. The health score gauge, Nutri-Score badge — they should render at high resolution, not a screenshot of a phone screen.

**Key concerns:**
1. **Dark theme tokens must be defined FIRST.** If Nova builds dark mode screen-by-screen without a complete dark palette, we'll get inconsistent grays. I need to write a `darkTheme.ts` that mirrors every token in `theme.ts` before any dark mode code is written.
2. **Photo upload UI** — where does the button live on the camera screen? If it's a tiny icon, no one will use it. It needs to be prominent: a clear "Upload Photo" label with a gallery icon, right below the viewfinder.
3. **Onboarding design** — if we keep the 3 screens (Kira wants to remove them), they need to look unified with the app's calming green/blue aesthetic. Not generic illustrations. If they're just placeholders, leave them out.

**Non-negotiable:** Dark mode design tokens defined and approved before any screen is converted.

---

## Nova (Frontend Engineer)

> *"Can we build this in 2 weeks? What are the real technical risks?"*

**Overall take:** 6 P0 tasks is achievable if we're focused. But some are bigger than they look.

**Scope estimates (realistic):**

| Task | Estimate | Risk Level |
|---|---|---|
| S2-01 Photo upload (expo-image-picker) | 1 day | 🟢 Low — straightforward library |
| S2-02 Backend image endpoint | 2 days | 🟡 Medium — need Tesseract.js + multipart handling |
| S2-03 Text search FE | 1 day | 🟢 Low — just an input field + API call |
| S2-04 Text search BE | 0.5 day | 🟢 Low — proxy to OFF search API |
| S2-05 Custom API keys FE | 1 day | 🟢 Low — input + AsyncStorage |
| S2-06 x-api-key header BE | 0.5 day | 🟢 Low — middleware |
| S2-07 Onboarding (if kept) | 2 days | 🟡 Medium — AsyncStorage flag, 3 screens, animations |
| S2-08 Share as image | 2 days | 🟡 Medium — ViewShot can be finicky on Android |
| S2-09 Dark mode | 3 days | 🔴 **High** — need to audit ALL screens, ALL components |

**Key concerns:**
1. **Dark mode is a 3-day task minimum**, not a P1. Every screen has hardcoded colors from `theme.ts`. We need to make the theme dynamic (context provider), then update every component to use the active theme. It's doable but it's NOT a "bonus" task.
2. **Tesseract.js in Node.js** — the npm package works but it's heavy (~8MB). For a serverless/Express backend, it's fine. But OCR from photos of food labels is notoriously unreliable. We need clear user expectations.
3. **Photo upload size limits** — if the user picks a 12MB photo from their camera, we need to compress it client-side before uploading. `expo-image-manipulator` can do this.
4. **Result screen for text search (S2-11)** — this is actually needed for S2-03 to work properly. If the user searches "coca" and gets 10 results, they need a list to pick from. S2-03 without S2-11 means the app picks the first result, which may be wrong.

**My proposal:**
- Dark mode moves to P2. It's a 3-day refactor, too big for P1 in a 2-week sprint.
- S2-11 (search result list) moves up to P0 alongside S2-03 — they're coupled.
- Compress images client-side before upload.

---

## Sage (Backend Engineer)

> *"Where do secrets live? What are the security implications?"*

**Overall take:** The backend work is light this sprint. But the API key feature needs careful design.

**Key concerns:**
1. **Custom API keys — don't save them naively.** AsyncStorage is NOT encrypted on Android/iOS by default. If a user enters their DeepSeek API key, it's stored in plaintext. We need `expo-secure-store` for sensitive data.
2. **x-api-key header design** — the header should be `X-DeepSeek-Key` (specific), not a generic `x-api-key`. That way custom keys don't collide with system auth keys in the future.
3. **Open Food Facts text search** — the API is `https://world.openfoodfacts.org/cgi/search.pl?search_terms=coca&json=1`. It returns a lot of data. We should limit to 10 results with `page_size=10`.
4. **Tesseract.js is heavy** — it needs to download language data files on first run (~3MB for English). The cold-start latency will be bad. Pre-download in a setup script, or use a lighter OCR approach.
5. **Rate limiting for image upload** — images take longer to process. The current 60 req/min limit means a user uploading 60 photos in a minute could overwhelm the OCR. Consider a separate, lower limit for `/api/scan/image`.

**Proposed fixes:**
- Use `expo-secure-store` instead of `AsyncStorage` for API keys
- Header: `X-DeepSeek-Key` not `x-api-key`
- Pre-download Tesseract language data in a setup step
- Separate rate limiter for image endpoint: 10 req/min

---

## Ivy (QA Engineer)

> *"What breaks? What edge cases aren't covered?"*

**Overall take:** 6 of 11 QA checkpoints are about new features. But 5 are about regression — and regression is where the bugs hide.

**What I'll be testing:**
1. **Photo upload from library** — then deny permission mid-flow. Does it crash?
2. **Photo upload with non-food image** — a photo of a cat. Does it gracefully say "could not analyze"?
3. **OCR on blurry label** — intentionally blurry photo. Does it return garbage or fall back gracefully?
4. **Text search with empty query** — just hit search with nothing typed.
5. **Text search with special characters** — "coca-cola!!!%%%" — does it sanitize?
6. **Custom API key: enter invalid key** — does it give a clear error? Does the key persist across app restarts?
7. **Dark mode: switch mid-scan** — enable dark mode while a scan is processing. Does the loading overlay adopt dark colors?
8. **Share on iOS vs Android** — share sheet behavior is different on each platform.
9. **Regression: Sprint 1 barcode scan** — after all changes, barcode scanning must still work identically.

**Missing from QA checklist (add these):**
- [ ] Photo picker: deny permission → show educate screen → retry
- [ ] Non-food image: graceful "could not analyze" message
- [ ] Text search: empty query handled
- [ ] Text search: special characters sanitized
- [ ] Custom API key: invalid key shows error, doesn't crash
- [ ] Custom API key: key persists across app restart
- [ ] Dark mode: mid-scan overlay uses dark colors
- [ ] Regression: Sprint 1 happy path still works (barcode → result → history)

---

## Remy (Producer)

> *"Will this ship in 2 weeks? What do I need to cut?"*

**Overall take:** Nova and Sage surfaced real scope issues. Let me make the cuts.

**What I agree with:**
1. **Dark mode to P2** — Nova's right, 3 days is too big for P1 in a 2-week sprint. Defer.
2. **S2-11 (search result list) to P0** — coupled with S2-03. Can't ship text search without it.
3. **expo-secure-store** — Sage is right, API keys in AsyncStorage is a security issue. Use SecureStore.
4. **Onboarding (S2-07) — cut to P2** — Kira makes a good point that 3 static screens won't convert. Replace with a P2 task: "Demo scan card on first launch."
5. **Tesseract.js OCR to P2** — OCR is a standalone feature. Photo upload + DeepSeek analysis of what the user types from the label is more reliable than OCR anyway. Ship image upload first, add OCR later.

**Revised task list:**

### P0 (Must Have) — 7 tasks

| ID | Task | Owner |
|---|---|---|
| S2-01 | Photo library upload (`expo-image-picker` + client-side compression) | Frontend |
| S2-02 | Backend image analysis endpoint (accept image, DeepSeek analysis) | Backend |
| S2-03 | Text search input on CameraScreen | Frontend |
| S2-04 | Backend text search endpoint (proxy to OFF, limit 10 results) | Backend |
| S2-05 | Search result list screen (shows multiple results, tap to analyze) | Frontend |
| S2-06 | Custom API key management (`expo-secure-store`, hidden in Profile) | Both |
| S2-07 | Backend `X-DeepSeek-Key` header support | Backend |

### P1 (Should Have) — 2 tasks

| ID | Task | Owner |
|---|---|---|
| S2-08 | Share scan result as image (ViewShot + native Share) | Frontend |
| S2-09 | Separate rate limiter for image endpoint (10 req/min) | Backend |

### P2 (Deferred to Sprint 3) — 5 tasks

| ID | Task |
|---|---|
| S2-10 | Dark mode support (full theme refactor) |
| S2-11 | 3-screen onboarding → Demo scan card on first launch |
| S2-12 | Tesseract.js OCR on uploaded images |
| S2-13 | Multi-scan grocery mode |
| S2-14 | Alternative product suggestions |

**Revised estimate:** ~10 dev days for P0 (6 FE + 4 BE). Achievable in 2 weeks with one FE + one BE dev.

---

## Summary of Changes to Sprint 2 Plan

| Action | Item |
|---|---|
| 🟢 Promote P2→P0 | S2-11 Search result list screen (coupled with text search) |
| 🔴 Cut P1→P2 | S2-07 3-screen onboarding → replace with "Demo scan card" P2 |
| 🔴 Cut P1→P2 | S2-09 Dark mode (too big for this sprint) |
| 🔴 Cut P1→P2 | S2-10 Tesseract.js OCR |
| 🟢 Add P1 | Separate rate limiter for image endpoint (10 req/min) |
| 🟢 Adjust | Custom API keys use `expo-secure-store`, not AsyncStorage |
| 🟢 Adjust | API key header: `X-DeepSeek-Key`, not generic `x-api-key` |
| 🟢 Adjust | Image compression client-side before upload |
