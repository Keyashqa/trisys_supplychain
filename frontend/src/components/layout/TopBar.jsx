import useCopilotStore from '../../store/useCopilotStore'

export default function TopBar({ activeTab, setActiveTab }) {
  const summary = useCopilotStore(s => s.summary)
  const uploadStatus = useCopilotStore(s => s.uploadStatus)

  return (
    <div className="h-14 border-b border-ts-border flex items-center justify-between px-6 bg-ts-surface">
      <div className="flex gap-1">
        {['dashboard', 'chat'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
              ${activeTab === tab ? 'bg-ts-panel text-ts-navy' : 'text-ts-muted hover:text-ts-navy'}`}
          >
            {tab === 'dashboard' ? '📊 Dashboard' : '💬 Chat'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        {uploadStatus === 'ready' && summary && (
          <span className="text-ts-muted">
            <span className="text-ts-blue font-mono font-semibold">{summary.total_rows.toLocaleString()}</span> rows loaded
          </span>
        )}
        <div className={`w-2 h-2 rounded-full ${uploadStatus === 'ready' ? 'bg-ts-green' : uploadStatus === 'uploading' ? 'bg-amber-400 animate-pulse' : 'bg-ts-muted'}`} />
      </div>
    </div>
  )
}
