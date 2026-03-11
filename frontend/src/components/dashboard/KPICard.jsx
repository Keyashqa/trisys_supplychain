export default function KPICard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'text-blue-400',
    green:  'text-green-400',
    red:    'text-red-400',
    yellow: 'text-yellow-400',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${colors[color] || colors.blue}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
