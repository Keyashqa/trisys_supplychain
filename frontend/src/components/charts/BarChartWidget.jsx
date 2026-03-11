import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function BarChartWidget({ data, xKey, yKey, title }) {
  return (
    <div className="mt-3">
      {title && <p className="text-xs text-gray-400 mb-2 font-medium">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6 }}
            itemStyle={{ color: '#9ca3af' }}
          />
          <Bar dataKey={yKey} radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${210 + i * 15}, 70%, 55%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
