# Dropout

> *remove the noise. find the signal.*

A word puzzle game where you don't fill in answers — you eliminate junk letters from a grid until only the real words remain.

## How to play

- You're given a grid of letters and a list of clues
- The clues are **anonymous** — no "across" or "down", no numbered positions
- Click any letter to drop it out
- Click it again to restore it
- You win when all the junk is gone and only the answer words remain

## Difficulty

| Level | Non-word cells |
|-------|----------------|
| Easy | Blank (crossword structure visible) |
| Medium | Filled with junk letters |
| Hard | Full grid of real words — no junk at all |

## The AI easter egg

The name is a nod to **dropout** in machine learning — a regularization technique that randomly removes neurons during training to reduce noise. Here, you do the same thing to the grid.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Development

```bash
npm install
npm run dev
```

## Project structure

```
src/
  data/puzzles.js       # Puzzle definitions
  utils/buildGrid.js    # Computes grid from word placements
  components/
    Grid.jsx            # Game state + win detection
    GridCell.jsx        # Single toggleable letter cell
    ClueList.jsx        # Anonymous clue list
    GameBoard.jsx       # Layout
```
