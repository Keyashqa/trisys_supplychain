import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function BarChartWidget({ data, xKey, yKey, title }) {
  return (
    <div className="mt-3">
      {title && <p className="text-xs text-ts-muted mb-2 font-medium">{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={{ fill: '#3a6070', fontSize: 11 }} />
          <YAxis tick={{ fill: '#3a6070', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #C8DDE3', borderRadius: 6 }}
            itemStyle={{ color: '#3a6070' }}
          />
          <Bar dataKey={yKey} radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${196 + i * 18}, 65%, ${45 + i * 3}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
