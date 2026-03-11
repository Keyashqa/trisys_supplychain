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
    <aside className="w-72 border-r border-gray-800 flex flex-col bg-gray-950 shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white">⛓️ ChainCopilot</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <DropZone />
        {uploadStatus !== 'idle' && <UploadProgress status={uploadStatus} />}
        <DataSummaryCard />

        {queryHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Recent Queries</p>
            <div className="space-y-1">
              {queryHistory.slice().reverse().map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveTab('chat'); submit(q) }}
                  className="w-full text-left text-xs text-gray-400 hover:text-gray-200 px-2 py-1.5 rounded hover:bg-gray-800 truncate"
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
