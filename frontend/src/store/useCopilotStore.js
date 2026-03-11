import { create } from 'zustand'

const defaultAgentEvents = () => ({
  DataAgent:    { status: 'idle', result: null },
  AnalystAgent: { status: 'idle', result: null },
  NarratorAgent:{ status: 'idle', result: null },
  pinecone_fetch: null,
})

const useCopilotStore = create((set, get) => ({
  // Upload
  uploadStatus: 'idle',
  summary: null,

  // Chat
  messages: [],
  isStreaming: false,
  streamingText: '',

  // Agent pipeline
  agentEvents: defaultAgentEvents(),

  // UI
  activeTab: 'dashboard',
  queryHistory: [],

  // Actions
  setUploadStatus: (status) => set({ uploadStatus: status }),
  setSummary: (summary) => set({ summary, uploadStatus: 'ready' }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  resetAgentEvents: () => set({ agentEvents: defaultAgentEvents(), streamingText: '' }),

  updateAgentEvent: (agent, data) => set((state) => ({
    agentEvents: {
      ...state.agentEvents,
      [agent]: { ...state.agentEvents[agent], ...data },
    }
  })),

  setPinecone: (count) => set((state) => ({
    agentEvents: { ...state.agentEvents, pinecone_fetch: count }
  })),

  appendToken: (text) => set((state) => ({ streamingText: state.streamingText + text })),

  startStreaming: () => set({ isStreaming: true }),

  finalizeMessage: ({ answer, chart_instruction, recommendation, follow_ups }) => {
    const { messages, queryHistory } = get()
    const newMsg = {
      id: Date.now(),
      role: 'assistant',
      content: answer,
      chart: chart_instruction || null,
      recommendation: recommendation || null,
      follow_ups: follow_ups || [],
    }
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    set({
      messages: [...messages, newMsg],
      isStreaming: false,
      streamingText: '',
      queryHistory: lastUserMsg
        ? [...queryHistory, lastUserMsg.content].slice(-10)
        : queryHistory,
    })
  },

  addUserMessage: (content) => set((state) => ({
    messages: [...state.messages, { id: Date.now(), role: 'user', content }]
  })),

  setStreamingError: (msg) => set({ isStreaming: false, streamingText: '' }),
}))

export default useCopilotStore
