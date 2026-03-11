import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DelayTrendChart({ data }) {
  const display = data.length > 12 ? data.slice(-12) : data

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Weekly Avg Delay Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={display} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#9ca3af' }}
          />
          <Line type="monotone" dataKey="avg_delay" stroke="#60a5fa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
