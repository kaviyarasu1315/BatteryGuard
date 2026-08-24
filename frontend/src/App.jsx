import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Activity, AlertTriangle, Bot, Menu, X } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Analysis from './pages/Analysis'
import Anomalies from './pages/Anomalies'
import Assistant from './pages/Assistant'

const TABS = [
  { id: 'overview',  label: 'Overview',     icon: LayoutDashboard },
  { id: 'analysis',  label: 'Analysis',     icon: Activity },
  { id: 'anomalies', label: 'Anomalies',    icon: AlertTriangle },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'LLaMA 3.1' },
]

export default function App() {
  const [selectedBattery, setSelectedBattery] = useState('')
  const [activeTab, setActiveTab]             = useState('overview')
  const [sidebarOpen, setSidebarOpen]         = useState(false)

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close sidebar when tab changes on mobile
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-900 text-slate-100">

      {/* ── Mobile backdrop ──────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (desktop: static | mobile: drawer) ───────────── */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          selectedBattery={selectedBattery}
          onSelectBattery={(id) => { setSelectedBattery(id); setSidebarOpen(false) }}
          onClose={() => setSidebarOpen(false)}
          isMobileOpen={sidebarOpen}
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-14 md:h-16 shrink-0 border-b border-white/5 bg-navy-900/40 backdrop-blur-xl px-3 md:px-6 flex items-center gap-3">

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Active battery indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-500 font-medium hidden sm:block shrink-0">Active:</span>
            {selectedBattery ? (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs tracking-wide truncate">
                {selectedBattery}
              </span>
            ) : (
              <span className="text-xs text-slate-600 italic truncate">Select battery</span>
            )}
          </div>

          {/* Tab Navigation — scrollable on mobile */}
          <nav className="flex-1 flex justify-end overflow-hidden">
            <div className="flex items-center gap-0.5 bg-white/3 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`tab-btn flex items-center gap-1.5 relative shrink-0 px-2.5 py-1.5 md:px-4 md:py-2 ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:block">{tab.label}</span>
                    {tab.badge && (
                      <span className="hidden md:block text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
            </div>
          </nav>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedBattery}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'overview'  && <Overview  batteryId={selectedBattery} />}
              {activeTab === 'analysis'  && <Analysis  batteryId={selectedBattery} />}
              {activeTab === 'anomalies' && <Anomalies batteryId={selectedBattery} />}
              {activeTab === 'assistant' && <Assistant batteryId={selectedBattery} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
