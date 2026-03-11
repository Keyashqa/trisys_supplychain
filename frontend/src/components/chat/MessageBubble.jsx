import DynamicChart from '../charts/DynamicChart'

export default function MessageBubble({ message, onFollowUp }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mx-4 mb-2">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-2">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-2xl">
        <p className="text-gray-200 text-sm whitespace-pre-wrap mb-2">{message.content}</p>

        {message.chart && (
          <div className="border-t border-gray-800 pt-3">
            <DynamicChart chartInstruction={message.chart} />
          </div>
        )}

        {message.recommendation && (
          <div className="mt-3 p-3 bg-blue-950/40 border border-blue-900/50 rounded-lg">
            <p className="text-xs text-blue-400 font-medium mb-1">Recommendation</p>
            <p className="text-sm text-blue-200">{message.recommendation}</p>
          </div>
        )}

        {message.follow_ups && message.follow_ups.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.follow_ups.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(q)}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full border border-gray-700 transition-colors"
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
