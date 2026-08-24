import { motion } from 'framer-motion'
import { Battery, Zap, Thermometer, Activity, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'

const STATUS_CONFIG = {
  excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Excellent' },
  good:      { color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     label: 'Good' },
  fair:      { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   label: 'Fair' },
  poor:      { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  label: 'Poor' },
  critical:  { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    label: 'Critical' },
}

function HealthBar({ score }) {
  const color = score >= 90 ? '#10b981' : score >= 80 ? '#38bdf8' : score >= 70 ? '#f59e0b' : score >= 60 ? '#f97316' : '#f43f5e'
  return (
    <div className="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden mt-2">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}50` }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  )
}

export default function BatteryCard({ battery, isSelected, onClick }) {
  const cfg = STATUS_CONFIG[battery.status] || STATUS_CONFIG.fair
  const hasAlerts = battery.critical_count > 0

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'border-amber-500/50 bg-amber-500/8'
          : 'border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/5'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Selected glow */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.4), 0 0 20px rgba(245,158,11,0.08)' }} />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.border} border`}>
            <Battery size={14} className={cfg.color} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-tight">{battery.id}</p>
            <p className="text-[11px] text-slate-500">Cycle {battery.cycle_count}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold ${cfg.color}`}>{battery.health_score.toFixed(1)}%</span>
          {hasAlerts && (
            <span className="blink-critical">
              <AlertTriangle size={11} className="text-rose-400" />
            </span>
          )}
        </div>
      </div>

      <HealthBar score={battery.health_score} />

      <div className="flex justify-between mt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Zap size={10} className="text-amber-500" />
          {battery.soc?.toFixed(1)}% SoC
        </span>
        <span className={`flex items-center gap-1 ${hasAlerts ? 'text-rose-400' : 'text-slate-600'}`}>
          <AlertTriangle size={10} />
          {battery.anomaly_count} alerts
        </span>
      </div>
    </motion.button>
  )
}
