# 🍎 Food Scanner App

> **Scan any food product — get a balanced "Good & Bad" review.**

A cross-platform mobile app (iOS + Android) that uses AI to analyze food products via camera, barcode, photo upload, or text search. Delivers nutritional insights, ingredient breakdowns, allergen alerts, and multi-metric scoring — all with an educational, not fear-mongering, approach.

## ✨ Key Features

- 📸 **Smart Scanning** — Camera, barcode, photo library, text search
- 🔬 **Ingredient Analysis** — Additives, preservatives, NOVA processing level
- ⚠️ **Allergen Alerts** — Dairy, nuts, gluten, soy, and more
- 📊 **Multi-Score System** — Health Score (0–100), Nutri-Score (A–E), Eco-Score
- ✅ **"The Good"** — Beneficial nutrients, certifications, positive highlights
- ❌ **"The Bad"** — Red flags, risks, ultra-processed indicators
- 👤 **Personalized Profiles** — Dietary goals, allergies, health concerns
- 📜 **Scan History** — Persistent log with alternative suggestions
- 🛒 **Shopping List** — Build lists from scanned products

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo (TypeScript) |
| Backend | Node.js + Express (TypeScript) |
| AI Vision | Google Gemini API |
| Food Data | Open Food Facts API |
| OCR | Expo Camera + ML Kit + Tesseract.js |

## 🚀 Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd food-scanner-app

# Install mobile dependencies
cd mobile
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up environment variables
cp .env.example .env
# Add your Gemini API key, etc.

# Start the backend
npm run dev

# Start the mobile app (in another terminal)
cd ../mobile
npx expo start
```

## 📁 Project Structure

```
food-scanner-app/
├── PROJECT_BRIEF.md       # 📋 Single source of truth
├── README.md              # 👋 This file
├── docs/                  # 📚 Sprint plans & progress
│   ├── sprint-1/
│   └── sprint-2/
├── mobile/                # 📱 Expo / React Native app
│   ├── app/               # Screens & navigation
│   ├── components/        # Reusable UI components
│   ├── services/          # API clients & helpers
│   └── types/             # TypeScript types
├── backend/               # 🖥️ API server
│   ├── src/
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── package.json
└── shared/                # 🔄 Shared types & utils
```

## 📋 Sprint Status

| Sprint | Focus | Status |
|---|---|---|
| Sprint 1 | Scaffolding, core scanning, basic analysis | 🟡 In Progress |
| Sprint 2 | Advanced features (future) | ⏳ Planned |

See `docs/sprint-1/plan.md` for full task breakdown.

## 🤝 Contributing

This project uses a structured sprint workflow. All changes go through PR review by the Producer. See `PROJECT_BRIEF.md` for the full project context.

## 📄 License

[MIT](LICENSE)
