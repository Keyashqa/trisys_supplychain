import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const getColor = (delay) => {
  if (delay <= 1) return '#ABCF45'
  if (delay <= 3) return '#eab308'
  return '#ef4444'
}

export default function WarehouseChart({ data }) {
  return (
    <div className="bg-ts-surface border border-ts-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-black mb-4">Avg Delay by Warehouse (days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="Warehouse_ID" tick={{ fill: '#3a6070', fontSize: 12 }} />
          <YAxis tick={{ fill: '#3a6070', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #C8DDE3', borderRadius: 8 }}
            labelStyle={{ color: '#052762' }}
            itemStyle={{ color: '#3a6070' }}
          />
          <Bar dataKey="avg_delay" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.avg_delay)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
