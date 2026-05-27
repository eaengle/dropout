import { useState, useMemo } from 'react';
import GridCell from './GridCell';
import ClueList from './ClueList';
import { buildGrid } from '../utils/buildGrid';

export default function Grid({ puzzle }) {
  const { grid, wordCells, junkCells } = useMemo(() => buildGrid(puzzle), [puzzle]);
  const [removed, setRemoved] = useState(new Set());

  const toggle = (r, c) => {
    const key = `${r},${c}`;
    setRemoved((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const solved = useMemo(() => {
    if (junkCells.size === 0) return false;
    for (const key of junkCells) {
      if (!removed.has(key)) return false;
    }
    for (const key of wordCells) {
      if (removed.has(key)) return false;
    }
    return true;
  }, [removed, wordCells, junkCells]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      <div className="flex flex-col gap-1">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => (
              <GridCell
                key={c}
                letter={cell.letter}
                removed={removed.has(`${r},${c}`)}
                onClick={() => cell.letter !== null && toggle(r, c)}
              />
            ))}
          </div>
        ))}
        {solved && (
          <p className="mt-4 text-center text-green-600 font-semibold text-sm">
            Puzzle solved!
          </p>
        )}
      </div>

      <ClueList clues={puzzle.clues} />
    </div>
  );
}
