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
    const next = new Set(removed);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
      if (wordCells.has(key)) setMistakes(m => m + 1);
    }
    setRemoved(next);
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
                  i < mistakes ? 'bg-red-500 border-red-600' : 'bg-gray-700 border-gray-600'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1 self-center">
              {maxMistakes - mistakes} mistake{maxMistakes - mistakes !== 1 ? 's' : ''} left
            </span>
          </div>

        <div className="relative">
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-[0.07] rounded"
            style={{ backgroundImage: 'url(/images/texture-grain.png)', backgroundSize: 'cover' }}
          />
          {grid.map((row, r) => (
            <div key={r} className="flex gap-1 mb-1">
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
        </div>

        {solved && (
          <div className="mt-4 rounded-lg overflow-hidden relative">
            <img src="/images/win-signal.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative z-10 py-6 px-4 text-center bg-black/40">
              <p className="text-white font-bold text-lg tracking-widest font-mono">SIGNAL FOUND</p>
              <p className="text-gray-300 text-xs font-mono mt-1">puzzle complete</p>
            </div>
          </div>
        )}
        {failed && (
          <p className="mt-4 text-center text-red-400 font-semibold text-sm font-mono">
            Too many mistakes — puzzle failed.
          </p>
        )}
      </div>

      <ClueList clues={clues} />
    </div>
  );
}
