#!/usr/bin/env node
/**
 * Usage: node scripts/generate-puzzle.mjs <theme> [wordCount]
 *
 * Generates a Dropout puzzle definition using OpenAI.
 * Outputs a JS object ready to paste into src/data/puzzles.js.
 *
 * Requires OPENAI_API_KEY in environment.
 */

import { getWordsAndClues, layoutWords, normalizePlacements } from '../server/puzzle-generator.mjs';

const theme = process.argv[2];
const targetWords = parseInt(process.argv[3] ?? '5', 10);

if (!theme) {
  console.error('Usage: node scripts/generate-puzzle.mjs <theme> [wordCount]');
  process.exit(1);
}

function printGridAscii(layout) {
  const grid = Array.from({ length: layout.rows }, () => Array(layout.cols).fill('_'));
  for (const w of layout.words) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === 'across' ? w.startRow : w.startRow + i;
      const c = w.direction === 'across' ? w.startCol + i : w.startCol;
      grid[r][c] = w.answer[i];
    }
  }
  return grid.map(row => row.join('  ')).join('\n');
}

function formatPuzzle(id, layout, theme) {
  const words = layout.words.map(w =>
    `    { id: '${w.id}', answer: '${w.answer}', direction: '${w.direction}', startRow: ${w.startRow}, startCol: ${w.startCol} }`
  );
  const clues = layout.words.map(w => `    '${w.clue}'`);

  return `  {
    id: ${id},
    theme: '${theme}',
    rows: ${layout.rows},
    cols: ${layout.cols},
    difficulty: 'medium',
    words: [
${words.join(',\n')}
    ],
    clues: [
${clues.join(',\n')}
    ],
  }`;
}

console.error(`Fetching ${targetWords * 2} word candidates for theme: "${theme}"...`);
const candidates = await getWordsAndClues(theme, targetWords);
console.error(`Got ${candidates.length} candidates: ${candidates.map(w => w.answer).join(', ')}`);

console.error(`Running layout algorithm...`);
const placements = layoutWords(candidates, targetWords);
console.error(`Placed ${placements.length} words: ${placements.map(p => p.answer).join(', ')}`);

if (placements.length < 3) {
  console.error('Could not place enough words. Try a different theme or word count.');
  process.exit(1);
}

const layout = normalizePlacements(placements);

console.error(`\nGrid preview (${layout.rows}×${layout.cols}):`);
console.error(printGridAscii(layout));
console.error('');

console.log(formatPuzzle('/* TODO: assign id */', layout, theme));
