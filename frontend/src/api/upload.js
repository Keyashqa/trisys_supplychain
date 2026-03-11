import { BASE_URL } from './constants'

export async function uploadCSV(file) {
  const formData = new FormData()
  formData.append('csv_file', file)
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
  return res.json()
}
