import express from 'express';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { generatePuzzle } from './puzzle-generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');

const app = express();
app.use(express.json());

app.post('/api/generate-puzzle', async (req, res) => {
  const { theme, wordCount = 5, difficulty = 2 } = req.body;
  if (theme !== undefined && typeof theme !== 'string') {
    return res.status(400).json({ error: 'theme must be a string' });
  }

  const clampedCount = Math.min(Math.max(Number(wordCount) || 5, 3), 10);
  const clampedDiff = Math.min(Math.max(Number(difficulty) || 2, 1), 5);

  try {
    const puzzle = await generatePuzzle(theme?.trim() || '', clampedCount, clampedDiff);
    res.json(puzzle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message ?? 'Failed to generate puzzle' });
  }
});

app.use(express.static(DIST));
app.get('/{*path}', (_req, res) => res.sendFile(join(DIST, 'index.html')));

const PORT = process.env.API_PORT ?? 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dropout running at http://localhost:${PORT}`);
  console.log(`On your network:    http://10.0.0.3:${PORT}`);
});
