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
    <div className="border-t border-gray-800 p-4">
      {uploadStatus !== 'ready' && (
        <p className="text-xs text-gray-600 mb-2 text-center">Upload a CSV file to start asking questions</p>
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
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: 44, maxHeight: 120 }}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
