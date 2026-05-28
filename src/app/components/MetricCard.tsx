import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  trendContext?: string;
  trendClassName?: string;
  color?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  trendContext,
  trendClassName,
  color = '#10b981'
}: MetricCardProps) {
  const defaultTrendClass =
    trend === 'up'
      ? 'text-emerald-500 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-400 dark:text-zinc-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 relative overflow-hidden shadow-sm"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color }}>{value}</span>
            <span className="text-gray-400 dark:text-zinc-500 text-lg">{unit}</span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-800/50">
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-2 text-sm">
          <span className={trendClassName || defaultTrendClass}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
          {trendContext && <span className="text-gray-400 dark:text-zinc-500">{trendContext}</span>}
        </div>
      )}
    </motion.div>
  );
}
