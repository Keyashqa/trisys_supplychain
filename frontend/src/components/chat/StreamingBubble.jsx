import useCopilotStore from '../../store/useCopilotStore'
import Spinner from '../shared/Spinner'
import AgentTracker from './AgentTracker'

export default function StreamingBubble() {
  const streamingText = useCopilotStore(s => s.streamingText)
  const isStreaming = useCopilotStore(s => s.isStreaming)

  if (!isStreaming) return null

  return (
    <div className="flex flex-col">
      <AgentTracker />
      <div className="mx-4 mb-2">
        <div className="bg-ts-surface border border-ts-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-2xl">
          {streamingText ? (
            <p className="text-ts-navy text-sm whitespace-pre-wrap">
              {streamingText}
              <span className="inline-block w-0.5 h-4 bg-ts-blue ml-0.5 animate-pulse align-text-bottom" />
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-ts-muted text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
