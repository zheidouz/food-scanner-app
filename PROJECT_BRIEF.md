# Food Scanner App — PROJECT_BRIEF

> **Single Source of Truth** | Last updated: June 3, 2026

---

## 1. 🎯 Vision

A mobile app that scans food products (via camera, barcode, photo upload, or text search) and delivers **balanced, data-driven "good & bad" reviews** — highlighting both nutritional benefits and risks. The goal is to educate, not fear-monger — helping users make informed choices without promoting an unhealthy relationship with food.

---

## 2. 👥 Target Audience

- Health-conscious consumers
- People with dietary restrictions (allergies, vegan, keto, etc.)
- Shoppers looking for product alternatives
- Anyone curious about what's in their food

---

## 3. 🧩 Core Features

| Feature | Description |
|---|---|
| **Smart Scanning** | Camera, photo library, barcode, text search |
| **Ingredient Analysis** | Detect additives, preservatives, ultra-processed ingredients (NOVA) |
| **Allergen Alerts** | Flag dairy, nuts, gluten, soy, etc. |
| **Nutritional Breakdown** | Calories, macros, micro-nutrients |
| **"Good" Review** | Health score, beneficial nutrients, certifications (Organic, Vegan) |
| **"Bad" Review** | Risk score, NOVA classification, nutritional red flags (sugar, sat fat, sodium) |
| **Multi-Score System** | 0–100 Health Score, Nutri-Score (A–E), Eco-Score |
| **Personalization** | User profiles with dietary goals, allergies, health concerns |
| **Scan History** | Persistent log of all past scans |
| **Alternative Suggestions** | Healthier product alternatives |
| **Shopping List** | Build and manage a shopping list |
| **Photo Logging** | Meal and shelf photo history |

---

## 4. 🚀 Advanced Features (Future)

- AI meal photo analysis (95%+ accuracy vs manual logging)
- Social features: reviews, photos, videos, comments, likes
- Price comparison across retailers
- Recipe finder from scanned ingredients
- Multi-scan grocery mode
- AI barcode reconstruction
- Product origins, packaging, transport, CO₂ data
- Custom API key management for power users

---

## 5. 🛠️ Tech Stack

### Mobile Framework
- **React Native with Expo** (cross-platform iOS & Android)

### Backend
- **Node.js + Express** or **FastAPI (Python)**

### AI / ML
- **Google Gemini** (primary) or **OpenAI Vision** for image analysis
- **Google Cloud Vision API** for object detection & OCR

### Food Data APIs
- **Edamam Vision API** — nutrition from meal photos
- **Open Food Facts** — barcode product database (open-source)
- **Yuka / Open Food Facts scoring** for NOVA & Nutri-Score

### OCR & Scanning
- **Expo Camera** + **ML Kit (Firebase)** — barcode & text recognition
- **Tesseract.js** — OCR fallback

---

## 6. 🧠 Design Principles

- **Balanced, not moralistic** — no "good" vs "bad" labels; educate, don't shame
- **Privacy-first** — minimal data collection, optional accounts
- **Offline-capable** — cached barcode lookups, queued scans
- **Accessible** — high-contrast, screen reader support, legible fonts
- **Calming aesthetic** — soft blues/greens, clean card layouts
- **Gamified motivation** — streaks, badges, weekly summaries for positive habits

---

## 7. ✅ Current Sprint

**Sprint 3** — Dark Mode, Demo Scan, OCR & Quality of Life  
**Status:** 🟡 In Planning — see `docs/sprint-3/plan.md`

**Focus:**
- Dark mode support (full theme refactor)
- Demo scan card for first-time users
- Tesseract.js OCR on uploaded label images
- Alternative product suggestions
- Multi-scan grocery mode
- Eco-Score integration

### Past Sprints

| Sprint | Focus | Status |
|---|---|---|
| Sprint 1 | Scaffolding, core scanning, basic analysis | ✅ Complete |
| Sprint 2 | Photo upload, text search, custom API keys, share | ✅ Complete |

---

## 8. 📌 Open Issues & Bugs

- None yet — project is in initial planning phase.

---

## 9. 🏗️ Project Structure

```
food-scanner-app/
├── PROJECT_BRIEF.md
├── README.md
├── docs/
│   ├── sprint-1/
│   │   ├── plan.md
│   │   ├── progress.md
│   │   └── done.md
│   └── sprint-2/
│       ├── plan.md
│       ├── progress.md
│       └── done.md
├── mobile/                # React Native / Expo app
├── backend/               # API server
└── shared/                # Shared types, utils
```

---

## 10. 📋 Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-03 | React Native + Expo over Flutter | Faster prototyping, larger community, easier AI/API integration |
| 2026-06-03 | Google Gemini as primary AI | Excellent vision + structured output, cost-effective |
| 2026-06-03 | Open Food Facts as primary food DB | Free, open-source, large dataset, barcode lookup |
| 2026-06-03 | DeepSeek V4 Flash replaces Gemini | Better JSON compliance, cheaper, OpenAI-compatible API |
| 2026-06-03 | Sprint 2: photo upload + text search + API keys | Highest user impact, completes core input methods |
| 2026-06-03 | Sprint 3: dark mode, demo scan, OCR, alternatives | Deferred from Sprint 2; finishes remaining UX features |
