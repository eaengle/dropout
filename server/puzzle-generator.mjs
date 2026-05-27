import OpenAI from 'openai';

const client = new OpenAI();

export async function getWordsAndClues(theme, count, difficulty = 2) {
  const needVague = difficulty >= 4;
  const clueInstruction = needVague
    ? 'Each word gets two clues: "clue" (short, direct, 3–8 words) and "vagueClue" (indirect, cryptic, could fit multiple words, 4–10 words).'
    : 'Each word gets a short anonymous clue (no mention of the word, 3–8 words).';
  const returnShape = needVague
    ? '{ "words": [{ "answer": "WORD", "clue": "hint here", "vagueClue": "cryptic hint here" }, ...] }'
    : '{ "words": [{ "answer": "WORD", "clue": "hint here" }, ...] }';

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You generate word lists for a crossword-style puzzle game called Dropout.
Rules:
- ${theme ? 'All words must relate to the given theme.' : 'Choose words at random — varied topics, no unifying theme.'}
- Words must be 3–8 letters, uppercase, no spaces or hyphens.
- Only use common, real English words that would appear in a standard dictionary.
- No brand names, proper nouns, acronyms, abbreviations, or invented words.
- No obscure or archaic words — a typical adult should recognize every word immediately.
- ${clueInstruction}
- Return exactly ${count * 2} candidates so the layout algorithm has plenty to work with.
- Return JSON: ${returnShape}`,
      },
      {
        role: 'user',
        content: theme ? `Theme: "${theme}"` : 'Generate random words with no theme.',
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content);
  return data.words.map(w => ({
    answer: w.answer.toUpperCase().replace(/[^A-Z]/g, ''),
    clue: w.clue,
    vagueClue: w.vagueClue ?? null,
  }));
}

export async function getDecoyWords(theme) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You generate short filler words for a puzzle game. These words are NOT related to the theme — they are decoys.
Rules:
- Return 12 common English words, 3–5 letters each, uppercase.
- They must be real dictionary words but unrelated to the given theme.
- No proper nouns or abbreviations.
- Return JSON: { "words": ["WORD", ...] }`,
      },
      {
        role: 'user',
        content: theme ? `Theme to avoid: "${theme}"` : 'No theme — just avoid the most common English function words.',
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content);
  return data.words.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 3);
}

const MAX_GRID = 14;

function canPlace(grid, word, row, col, dir) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < word.length; i++) {
    const r = dir === 'across' ? row : row + i;
    const c = dir === 'across' ? col + i : col;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const cell = grid[r][c];
    if (cell !== null && cell !== word[i]) return false;
  }

  const endR = dir === 'across' ? row : row + word.length;
  const endC = dir === 'across' ? col + word.length : col;
  if (dir === 'across') {
    if (col > 0 && grid[row][col - 1] !== null) return false;
    if (endC < cols && grid[row][endC] !== null) return false;
  } else {
    if (row > 0 && grid[row - 1][col] !== null) return false;
    if (endR < rows && grid[endR][col] !== null) return false;
  }

  return true;
}

function placeWord(grid, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'across' ? row : row + i;
    const c = dir === 'across' ? col + i : col;
    grid[r][c] = word[i];
  }
}

function unplaceWord(grid, placed, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'across' ? row : row + i;
    const c = dir === 'across' ? col + i : col;
    const usedByOther = placed.some(p => {
      for (let j = 0; j < p.answer.length; j++) {
        const pr = p.dir === 'across' ? p.row : p.row + j;
        const pc = p.dir === 'across' ? p.col + j : p.col;
        if (pr === r && pc === c) return true;
      }
      return false;
    });
    if (!usedByOther) grid[r][c] = null;
  }
}

export function layoutWords(words, targetCount) {
  const sorted = [...words].sort((a, b) => b.answer.length - a.answer.length);
  const placed = [];
  const grid = Array.from({ length: MAX_GRID }, () => Array(MAX_GRID).fill(null));
  const OFFSET = 3;

  function tryPlace(candidates) {
    if (placed.length === targetCount) return true;
    if (candidates.length === 0) return placed.length >= 3;

    const [current, ...rest] = candidates;
    const answer = current.answer;

    if (placed.length === 0) {
      const row = OFFSET;
      const col = OFFSET;
      if (canPlace(grid, answer, row, col, 'across')) {
        placeWord(grid, answer, row, col, 'across');
        placed.push({ ...current, row, col, dir: 'across' });
        if (tryPlace(rest)) return true;
        placed.pop();
        unplaceWord(grid, placed, answer, row, col, 'across');
      }
      return false;
    }

    let found = false;
    outer: for (const p of [...placed]) {
      for (let pi = 0; pi < p.answer.length; pi++) {
        const letter = p.answer[pi];
        for (let ai = 0; ai < answer.length; ai++) {
          if (answer[ai] !== letter) continue;

          const newDir = p.dir === 'across' ? 'down' : 'across';
          const pR = p.dir === 'across' ? p.row : p.row + pi;
          const pC = p.dir === 'across' ? p.col + pi : p.col;
          const row = newDir === 'across' ? pR : pR - ai;
          const col = newDir === 'across' ? pC - ai : pC;

          if (row < 0 || col < 0 || row >= MAX_GRID || col >= MAX_GRID) continue;
          if (!canPlace(grid, answer, row, col, newDir)) continue;

          let adjacentOk = true;
          for (let i = 0; i < answer.length; i++) {
            if (i === ai) continue;
            const r = newDir === 'across' ? row : row + i;
            const c = newDir === 'across' ? col + i : col;
            if (newDir === 'across') {
              if ((r > 0 && grid[r - 1][c] !== null) || (r + 1 < MAX_GRID && grid[r + 1][c] !== null)) {
                adjacentOk = false; break;
              }
            } else {
              if ((c > 0 && grid[r][c - 1] !== null) || (c + 1 < MAX_GRID && grid[r][c + 1] !== null)) {
                adjacentOk = false; break;
              }
            }
          }
          if (!adjacentOk) continue;

          placeWord(grid, answer, row, col, newDir);
          placed.push({ ...current, row, col, dir: newDir });
          if (tryPlace(rest)) { found = true; break outer; }
          placed.pop();
          unplaceWord(grid, placed, answer, row, col, newDir);
        }
      }
    }
    if (found) return true;
    return tryPlace(rest);
  }

  tryPlace(sorted);
  return placed;
}

export function normalizePlacements(placements) {
  if (placements.length === 0) return { words: [], rows: 0, cols: 0 };

  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const { answer, row, col, dir } of placements) {
    for (let i = 0; i < answer.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }
  }

  const words = placements.map((p, i) => ({
    id: `w${i + 1}`,
    answer: p.answer,
    clue: p.clue,
    vagueClue: p.vagueClue ?? null,
    direction: p.dir,
    startRow: p.row - minR,
    startCol: p.col - minC,
  }));

  return {
    words,
    rows: maxR - minR + 1,
    cols: maxC - minC + 1,
  };
}

export async function generatePuzzle(theme, wordCount = 5, difficulty = 2) {
  const [candidates, decoyWords] = await Promise.all([
    getWordsAndClues(theme, wordCount, difficulty),
    difficulty >= 3 ? getDecoyWords(theme) : Promise.resolve([]),
  ]);

  const placements = layoutWords(candidates, wordCount);
  if (placements.length < 3) throw new Error('Could not place enough words. Try a different theme.');
  const layout = normalizePlacements(placements);

  return {
    theme,
    difficulty,
    rows: layout.rows,
    cols: layout.cols,
    words: layout.words.map(({ clue: _, vagueClue: __, ...w }) => w),
    clues: layout.words.map(w => w.clue),
    vagueClues: difficulty >= 4 ? layout.words.map(w => w.vagueClue ?? w.clue) : undefined,
    decoyWords: difficulty >= 3 ? decoyWords : undefined,
  };
}
