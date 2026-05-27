import { useState } from 'react';
import GameBoard from './components/GameBoard';

const SEED_PHRASES = [
  'ocean life', 'outer space', 'kitchen tools', 'ancient Rome', 'jazz music',
  'tropical birds', 'mountain climbing', 'fairy tales', 'computer science', 'wild west',
  'medieval knights', 'sushi restaurant', 'art museum', 'stock market', 'architecture',
  'Greek mythology', 'desert animals', 'board games', 'chemistry lab', 'ballet dance',
  'pirate adventure', 'Japanese culture', 'astronomy', 'fashion design', 'forest creatures',
  'pizza toppings', 'superhero powers', 'time travel', 'deep sea creatures', 'Renaissance art',
  'coffee shop', 'winter sports', 'magic spells', 'Egyptian history', 'garden flowers',
  'car racing', 'detective stories', 'Viking history', 'yoga poses', 'submarine voyage',
  'ice cream flavors', 'secret agents', 'tropical fruits', 'jazz instruments', 'martial arts',
  'weather phenomena', 'cave exploration', 'opera', 'space station', 'haunted house',
  'aquarium life', 'gold rush', 'pottery making', 'volcano science', 'origami',
  'safari animals', 'harvest festival', 'music theory', 'quantum physics', 'coral reef',
  'night sky', 'autumn leaves', 'wine tasting', 'archaeology dig', 'storm chasing',
  'chess pieces', 'circus performance', 'ancient Egypt', 'forest mushrooms', 'dragon lore',
  'bioluminescence', 'medieval siege', 'butterfly garden', 'ancient ruins', 'river wildlife',
  'chemistry elements', 'stage magic', 'cave paintings', 'deep jungle', 'Norse mythology',
  'tide pools', 'ice sculpting', 'train travel', 'ghost stories', 'treasure hunting',
  'rock climbing', 'street food', 'circus animals', 'Renaissance fair', 'film noir',
  'tropical storm', 'sunken ships', 'stargazing', 'urban legends', 'medieval alchemy',
  'olympic sports', 'jazz age', 'bakery items', 'cryptography', 'coral gardens',
];

const DIFFICULTY_LABELS = [
  { level: 1, label: 'Easy',    desc: 'Consonant-only junk' },
  { level: 2, label: 'Medium',  desc: 'Full alphabet junk' },
  { level: 3, label: 'Hard',    desc: 'Real decoy words' },
  { level: 4, label: 'Expert',  desc: 'Vague clues' },
  { level: 5, label: 'Extreme', desc: 'Limited mistakes' },
];

export default function App() {
  const [theme, setTheme] = useState('');
  const [wordCount, setWordCount] = useState(5);
  const [difficulty, setDifficulty] = useState(2);
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPuzzle(null);
    const resolvedTheme = theme.trim() || SEED_PHRASES[Math.floor(Math.random() * SEED_PHRASES.length)];
    try {
      const res = await fetch('/api/generate-puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: resolvedTheme, wordCount, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setPuzzle(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-12 bg-gray-950"
      style={{ backgroundImage: 'url(/images/bg-game.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8 rounded-xl overflow-hidden relative">
          <img src="/images/bg-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="relative z-10 p-6 bg-black/50">
            <h1 className="text-4xl font-bold text-green-400 tracking-tight font-mono">Dropout</h1>
            <p className="text-xs text-green-300/70 font-mono">remove the noise. find the signal.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4 mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="Theme… ocean, space, cooking (leave blank for random)"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900/70 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating…' : 'Generate'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Word count */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Words
              </label>
              <input
                type="range"
                min={3}
                max={10}
                value={wordCount}
                onChange={e => setWordCount(Number(e.target.value))}
                disabled={loading}
                className="w-28 accent-indigo-500"
              />
              <span className="text-sm font-mono text-indigo-300 w-4">{wordCount}</span>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">
                Difficulty
              </span>
              {DIFFICULTY_LABELS.map(({ level, label, desc }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  disabled={loading}
                  title={desc}
                  className={[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    difficulty === level
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-300',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {difficulty >= 1 && (
            <p className="text-xs text-gray-500 italic">
              {DIFFICULTY_LABELS[difficulty - 1].desc} — {6 - difficulty} wrong click{6 - difficulty !== 1 ? 's' : ''} allowed
            </p>
          )}
        </form>

        {error && (
          <p className="text-red-400 text-sm mb-6">{error}</p>
        )}

        {puzzle && <GameBoard puzzle={puzzle} />}
      </div>
    </div>
  );
}
