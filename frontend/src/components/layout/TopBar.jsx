import useCopilotStore from '../../store/useCopilotStore'

export default function TopBar({ activeTab, setActiveTab }) {
  const summary = useCopilotStore(s => s.summary)
  const uploadStatus = useCopilotStore(s => s.uploadStatus)

  return (
    <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950">
      <div className="flex gap-1">
        {['dashboard', 'chat'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
              ${activeTab === tab ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab === 'dashboard' ? '📊 Dashboard' : '💬 Chat'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        {uploadStatus === 'ready' && summary && (
          <span className="text-gray-400">
            <span className="text-green-400 font-mono">{summary.total_rows.toLocaleString()}</span> rows loaded
          </span>
        )}
        <div className={`w-2 h-2 rounded-full ${uploadStatus === 'ready' ? 'bg-green-400' : uploadStatus === 'uploading' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`} />
      </div>
    </div>
  )
}
