import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Filter, ThermometerSun, Zap, Activity, TrendingDown, Cpu, ChevronDown } from 'lucide-react'
import AnomalyChart from '../components/charts/AnomalyChart'
import { fetchAnomalies, fetchAnomalyTimeline } from '../api/client'

const TYPE_ICONS = {
  temperature_spike: ThermometerSun,
  voltage_anomaly:   Zap,
  overvoltage:       Zap,
  undervoltage:      Zap,
  current_surge:     Activity,
  capacity_drop:     TrendingDown,
  resistance_spike:  Cpu,
}

const TYPE_COLORS = {
  temperature_spike: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  voltage_anomaly:   'text-orange-400 bg-orange-500/10 border-orange-500/20',
  overvoltage:       'text-red-400 bg-red-500/10 border-red-500/20',
  undervoltage:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
  current_surge:     'text-violet-400 bg-violet-500/10 border-violet-500/20',
  capacity_drop:     'text-pink-400 bg-pink-500/10 border-pink-500/20',
  resistance_spike:  'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

function AnomalyRow({ anomaly }) {
  const [open, setOpen] = useState(false)
  const Icon = TYPE_ICONS[anomaly.type] || AlertTriangle
  const colorClass = TYPE_COLORS[anomaly.type] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  const isCritical = anomaly.severity === 'critical'

  return (
    <motion.div
      className={`border rounded-xl overflow-hidden transition-all ${
        isCritical ? 'border-rose-500/30 bg-rose-500/4' : 'border-white/6 bg-white/2'
      }`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3.5 text-left cursor-pointer hover:bg-white/3 transition-colors"
      >
        <div className={`p-1.5 rounded-lg border ${colorClass}`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 capitalize">
            {anomaly.type.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{anomaly.message}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-600">Cycle {anomaly.cycle_number}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/15 text-amber-400'
          }`}>
            {anomaly.severity.toUpperCase()}
          </span>
          <ChevronDown size={12} className={`text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 px-4 py-3 text-[11px] text-slate-500 space-y-1"
          >
            <p><span className="text-slate-400">Value:</span> {anomaly.value?.toFixed(4)}</p>
            <p><span className="text-slate-400">Threshold:</span> {anomaly.threshold?.toFixed(4)}</p>
            <p><span className="text-slate-400">Timestamp:</span> {anomaly.timestamp}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Anomalies({ batteryId }) {
  const [data, setData]         = useState(null)
  const [timeline, setTimeline] = useState([])
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!batteryId) return
    setLoading(true)
    Promise.all([
      fetchAnomalies(batteryId),
      fetchAnomalyTimeline(batteryId),
    ])
    .then(([d, t]) => {
      setData(d)
      setTimeline(t.timeline || [])
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [batteryId])

  if (!batteryId) return (
    <div className="flex items-center justify-center h-64 text-slate-600">
      <div className="text-center">
        <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
        <p>Select a battery to view anomalies</p>
      </div>
    </div>
  )

  const anomalies = data?.anomalies || []
  const filtered  = filter === 'all' ? anomalies : anomalies.filter(a => a.severity === filter)
  const summary   = data?.summary || {}

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'All', value: 'all', count: summary.total,    color: 'slate' },
          { label: 'Critical', value: 'critical', count: summary.critical, color: 'rose' },
          { label: 'Warnings', value: 'warning',  count: summary.warnings, color: 'amber' },
        ].map(({ label, value, count, color }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
              filter === value
                ? `border-${color}-500/50 bg-${color}-500/15 text-${color}-400`
                : 'border-white/6 text-slate-500 hover:border-white/12 hover:text-slate-300'
            }`}>
            {label}
            <span className="text-xs font-bold">{count ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Timeline chart */}
      <div className="glass-card p-5">
        {loading ? <div className="shimmer h-52 rounded-xl" /> : <AnomalyChart anomalies={timeline} />}
      </div>

      {/* Anomaly list */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={13} className="text-slate-500" />
          <span className="text-xs text-slate-500">{filtered.length} anomalies</span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-sm">No anomalies to show</div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {filtered.map((a, i) => <AnomalyRow key={i} anomaly={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}
