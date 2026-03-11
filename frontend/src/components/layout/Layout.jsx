import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import useCopilotStore from '../../store/useCopilotStore'

export default function Layout({ children }) {
  const activeTab = useCopilotStore(s => s.activeTab)
  const setActiveTab = useCopilotStore(s => s.setActiveTab)

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
