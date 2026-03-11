export default function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-800 text-gray-300',
    green:  'bg-green-900 text-green-300',
    red:    'bg-red-900 text-red-300',
    yellow: 'bg-yellow-900 text-yellow-300',
    blue:   'bg-blue-900 text-blue-300',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}
