import { useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import useCopilotStore from '../store/useCopilotStore'
import { createSSEStream } from './useSSE'

export function useChat() {
  const store = useCopilotStore()
  const cancelRef = useRef(null)
  const sessionId = useRef(uuidv4())

  const submit = useCallback((question) => {
    if (!question.trim() || store.isStreaming) return

    if (cancelRef.current) cancelRef.current()

    store.addUserMessage(question)
    store.resetAgentEvents()
    store.startStreaming()

    const cancel = createSSEStream(
      question,
      sessionId.current,
      (eventName, payload) => {
        console.log('[Chat] Handling event:', eventName, payload)
        if (eventName === 'agent_start') {
          console.log('[Chat] Agent starting:', payload.agent)
          store.updateAgentEvent(payload.agent, { status: 'running' })
        } else if (eventName === 'agent_done') {
          console.log('[Chat] Agent done:', payload.agent)
          store.updateAgentEvent(payload.agent, { status: 'done', result: payload.result })
        } else if (eventName === 'pinecone_fetch') {
          console.log('[Chat] Pinecone fetch count:', payload.count ?? payload.insights_retrieved)
          store.setPinecone(payload.count ?? payload.insights_retrieved)
        } else if (eventName === 'token') {
          store.appendToken(payload.text)
        } else if (eventName === 'complete') {
          console.log('[Chat] Complete payload:', payload)
          store.finalizeMessage(payload)
        } else if (eventName === 'error') {
          console.error('[Chat] Backend error:', payload.message)
          store.setStreamingError(payload.message)
        } else {
          console.warn('[Chat] Unknown event type:', eventName, payload)
        }
      },
      (err) => {
        console.error('[Chat] Stream error:', err)
        store.setStreamingError(err.message)
      }
    )

    cancelRef.current = cancel
  }, [store])

  return { submit }
}
