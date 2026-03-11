import useCopilotStore from '../../store/useCopilotStore'
import BarChartWidget from './BarChartWidget'
import LineChartWidget from './LineChartWidget'
import ScatterWidget from './ScatterWidget'

export default function DynamicChart({ chartInstruction }) {
  const summary = useCopilotStore(s => s.summary)
  if (!chartInstruction || !summary) return null

  const { chart_type, title, x_key, y_key, chart_data_key } = chartInstruction
  const rawData = summary[chart_data_key]
  if (!rawData || !Array.isArray(rawData)) return null

  if (chart_type === 'bar') return <BarChartWidget data={rawData} xKey={x_key} yKey={y_key} title={title} />
  if (chart_type === 'line') return <LineChartWidget data={rawData} xKey={x_key} yKey={y_key} title={title} />
  if (chart_type === 'scatter') return <ScatterWidget data={rawData} xKey={x_key} yKey={y_key} title={title} />
  return null
}
