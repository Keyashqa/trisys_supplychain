import useCopilotStore from '../../store/useCopilotStore'
import DropZone from '../upload/DropZone'
import UploadProgress from '../upload/UploadProgress'
import DataSummaryCard from '../upload/DataSummaryCard'
import { useChat } from '../../hooks/useChat'

export default function Sidebar() {
  const uploadStatus = useCopilotStore(s => s.uploadStatus)
  const queryHistory = useCopilotStore(s => s.queryHistory)
  const setActiveTab = useCopilotStore(s => s.setActiveTab)
  const { submit } = useChat()

  return (
    <aside className="w-72 border-r border-ts-border flex flex-col bg-ts-surface shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-ts-border">
        <span className="text-lg font-bold leading-none">
          <span style={{ color: '#0C8DC3' }}>tri</span><span style={{ color: '#ABCF45' }}>Sys</span>
          <span className="text-ts-navy font-semibold text-sm ml-2">Supplychain Assistant</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <DropZone />
        {uploadStatus !== 'idle' && <UploadProgress status={uploadStatus} />}
        <DataSummaryCard />

        {queryHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-ts-muted uppercase tracking-wide mb-2">Recent Queries</p>
            <div className="space-y-1">
              {queryHistory.slice().reverse().map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveTab('chat'); submit(q) }}
                  className="w-full text-left text-xs text-ts-muted hover:text-ts-navy px-2 py-1.5 rounded hover:bg-ts-panel truncate transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
