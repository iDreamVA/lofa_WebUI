import { useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

interface ActivityChartProps {
  data: Array<{ time: string; x: number; y: number; z: number }>;
  title?: string;
}

export function ActivityChart({ data, title = 'Movement Intensity' }: ActivityChartProps) {
  const gradientIdX = useId();
  const gradientIdY = useId();
  const gradientIdZ = useId();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <motion.div
      key="activity-chart-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientIdX} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00809D" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00809D" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id={gradientIdY} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F3A26D" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#F3A26D" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id={gradientIdZ} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF7601" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FF7601" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e5e7eb'} />
          <XAxis
            dataKey="time"
            stroke={isDark ? '#71717a' : '#9ca3af'}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={isDark ? '#71717a' : '#9ca3af'}
            style={{ fontSize: '12px' }}
            domain={[-2, 2]}
            ticks={[-2, -1, 0, 1, 2]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#18181b' : '#fff',
              border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
            }}
          />
          <Area
            type="monotone"
            dataKey="x"
            stroke="#00809D"
            fillOpacity={1}
            fill={`url(#${gradientIdX})`}
            strokeWidth={2}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke="#F3A26D"
            fillOpacity={1}
            fill={`url(#${gradientIdY})`}
            strokeWidth={2}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="z"
            stroke="#FF7601"
            fillOpacity={1}
            fill={`url(#${gradientIdZ})`}
            strokeWidth={2}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00809D' }} />
          <span className="text-gray-500 dark:text-zinc-400 text-sm">X-Axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F3A26D' }} />
          <span className="text-gray-500 dark:text-zinc-400 text-sm">Y-Axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF7601' }} />
          <span className="text-gray-500 dark:text-zinc-400 text-sm">Z-Axis</span>
        </div>
      </div>
    </motion.div>
  );
}
