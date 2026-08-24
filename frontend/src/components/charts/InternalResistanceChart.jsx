import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Cpu } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-300 mb-1">Cycle {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-[11px]">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value} mΩ
        </p>
      ))}
    </div>
  )
}

export default function InternalResistanceChart({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-52 text-slate-600 text-sm">
      No data available
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={15} className="text-sky-400" />
        <span className="text-sm font-semibold text-slate-300">Internal Resistance Growth</span>
        <span className="text-[11px] text-slate-600 ml-auto">mΩ</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.30} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="cycle" tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="internal_resistance" name="Resistance"
            stroke="#38bdf8" strokeWidth={2}
            fill="url(#resGrad)" dot={false} activeDot={{ r: 4, fill: '#38bdf8' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
