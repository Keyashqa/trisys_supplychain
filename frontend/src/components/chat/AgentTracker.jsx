import useCopilotStore from '../../store/useCopilotStore'
import Spinner from '../shared/Spinner'

const AGENTS = ['DataAgent', 'AnalystAgent', 'NarratorAgent']

function AgentStep({ name, state }) {
  const isRunning = state?.status === 'running'
  const isDone = state?.status === 'done'

  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
        ${isDone ? 'bg-ts-green/20' : isRunning ? 'bg-ts-blue/10' : 'bg-ts-panel'}`}>
        {isDone ? (
          <span className="text-ts-green-d text-xs">✓</span>
        ) : isRunning ? (
          <Spinner size="sm" />
        ) : (
          <span className="text-ts-muted text-xs">·</span>
        )}
      </div>
      <span className={`text-xs ${isDone ? 'text-ts-green-d' : isRunning ? 'text-ts-blue' : 'text-ts-muted'}`}>
        {name}
      </span>
      {isDone && (
        <div className="h-px flex-1 bg-ts-green/30 max-w-12" />
      )}
    </div>
  )
}

export default function AgentTracker() {
  const agentEvents = useCopilotStore(s => s.agentEvents)
  const isStreaming = useCopilotStore(s => s.isStreaming)

  if (!isStreaming && AGENTS.every(a => agentEvents[a]?.status === 'idle')) return null

  return (
    <div className="bg-ts-surface border border-ts-border rounded-xl p-3 my-2 mx-4">
      <p className="text-xs text-ts-muted mb-2 uppercase tracking-wide">Agent Pipeline</p>
      <div className="flex items-center gap-4">
        {AGENTS.map((name) => (
          <AgentStep key={name} name={name} state={agentEvents[name]} />
        ))}
      </div>
      {agentEvents.pinecone_fetch != null && (
        <p className="text-xs text-ts-blue mt-2">
          📌 {agentEvents.pinecone_fetch} similar records retrieved
        </p>
      )}
    </div>
  )
}
