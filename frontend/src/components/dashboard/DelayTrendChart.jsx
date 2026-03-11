import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DelayTrendChart({ data }) {
  const display = data.length > 12 ? data.slice(-12) : data

  return (
    <div className="bg-ts-surface border border-ts-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-black mb-4">Weekly Avg Delay Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={display} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fill: '#3a6070', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#3a6070', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #C8DDE3', borderRadius: 8 }}
            labelStyle={{ color: '#052762' }}
            itemStyle={{ color: '#3a6070' }}
          />
          <Line type="monotone" dataKey="avg_delay" stroke="#0C8DC3" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
