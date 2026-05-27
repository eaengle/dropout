export default function GridCell({ letter, removed, wrong, onClick }) {
  if (letter === null) {
    return <div className="w-10 h-10 rounded bg-gray-900" />;
  }

  let style;
  if (wrong) {
    style = 'bg-red-50 border-red-300 text-red-400 line-through';
  } else if (removed) {
    style = 'bg-gray-100 border-gray-200 text-gray-300 line-through';
  } else {
    style = 'bg-white border-indigo-300 text-indigo-900 shadow-sm hover:bg-indigo-50 hover:border-indigo-500';
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
