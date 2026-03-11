import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function ScatterWidget({ data, xKey, yKey, title }) {
  return (
    <div className="mt-3">
      {title && <p className="text-xs text-gray-400 mb-2 font-medium">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={{ fill: '#9ca3af', fontSize: 11 }} name={xKey} />
          <YAxis dataKey={yKey} tick={{ fill: '#9ca3af', fontSize: 11 }} name={yKey} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6 }}
            itemStyle={{ color: '#9ca3af' }}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter data={data} fill="#818cf8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
