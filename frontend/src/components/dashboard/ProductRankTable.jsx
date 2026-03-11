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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Product Rankings (Top 10)</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs uppercase">
            <th className="text-left pb-2">Product</th>
            <th className="text-right pb-2 cursor-pointer hover:text-gray-300" onClick={() => toggle('avg_delay')}>
              Avg Delay {sortKey === 'avg_delay' ? (asc ? '↑' : '↓') : ''}
            </th>
            <th className="text-right pb-2 cursor-pointer hover:text-gray-300" onClick={() => toggle('avg_processing_time')}>
              Proc. Time {sortKey === 'avg_processing_time' ? (asc ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {top10.map((row) => (
            <tr key={row.Product_ID} className="border-t border-gray-800">
              <td className="py-1.5 text-gray-300 font-mono text-xs">{row.Product_ID}</td>
              <td className={`py-1.5 text-right font-mono text-xs ${row.avg_delay > 3 ? 'text-red-400' : row.avg_delay > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {row.avg_delay?.toFixed(2)}d
              </td>
              <td className="py-1.5 text-right font-mono text-xs text-gray-400">
                {row.avg_processing_time?.toFixed(2)}d
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
