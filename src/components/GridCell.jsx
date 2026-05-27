export default function GridCell({ letter, removed, wrong, onClick }) {
  if (letter === null) {
    return <div className="w-10 h-10 rounded bg-gray-900/50" />;
  }

  let style;
  if (wrong) {
    style = 'bg-red-950 border-red-700 text-red-400 line-through';
  } else if (removed) {
    style = 'bg-gray-900 border-gray-700 text-gray-600 line-through';
  } else {
    style = 'bg-gray-800 border-indigo-700 text-indigo-200 shadow-sm hover:bg-gray-700 hover:border-indigo-500';
  }

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded font-mono text-sm font-bold border-2 transition-all duration-100 select-none ${style}`}
    >
      {letter}
    </button>
  );
}
