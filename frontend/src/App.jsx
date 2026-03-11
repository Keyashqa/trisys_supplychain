import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import ChatPanel from './components/chat/ChatPanel'
import useCopilotStore from './store/useCopilotStore'

export default function App() {
  const activeTab = useCopilotStore(s => s.activeTab)

  return (
    <Layout>
      <div className="h-full">
        {activeTab === 'dashboard' ? <Dashboard /> : <ChatPanel />}
      </div>
    </Layout>
  )
}
