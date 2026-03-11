import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = { on_time: '#ABCF45', minor: '#eab308', critical: '#ef4444' }

export default function SeverityPieChart({ data }) {
  const chartData = [
    { name: 'On Time', value: data.on_time, key: 'on_time' },
    { name: 'Minor', value: data.minor, key: 'minor' },
    { name: 'Critical', value: data.critical, key: 'critical' },
  ].filter(d => d.value > 0)

  return (
    <div className="bg-ts-surface border border-ts-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-black mb-4">Delay Severity Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #C8DDE3', borderRadius: 8 }}
            itemStyle={{ color: '#3a6070' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
