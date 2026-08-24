import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Battery, Zap, RefreshCw, Wifi, WifiOff, ChevronRight, BookOpen } from 'lucide-react'
import BatteryCard from './BatteryCard'
import { fetchBatteries, healthCheck, fetchKnowledgeStatus, ingestKnowledge } from '../api/client'

export default function Sidebar({ selectedBattery, onSelectBattery }) {
  const [batteries, setBatteries] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [kbStatus, setKbStatus] = useState(null)
  const [ingesting, setIngesting] = useState(false)

  const loadBatteries = async () => {
    setLoading(true)
    try {
      await healthCheck()
      setApiOnline(true)
      const data = await fetchBatteries()
      setBatteries(data)
      if (!selectedBattery && data.length > 0) onSelectBattery(data[0].id)
    } catch {
      setApiOnline(false)
    } finally {
      setLoading(false)
    }
  }

  const loadKbStatus = async () => {
    try {
      const s = await fetchKnowledgeStatus()
      setKbStatus(s)
    } catch { }
  }

  const handleIngest = async () => {
    setIngesting(true)
    try {
      await ingestKnowledge()
      await loadKbStatus()
    } catch (e) {
      console.error('Ingestion failed:', e)
    } finally {
      setIngesting(false)
    }
  }

  useEffect(() => {
    loadBatteries()
    loadKbStatus()
  }, [])

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-white/5 bg-navy-900/60 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}>
              <Battery size={18} className="text-navy-900" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-navy-900" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">BatteryGuard</h1>
            <p className="text-[10px] text-slate-500 font-medium">AI Health Assistant</p>
          </div>
        </div>
      </div>

      {/* API status */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <div className={`flex items-center gap-2 text-[11px] font-medium ${apiOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
          {apiOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          {apiOnline ? 'API Connected' : 'API Offline'}
          <button onClick={loadBatteries} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors">
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Battery list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1 mb-2">
          Battery Units ({batteries.length})
        </p>

        <AnimatePresence>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer h-20 rounded-xl" />
            ))
          ) : batteries.length === 0 ? (
            <div className="text-center text-slate-600 text-xs py-8">
              <Battery size={24} className="mx-auto mb-2 opacity-30" />
              No batteries found.<br />Start the backend server.
            </div>
          ) : (
            batteries.map((bat) => (
              <motion.div key={bat.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}>
                <BatteryCard
                  battery={bat}
                  isSelected={selectedBattery === bat.id}
                  onClick={() => onSelectBattery(bat.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Knowledge Base status */}
      <div className="p-3 border-t border-white/5">
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={12} className="text-amber-500" />
            <span className="text-[11px] font-semibold text-slate-400">Knowledge Base</span>
          </div>
          {kbStatus ? (
            <div className="text-[11px] text-slate-500 mb-2">
              {kbStatus.status === 'ready'
                ? `✓ ${kbStatus.chunk_count} chunks loaded`
                : '○ Not yet ingested'}
            </div>
          ) : null}
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="w-full text-[11px] py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20
                       text-amber-400 hover:bg-amber-500/20 transition-all duration-200 font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {ingesting ? <><RefreshCw size={10} className="animate-spin" /> Ingesting…</> : 'Ingest Docs'}
          </button>
        </div>
      </div>
    </aside>
  )
}
