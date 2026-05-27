export default function ClueList({ clues }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-48">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Clues
      </h2>
      <ol className="flex flex-col gap-2">
        {clues.map((clue, i) => (
          <li key={i} className="text-sm text-gray-700 flex gap-2">
            <span className="text-gray-300 font-mono">{i + 1}.</span>
            {clue}
          </li>
        ))}
      </ol>
      <p className="text-xs text-gray-300 mt-4 italic">No across or down — you decide.</p>
    </div>
  );
}
