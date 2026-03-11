import useCopilotStore from '../../store/useCopilotStore'
import { useChat } from '../../hooks/useChat'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import FollowUpChips from './FollowUpChips'
import EmptyState from '../shared/EmptyState'

export default function ChatPanel() {
  const { submit } = useChat()
  const messages = useCopilotStore(s => s.messages)
  const uploadStatus = useCopilotStore(s => s.uploadStatus)

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 && uploadStatus === 'ready' ? (
        <div className="flex-1 flex flex-col justify-center">
          <EmptyState
            icon="💬"
            title="Ask about your supply chain"
            description="Start with one of the suggestions below or type your own question."
          />
          <FollowUpChips onSubmit={submit} />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1">
          <EmptyState
            icon="💬"
            title="No conversation yet"
            description="Upload a CSV file to start asking questions about your supply chain."
          />
        </div>
      ) : (
        <MessageList onFollowUp={submit} />
      )}
      <ChatInput onSubmit={submit} />
    </div>
  )
}
