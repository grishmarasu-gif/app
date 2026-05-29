import React from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import ProGate from '../components/ProGate'

export default function LinkedInGrowth() {
  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 overflow-x-hidden" style={{ marginLeft: 240 }}>
        <TopBar title="LinkedIn Growth" />
        <main className="p-7 flex flex-col gap-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <ProGate featureName="LinkedIn Growth Engine" />
        </main>
      </div>
    </div>
  )
}
