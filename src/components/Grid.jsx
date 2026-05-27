import { useState, useMemo } from 'react';
import GridCell from './GridCell';
import ClueList from './ClueList';
import { buildGrid } from '../utils/buildGrid';

export default function Grid({ puzzle }) {
  const { grid, wordCells, junkCells } = useMemo(() => buildGrid(puzzle), [puzzle]);
  const [removed, setRemoved] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);

  const difficulty = puzzle.difficulty ?? 2;
  const maxMistakes = 6 - difficulty;
  const clues = difficulty >= 4 && puzzle.vagueClues ? puzzle.vagueClues : puzzle.clues;
  const failed = mistakes >= maxMistakes;

  const toggle = (r, c) => {
    if (failed) return;
    const key = `${r},${c}`;
    const isWord = wordCells.has(key);
    setRemoved(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        if (isWord) setMistakes(m => m + 1);
      }
      return next;
    });
  };

  const solved = useMemo(() => {
    if (failed) return false;
    if (junkCells.size === 0) return false;
    for (const key of junkCells) {
      if (!removed.has(key)) return false;
    }
    for (const key of wordCells) {
      if (removed.has(key)) return false;
    }
    return true;
  }, [removed, wordCells, junkCells, failed]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      <div className="flex flex-col gap-1">
        <div className="flex gap-1 mb-2">
            {Array.from({ length: maxMistakes }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  i < mistakes ? 'bg-red-500 border-red-600' : 'bg-gray-100 border-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1 self-center">
              {maxMistakes - mistakes} mistake{maxMistakes - mistakes !== 1 ? 's' : ''} left
            </span>
          </div>

        {grid.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => {
              const key = `${r},${c}`;
              const isWordCell = wordCells.has(key);
              const isRemoved = removed.has(key);
              const isWrong = isRemoved && isWordCell;
              return (
                <GridCell
                  key={c}
                  letter={cell.letter}
                  removed={isRemoved}
                  wrong={isWrong}
                  onClick={() => cell.letter !== null && toggle(r, c)}
                />
              );
            })}
          </div>
        ))}

        {solved && (
          <p className="mt-4 text-center text-green-600 font-semibold text-sm">
            Puzzle solved!
          </p>
        )}
        {failed && (
          <p className="mt-4 text-center text-red-500 font-semibold text-sm">
            Too many mistakes — puzzle failed.
          </p>
        )}
      </div>

      <ClueList clues={clues} />
    </div>
  );
}
