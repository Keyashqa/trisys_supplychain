export default function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-ts-panel text-ts-navy',
    green:  'bg-ts-green/20 text-ts-green-d',
    red:    'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    blue:   'bg-ts-blue/10 text-ts-blue',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}
