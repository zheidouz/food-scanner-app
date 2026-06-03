# Food Scanner App — Repo Memory

## Project
- React Native + Expo (TypeScript) mobile app with Node.js + Express (TypeScript) backend
- AI analysis via Google Gemini Vision API
- Food data via Open Food Facts API (free, open-source)
- Shared types in `shared/types.ts` — imported via relative paths (no path aliases)

## Key Commands
- Backend tests: `cd backend && npm test`
- Backend dev: `cd backend && npm run dev`
- Mobile dev: `cd mobile && npx expo start`
- Backend .env needs: `GEMINI_API_KEY`

## Architecture
- `backend/src/index.ts` — Express server entry
- `backend/src/routes/scan.ts` — POST/GET /api/scan/:barcode
- `backend/src/services/openFoodFacts.ts` — barcode lookup + 24h cache
- `backend/src/services/gemini.ts` — Gemini API with zod schema validation
- `backend/src/services/scoring.ts` — Nutri-Score, NOVA, Health Score
- `backend/src/services/scanService.ts` — orchestrator combining all services
- `mobile/App.tsx` — Tab nav (Scan/History/Profile) + Stack (Result modal)
- `mobile/src/theme/theme.ts` — Design tokens (calming green/blue palette)

## Sprint 1 Status — Complete ✅
- Branch: `feature/sprint-1`
- See `docs/sprint-1/done.md` for full delivery list
- No remote configured — needs `git remote add origin <url>`

## Key Decisions
- Relative imports used instead of path aliases (@shared/) for reliable tsc/runtime
- Nutri-Score algorithm is simplified — no fruit/vegetable bonus yet (apple gets B, not A)
- Nova classification from nutrition data as fallback when Gemini unavailable
- 12 unit tests for core scoring logic — all passing
