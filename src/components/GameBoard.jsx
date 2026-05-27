import Grid from './Grid';

export default function GameBoard({ puzzle }) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-sm text-gray-400 mb-8">
        Drop out the junk letters. What remains should answer every clue.
      </p>
      <Grid puzzle={puzzle} />
    </div>
  );
}
