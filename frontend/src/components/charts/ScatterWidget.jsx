import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function ScatterWidget({ data, xKey, yKey, title }) {
  return (
    <div className="mt-3">
      {title && <p className="text-xs text-ts-muted mb-2 font-medium">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={{ fill: '#3a6070', fontSize: 11 }} name={xKey} />
          <YAxis dataKey={yKey} tick={{ fill: '#3a6070', fontSize: 11 }} name={yKey} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #C8DDE3', borderRadius: 6 }}
            itemStyle={{ color: '#3a6070' }}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter data={data} fill="#0C8DC3" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
