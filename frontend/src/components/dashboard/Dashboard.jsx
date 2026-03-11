import useCopilotStore from '../../store/useCopilotStore'
import EmptyState from '../shared/EmptyState'
import KPICard from './KPICard'
import WarehouseChart from './WarehouseChart'
import SeverityPieChart from './SeverityPieChart'
import DelayTrendChart from './DelayTrendChart'
import ProductRankTable from './ProductRankTable'

export default function Dashboard() {
  const summary = useCopilotStore(s => s.summary)

  if (!summary) {
    return (
      <EmptyState
        icon="📊"
        title="No data loaded"
        description="Upload a supply chain CSV from the sidebar to populate the dashboard."
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Orders" value={summary.total_rows.toLocaleString()} color="blue" />
        <KPICard
          label="Delay Rate"
          value={`${(summary.overall_delay_rate * 100).toFixed(1)}%`}
          sub="of all orders delayed"
          color={summary.overall_delay_rate > 0.3 ? 'red' : 'green'}
        />
        <KPICard
          label="Avg Shipping Delay"
          value={`${summary.avg_shipping_delay}d`}
          color={summary.avg_shipping_delay > 3 ? 'red' : 'yellow'}
        />
        <KPICard
          label="Avg Processing Time"
          value={`${summary.avg_processing_time}d`}
          color="blue"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <WarehouseChart data={summary.warehouse_stats} />
        <SeverityPieChart data={summary.severity_counts} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <DelayTrendChart data={summary.delay_trend || []} />
        <ProductRankTable data={summary.product_stats} />
      </div>
    </div>
  )
}
