const SUGGESTIONS = [
  'Which warehouse has the highest delay?',
  'What products have the worst processing time?',
  'Show me the delay trend over time',
]

export default function FollowUpChips({ onSubmit }) {
  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
      {SUGGESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSubmit(q)}
          className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-full border border-gray-700 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
