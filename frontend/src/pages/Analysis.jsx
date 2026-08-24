import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Layers } from 'lucide-react'
import ChargeCurveChart from '../components/charts/ChargeCurveChart'
import CapacityFadeChart from '../components/charts/CapacityFadeChart'
import InternalResistanceChart from '../components/charts/InternalResistanceChart'
import { fetchChargeCurves, fetchTrends } from '../api/client'

export default function Analysis({ batteryId }) {
  const [curves, setCurves]   = useState(null)
  const [trends, setTrends]   = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState(null)

  useEffect(() => {
    if (!batteryId) return
    setLoading(true)
    Promise.all([
      fetchChargeCurves(batteryId, selectedCycle),
      fetchTrends(batteryId),
    ])
    .then(([c, t]) => {
      setCurves(c)
      setTrends(t.trends || [])
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [batteryId, selectedCycle])

  if (!batteryId) return (
    <div className="flex items-center justify-center h-64 text-slate-600">
      <div className="text-center">
        <Activity size={40} className="mx-auto mb-3 opacity-20" />
        <p>Select a battery to view analysis</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Charge curves */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Activity size={15} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Charge / Discharge Curves</h2>
            <p className="text-[11px] text-slate-600">Voltage & current profile for the selected cycle</p>
          </div>
        </div>
        {loading ? (
          <div className="shimmer h-52 rounded-xl mt-4" />
        ) : curves ? (
          <ChargeCurveChart
            chargeData={curves.charge}
            dischargeData={curves.discharge}
            cycleNumber={curves.cycle_number}
          />
        ) : null}
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          {loading ? <div className="shimmer h-52 rounded-xl" /> : <CapacityFadeChart data={trends} />}
        </div>
        <div className="glass-card p-5">
          {loading ? <div className="shimmer h-52 rounded-xl" /> : <InternalResistanceChart data={trends} />}
        </div>
      </div>

      {/* Coulombic efficiency */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-300">Coulombic Efficiency Trend</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          {trends.length > 0 && (
            <div className="flex h-full gap-px">
              {trends.slice(-50).map((t, i) => {
                const eff = t.coulombic_efficiency
                const color = eff > 99.5 ? '#10b981' : eff > 99 ? '#f59e0b' : '#f43f5e'
                return <div key={i} className="flex-1 rounded-sm" style={{ background: color, opacity: 0.7 + (eff - 98) / 30 }} />
              })}
            </div>
          )}
        </div>
        <div className="flex justify-between text-[11px] text-slate-600 mt-1">
          <span>Last 50 cycles</span>
          <span>Latest: {trends[trends.length - 1]?.coulombic_efficiency?.toFixed(3) ?? '—'}%</span>
        </div>
      </div>
    </div>
  )
}
