const JUNK = 'BCDFGHJKLMNPQRSTVWXYZ';

function randomLetter() {
  return JUNK[Math.floor(Math.random() * JUNK.length)];
}

export function buildGrid(puzzle) {
  const { rows, cols, words, difficulty } = puzzle;

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

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].isWord) {
        const letter = difficulty === 'easy' ? null : randomLetter();
        grid[r][c].letter = letter;
        if (letter !== null) junkCells.add(`${r},${c}`);
      }
    }
  }

  return { grid, wordCells, junkCells };
}
