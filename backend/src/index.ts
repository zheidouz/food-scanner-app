import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { scanRouter } from './routes/scan';
import { imageScanRouter } from './routes/imageScan';
import { searchRouter } from './routes/search';
import { rateLimiter, imageRateLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/', rateLimiter);

// Routes
app.use('/api/scan', scanRouter);
app.use('/api/scan/image', imageRateLimiter, imageScanRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🍎 Food Scanner API running on http://localhost:${PORT}`);
});

export default app;
