import { useState } from 'react'

export default function ProductRankTable({ data }) {
  const [sortKey, setSortKey] = useState('avg_delay')
  const [asc, setAsc] = useState(false)

  const sorted = [...data].sort((a, b) => asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey])
  const top10 = sorted.slice(0, 10)

  const toggle = (key) => {
    if (sortKey === key) setAsc(!asc)
    else { setSortKey(key); setAsc(false) }
  }

  return (
    <div className="bg-ts-surface border border-ts-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-black mb-4">Product Rankings (Top 10)</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-ts-muted text-xs uppercase">
            <th className="text-left pb-2">Product</th>
            <th className="text-right pb-2 cursor-pointer hover:text-ts-navy" onClick={() => toggle('avg_delay')}>
              Avg Delay {sortKey === 'avg_delay' ? (asc ? '↑' : '↓') : ''}
            </th>
            <th className="text-right pb-2 cursor-pointer hover:text-ts-navy" onClick={() => toggle('avg_processing_time')}>
              Proc. Time {sortKey === 'avg_processing_time' ? (asc ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {top10.map((row) => (
            <tr key={row.Product_ID} className="border-t border-ts-border">
              <td className="py-1.5 text-ts-navy font-mono text-xs">{row.Product_ID}</td>
              <td className={`py-1.5 text-right font-mono text-xs ${row.avg_delay > 3 ? 'text-red-500' : row.avg_delay > 0 ? 'text-amber-500' : 'text-ts-green-d'}`}>
                {row.avg_delay?.toFixed(2)}d
              </td>
              <td className="py-1.5 text-right font-mono text-xs text-ts-muted">
                {row.avg_processing_time?.toFixed(2)}d
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
