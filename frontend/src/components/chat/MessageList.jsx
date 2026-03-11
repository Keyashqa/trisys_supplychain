import { useEffect, useRef } from 'react'
import useCopilotStore from '../../store/useCopilotStore'
import MessageBubble from './MessageBubble'
import StreamingBubble from './StreamingBubble'

export default function MessageList({ onFollowUp }) {
  const messages = useCopilotStore(s => s.messages)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} onFollowUp={onFollowUp} />
      ))}
      <StreamingBubble />
      <div ref={bottomRef} />
    </div>
  )
}
