import Grid from './Grid';

export default function GameBoard({ puzzle }) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 tracking-tight">Dropout</h1>
        <p className="text-xs text-indigo-300 font-mono mb-3">remove the noise. find the signal.</p>
        <p className="text-sm text-gray-400">
          Drop out the junk letters. What remains should answer every clue.
        </p>
      </div>
      <Grid puzzle={puzzle} />
    </div>
  );
}
