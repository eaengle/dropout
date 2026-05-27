const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const ALPHABET   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomFrom(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function tryPlaceDecoy(grid, wordCells, word, rows, cols) {
  const dirs = ['across', 'down'];
  // Shuffle starting positions so placement is varied
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push([r, c]);
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (const dir of dirs) {
    for (const [r, c] of positions) {
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const tr = dir === 'down' ? r + i : r;
        const tc = dir === 'across' ? c + i : c;
        if (tr >= rows || tc >= cols) { fits = false; break; }
        if (wordCells.has(`${tr},${tc}`)) { fits = false; break; }
        if (grid[tr][tc].letter !== null) { fits = false; break; }
      }
      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const tr = dir === 'down' ? r + i : r;
          const tc = dir === 'across' ? c + i : c;
          grid[tr][tc].letter = word[i];
        }
        return true;
      }
    }
  }
  return false;
}

export function buildGrid(puzzle) {
  const { rows, cols, words, difficulty = 2, decoyWords = [] } = puzzle;

  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ letter: null, isWord: false }))
  );

  const wordCells = new Set();

  for (const word of words) {
    for (let i = 0; i < word.answer.length; i++) {
      const row = word.direction === 'down' ? word.startRow + i : word.startRow;
      const col = word.direction === 'across' ? word.startCol + i : word.startCol;
      grid[row][col] = { letter: word.answer[i], isWord: true };
      wordCells.add(`${row},${col}`);
    }
  }

  const junkCells = new Set();

  if (difficulty >= 3 && decoyWords.length > 0) {
    // Level 3+: place real decoy words in empty regions
    const pool = decoyWords.join('');
    for (const word of decoyWords) {
      tryPlaceDecoy(grid, wordCells, word, rows, cols);
    }
    // Fill remaining empty cells with letters sampled from decoy pool
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isWord && grid[r][c].letter === null) {
          grid[r][c].letter = randomFrom(pool);
        }
      }
    }
  } else {
    // Level 2: full alphabet junk; Level 1 already handled above
    const junkPool = difficulty >= 2 ? ALPHABET : CONSONANTS;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isWord) {
          grid[r][c].letter = randomFrom(junkPool);
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].isWord && grid[r][c].letter !== null) {
        junkCells.add(`${r},${c}`);
      }
    }
  }

  return { grid, wordCells, junkCells };
}
