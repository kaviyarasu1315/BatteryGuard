import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Activity, AlertTriangle, Bot, RefreshCw } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Analysis from './pages/Analysis'
import Anomalies from './pages/Anomalies'
import Assistant from './pages/Assistant'

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'analysis',  label: 'Analysis',  icon: Activity },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'LLaMA 3.1' },
]

export default function App() {
  const [selectedBattery, setSelectedBattery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        selectedBattery={selectedBattery}
        onSelectBattery={setSelectedBattery}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top header navbar */}
        <header className="h-16 shrink-0 border-b border-white/5 bg-navy-900/40 backdrop-blur-xl px-6 flex items-center justify-between">
          {/* Battery ID indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Active Unit:</span>
            {selectedBattery ? (
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm tracking-wide">
                {selectedBattery}
              </span>
            ) : (
              <span className="text-xs text-slate-600 italic">Select battery from sidebar</span>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-white/3 p-1 rounded-xl border border-white/5">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn flex items-center gap-2 relative ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 rounded-lg bg-amber-500/10 border border-amber-500/20 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </header>

        {/* View content container */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedBattery}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'overview' && <Overview batteryId={selectedBattery} />}
              {activeTab === 'analysis' && <Analysis batteryId={selectedBattery} />}
              {activeTab === 'anomalies' && <Anomalies batteryId={selectedBattery} />}
              {activeTab === 'assistant' && <Assistant batteryId={selectedBattery} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
