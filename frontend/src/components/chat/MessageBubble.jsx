import DynamicChart from '../charts/DynamicChart'

export default function MessageBubble({ message, onFollowUp }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mx-4 mb-2">
        <div className="bg-ts-blue text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-2">
      <div className="bg-ts-surface border border-ts-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-2xl">
        <p className="text-ts-navy text-sm whitespace-pre-wrap mb-2">{message.content}</p>

        {message.chart && (
          <div className="border-t border-ts-border pt-3">
            <DynamicChart chartInstruction={message.chart} />
          </div>
        )}

        {message.recommendation && (
          <div className="mt-3 p-3 bg-ts-blue/10 border border-ts-blue/30 rounded-lg">
            <p className="text-xs text-ts-blue font-medium mb-1">Recommendation</p>
            <p className="text-sm text-ts-navy">{message.recommendation}</p>
          </div>
        )}

        {message.follow_ups && message.follow_ups.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.follow_ups.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(q)}
                className="text-xs px-3 py-1.5 bg-ts-panel hover:bg-ts-border text-ts-navy rounded-full border border-ts-border transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
