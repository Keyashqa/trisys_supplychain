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
          className="text-xs px-3 py-1.5 bg-ts-panel hover:bg-ts-border text-ts-muted hover:text-ts-navy rounded-full border border-ts-border transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
