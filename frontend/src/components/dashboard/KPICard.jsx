export default function KPICard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'text-ts-blue',
    green:  'text-ts-green-d',
    red:    'text-red-500',
    yellow: 'text-amber-500',
  }
  return (
    <div className="bg-ts-surface border border-ts-border rounded-xl p-4">
      <p className="text-xs text-black uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${colors[color] || colors.blue}`}>{value}</p>
      {sub && <p className="text-xs text-ts-muted mt-1">{sub}</p>}
    </div>
  )
}
