// Grid layout for puzzle 1 (4x4):
//
//  _  P  B  _
//  _  L  I  _
//  L  A  K  E
//  _  N  E  _
//
// Words: LAKE (across), PLAN (down), BIKE (down)
// Intersections: LAKE∩PLAN at (2,1)='A', LAKE∩BIKE at (2,2)='K'

export const puzzles = [
  {
    id: 1,
    rows: 4,
    cols: 4,
    difficulty: 'medium',
    words: [
      { id: 'w1', answer: 'LAKE', direction: 'across', startRow: 2, startCol: 0 },
      { id: 'w2', answer: 'PLAN', direction: 'down',   startRow: 0, startCol: 1 },
      { id: 'w3', answer: 'BIKE', direction: 'down',   startRow: 0, startCol: 2 },
    ],
    clues: [
      'A body of water',
      'A scheme or strategy',
      'A two-wheeled vehicle',
    ],
  },
];
