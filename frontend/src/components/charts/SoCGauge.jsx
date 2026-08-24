import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function SoCGauge({ soc = 0, health = 0 }) {
  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (soc / 100) * circumference

  const color = soc > 60 ? '#10b981' : soc > 30 ? '#f59e0b' : '#f43f5e'
  const healthColor = health >= 80 ? '#10b981' : health >= 60 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={15} className="text-amber-500" />
        <span className="text-sm font-semibold text-slate-300">State of Charge</span>
      </div>
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          {/* Background circle */}
          <circle
            stroke="rgba(255,255,255,0.06)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, strokeLinecap: 'round' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            filter={`drop-shadow(0 0 8px ${color})`}
          />
        </svg>
        {/* Center text */}
        <div className="absolute flex flex-col items-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {soc.toFixed(0)}%
          </motion.span>
          <span className="text-[10px] text-slate-600 uppercase tracking-wider">SoC</span>
        </div>
      </div>

      {/* Health score below gauge */}
      <div className="mt-4 text-center">
        <div className="text-xs text-slate-500 mb-1">Battery Health</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: healthColor, boxShadow: `0 0 8px ${healthColor}60` }}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </div>
          <span className="text-sm font-bold" style={{ color: healthColor }}>
            {health.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
