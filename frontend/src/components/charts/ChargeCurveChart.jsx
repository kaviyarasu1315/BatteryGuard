import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { Activity } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-300 mb-1">t = {label}h</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-[11px]">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
          {p.name === 'voltage' ? ' V' : p.name === 'current' ? ' A' : '%'}
        </p>
      ))}
    </div>
  )
}

export default function ChargeCurveChart({ chargeData = [], dischargeData = [], cycleNumber }) {
  const [mode, setMode] = useState('charge')

  const data = mode === 'charge' ? chargeData : dischargeData

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={15} className="text-emerald-400" />
        <span className="text-sm font-semibold text-slate-300">
          Charge/Discharge Curves
          {cycleNumber && <span className="text-slate-500 text-xs ml-1">— Cycle {cycleNumber}</span>}
        </span>
        <div className="ml-auto flex gap-1">
          {['charge', 'discharge'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`text-[11px] px-2.5 py-1 rounded-lg capitalize transition-all ${
                mode === m ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600 hover:text-slate-400'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false}
            label={{ value: 'Time (h)', fill: '#475569', fontSize: 9, position: 'insideBottom', offset: -2 }} />
          <YAxis yAxisId="v" tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} domain={[2.8, 4.3]} />
          <YAxis yAxisId="i" orientation="right" tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line yAxisId="v" type="monotone" dataKey="voltage" name="voltage"
            stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line yAxisId="i" type="monotone" dataKey="current" name="current"
            stroke="#38bdf8" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Need to import useState
import { useState } from 'react'
