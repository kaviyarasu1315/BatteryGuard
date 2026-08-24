import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Battery, Zap, Thermometer, Cpu, TrendingDown, Activity,
  AlertTriangle, Shield, Clock, BarChart3
} from 'lucide-react'
import SoCGauge from '../components/charts/SoCGauge'
import CapacityFadeChart from '../components/charts/CapacityFadeChart'
import InternalResistanceChart from '../components/charts/InternalResistanceChart'
import { fetchBatterySummary, fetchTrends, analyzeBattery } from '../api/client'

function MetricCard({ icon: Icon, label, value, unit, sub, color = 'amber' }) {
  const colors = {
    amber:   'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    sky:     'text-sky-400 bg-sky-500/10',
    rose:    'text-rose-400 bg-rose-500/10',
    violet:  'text-violet-400 bg-violet-500/10',
  }
  return (
    <motion.div className="metric-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={15} />
      </div>
      <p className="text-[11px] text-slate-500 mt-2">{label}</p>
      <p className="text-xl font-bold text-slate-100">
        {value ?? '—'}<span className="text-sm text-slate-500 font-normal ml-1">{unit}</span>
      </p>
      {sub && <p className="text-[11px] text-slate-600">{sub}</p>}
    </motion.div>
  )
}

export default function Overview({ batteryId }) {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends]   = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!batteryId) return
    setLoading(true)
    Promise.all([
      fetchBatterySummary(batteryId),
      fetchTrends(batteryId),
      analyzeBattery(batteryId),
    ])
    .then(([s, t, a]) => {
      setSummary(s)
      setTrends(t.trends || [])
      setAnalysis(a.analysis)
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [batteryId])

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="shimmer h-28 rounded-2xl" />
      ))}
    </div>
  )

  if (!summary) return (
    <div className="flex items-center justify-center h-64 text-slate-600">
      <div className="text-center">
        <Battery size={40} className="mx-auto mb-3 opacity-20" />
        <p>Select a battery to view its overview</p>
      </div>
    </div>
  )

  const STATUS_LABELS = {
    excellent: '🟢 Excellent', good: '🔵 Good', fair: '🟡 Fair',
    poor: '🟠 Poor', critical: '🔴 Critical',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Zap} label="State of Charge" value={summary.soc?.toFixed(1)} unit="%" color="amber" />
        <MetricCard icon={Battery} label="Health Score" value={summary.health_score?.toFixed(1)} unit="%" color="emerald"
          sub={STATUS_LABELS[summary.status]} />
        <MetricCard icon={TrendingDown} label="Capacity" value={summary.capacity?.toFixed(3)} unit="Ah" color="sky"
          sub={`${summary.capacity_retention?.toFixed(1)}% retained`} />
        <MetricCard icon={Cpu} label="Internal Resistance" value={summary.internal_resistance?.toFixed(1)} unit="mΩ" color="violet"
          sub={`+${summary.resistance_growth_pct?.toFixed(1)}% from baseline`} />
        <MetricCard icon={Thermometer} label="Avg Temperature" value={summary.avg_temperature?.toFixed(1)} unit="°C" color="rose" />
        <MetricCard icon={Clock} label="Cycle Count" value={summary.cycle_count} unit="" color="amber" />
        <MetricCard icon={Activity} label="Coulombic Efficiency" value={summary.coulombic_efficiency?.toFixed(2)} unit="%" color="emerald" />
        <MetricCard icon={Shield} label="Anomalies" value={summary.anomaly_summary?.total} unit=""
          color={summary.anomaly_summary?.critical > 0 ? 'rose' : 'amber'}
          sub={`${summary.anomaly_summary?.critical ?? 0} critical`} />
      </div>

      {/* SoC Gauge + Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <SoCGauge soc={summary.soc ?? 0} health={summary.health_score ?? 0} />
        </div>

        <div className="glass-card p-5 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-300">Degradation Analysis</span>
          </div>
          {analysis && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-slate-600 mb-0.5">Initial Capacity</p>
                  <p className="font-semibold text-slate-200">{analysis.capacity_fade.initial_capacity.toFixed(4)} Ah</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 mb-0.5">Total Capacity Fade</p>
                  <p className="font-semibold text-amber-400">{analysis.capacity_fade.total_fade_pct.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 mb-0.5">Fade Rate / 100 Cycles</p>
                  <p className="font-semibold text-slate-200">{(analysis.capacity_fade.degradation_rate_per_100_cycles * 1000).toFixed(1)} mAh</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-slate-600 mb-0.5">Predicted EOL Cycles</p>
                  <p className="font-semibold text-emerald-400">+{analysis.capacity_fade.predicted_eol_cycles} cycles</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 mb-0.5">Max Temperature</p>
                  <p className={`font-semibold ${analysis.temperature.max_c > 45 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {analysis.temperature.max_c.toFixed(1)}°C
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 mb-0.5">Resistance Growth</p>
                  <p className="font-semibold text-sky-400">{analysis.resistance.growth_pct.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <CapacityFadeChart data={trends} />
        </div>
        <div className="glass-card p-5">
          <InternalResistanceChart data={trends} />
        </div>
      </div>
    </div>
  )
}
