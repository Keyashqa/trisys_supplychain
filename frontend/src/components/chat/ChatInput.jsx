import { useState, useRef } from 'react'
import useCopilotStore from '../../store/useCopilotStore'

export default function ChatInput({ onSubmit }) {
  const [value, setValue] = useState('')
  const isStreaming = useCopilotStore(s => s.isStreaming)
  const uploadStatus = useCopilotStore(s => s.uploadStatus)
  const textareaRef = useRef(null)

  const disabled = isStreaming || uploadStatus !== 'ready'

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    const q = value.trim()
    if (!q || disabled) return
    onSubmit(q)
    setValue('')
    textareaRef.current?.focus()
  }

  return (
    <div className="border-t border-ts-border p-4 bg-ts-surface">
      {uploadStatus !== 'ready' && (
        <p className="text-xs text-ts-muted mb-2 text-center">Upload a CSV file to start asking questions</p>
      )}
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={disabled && uploadStatus !== 'ready' ? 'Upload a CSV first...' : 'Ask about your supply chain data...'}
          className="flex-1 bg-ts-bg border border-ts-border rounded-xl px-4 py-2.5 text-sm text-ts-navy placeholder-ts-muted resize-none focus:outline-none focus:border-ts-blue disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: 44, maxHeight: 120 }}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="px-4 py-2.5 bg-ts-blue hover:bg-ts-blue-d disabled:bg-ts-panel disabled:text-ts-muted text-white rounded-xl text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
