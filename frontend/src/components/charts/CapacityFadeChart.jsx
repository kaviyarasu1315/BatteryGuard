import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { TrendingDown } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-300 mb-1">Cycle {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-[11px]">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value} Ah
        </p>
      ))}
    </div>
  )
}

export default function CapacityFadeChart({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-52 text-slate-600 text-sm">
      No data available
    </div>
  )

  // EOL reference at 80% of initial capacity
  const initial = data[0]?.capacity
  const eolLine = initial ? initial * 0.8 : null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown size={15} className="text-amber-500" />
        <span className="text-sm font-semibold text-slate-300">Capacity Fade</span>
        <span className="text-[11px] text-slate-600 ml-auto">vs. Cycle Number</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="cycle" tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          {eolLine && (
            <ReferenceLine y={eolLine} stroke="#f43f5e" strokeDasharray="4 4"
              label={{ value: 'EOL 80%', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
          )}
          <Area
            type="monotone" dataKey="capacity" name="Capacity"
            stroke="#f59e0b" strokeWidth={2}
            fill="url(#capGrad)" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
