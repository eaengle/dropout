import GameBoard from "./components/GameBoard";
import { puzzles } from "./data/puzzles";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-12">
      <GameBoard puzzle={puzzles[0]} />
    </div>
  );
}
