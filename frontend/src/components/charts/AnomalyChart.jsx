import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { AlertTriangle } from 'lucide-react'

const TYPE_COLORS = {
  temperature_spike: '#f43f5e',
  voltage_anomaly:   '#f97316',
  overvoltage:       '#ef4444',
  undervoltage:      '#f59e0b',
  current_surge:     '#a855f7',
  capacity_drop:     '#ec4899',
  resistance_spike:  '#6366f1',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const color = TYPE_COLORS[d.type] || '#94a3b8'
  return (
    <div className="custom-tooltip max-w-56">
      <p className="font-semibold mb-1" style={{ color }}>Cycle {d.cycle}</p>
      <p className="text-[11px] text-slate-400 capitalize">{d.type?.replace(/_/g, ' ')}</p>
      <p className="text-[11px] text-slate-300 mt-0.5">{d.message}</p>
      <p className={`text-[11px] font-semibold mt-1 ${d.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
        ⚠ {d.severity?.toUpperCase()}
      </p>
    </div>
  )
}

// Y-axis encodes anomaly type for scatter positioning
const TYPE_Y = {
  temperature_spike: 6,
  voltage_anomaly:   5,
  overvoltage:       4,
  undervoltage:      3,
  current_surge:     2,
  capacity_drop:     1,
  resistance_spike:  0,
}
const TYPE_LABELS = Object.keys(TYPE_Y).map(t => ({
  value: TYPE_Y[t],
  label: t.replace(/_/g, ' '),
}))

export default function AnomalyChart({ anomalies = [] }) {
  const data = anomalies.map(a => ({
    ...a,
    y: TYPE_Y[a.type] ?? 0,
    cycle: a.cycle_number ?? a.cycle,
  }))

  if (!data.length) return (
    <div className="flex items-center justify-center h-52 text-slate-600 text-sm">
      <div className="text-center">
        <AlertTriangle size={24} className="mx-auto mb-2 opacity-20" />
        No anomalies detected
      </div>
    </div>
  )

  const criticals = data.filter(d => d.severity === 'critical')
  const warnings  = data.filter(d => d.severity === 'warning')

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={15} className="text-rose-400" />
        <span className="text-sm font-semibold text-slate-300">Anomaly Timeline</span>
        <div className="ml-auto flex gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> {criticals.length} critical
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {warnings.length} warnings
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="cycle" name="Cycle" tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} label={{ value: 'Cycle', fill: '#475569', fontSize: 9, position: 'insideBottom', offset: -2 }} />
          <YAxis dataKey="y" name="Type" tick={false} axisLine={false} tickLine={false}
            domain={[-0.5, 6.5]} />
          <Tooltip content={<CustomTooltip />} />
          {TYPE_LABELS.map(({ value, label }) => (
            <ReferenceLine key={label} y={value} stroke="rgba(255,255,255,0.05)"
              label={{ value: label, fill: '#334155', fontSize: 9, position: 'insideLeft' }} />
          ))}
          <Scatter data={data} shape="circle">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={TYPE_COLORS[entry.type] || '#94a3b8'}
                opacity={entry.severity === 'critical' ? 1 : 0.65}
                r={entry.severity === 'critical' ? 7 : 5}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
