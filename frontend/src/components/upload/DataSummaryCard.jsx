import useCopilotStore from '../../store/useCopilotStore'

export default function DataSummaryCard() {
  const summary = useCopilotStore(s => s.summary)
  if (!summary) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Dataset Summary</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Rows</span>
          <span className="ml-2 text-white font-mono">{summary.total_rows.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Delay Rate</span>
          <span className="ml-2 text-white font-mono">{(summary.overall_delay_rate * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-gray-500">Warehouses</span>
          <span className="ml-2 text-white font-mono">{summary.warehouses.length}</span>
        </div>
        <div>
          <span className="text-gray-500">Products</span>
          <span className="ml-2 text-white font-mono">{summary.products.length}</span>
        </div>
      </div>
    </div>
  )
}
