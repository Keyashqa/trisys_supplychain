import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function LineChartWidget({ data, xKey, yKey, title }) {
  return (
    <div className="mt-3">
      {title && <p className="text-xs text-ts-muted mb-2 font-medium">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={{ fill: '#3a6070', fontSize: 11 }} />
          <YAxis tick={{ fill: '#3a6070', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #C8DDE3', borderRadius: 6 }}
            itemStyle={{ color: '#3a6070' }}
          />
          <Line type="monotone" dataKey={yKey} stroke="#0C8DC3" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
