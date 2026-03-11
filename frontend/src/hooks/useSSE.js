import { BASE_URL } from '../api/constants'

export function createSSEStream(question, sessionId, onEvent, onError) {
  let cancelled = false
  const controller = new AbortController()

  async function start() {
    try {
      console.log('[SSE] Connecting to /ask with question:', question)

      const res = await fetch(`${BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId }),
        signal: controller.signal,
      })

      console.log('[SSE] Response status:', res.status, res.headers.get('content-type'))

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let chunkCount = 0

      while (!cancelled) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('[SSE] Stream ended. Total chunks received:', chunkCount)
          break
        }
        chunkCount++
        const text = decoder.decode(value, { stream: true })
        console.log(`[SSE] Raw chunk #${chunkCount}:`, JSON.stringify(text))
        buffer += text
        const parts = buffer.split('\n\n')
        buffer = parts.pop()

        for (const block of parts) {
          if (!block.trim()) continue
          console.log('[SSE] Processing block:', JSON.stringify(block))
          const lines = block.split('\n')
          let eventName = 'message'
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventName = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              try {
                const payload = JSON.parse(line.slice(6))
                console.log(`[SSE] Event: "${eventName}" →`, payload)
                onEvent(eventName, payload)
              } catch (e) {
                console.error('[SSE] JSON parse error on line:', line, e)
              }
              eventName = 'message'
            }
          }
        }
      }

      if (buffer.trim()) {
        console.warn('[SSE] Unparsed buffer remaining:', JSON.stringify(buffer))
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[SSE] Fetch error:', err)
        onError(err)
      }
    }
  }

  start()
  return () => { cancelled = true; controller.abort() }
}
