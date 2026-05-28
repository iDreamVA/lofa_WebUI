import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

interface TemperatureChartProps {
  data: Array<{ time: string; temp: number }>;
  title?: string;
}

export function TemperatureChart({ data, title = 'Body Temperature' }: TemperatureChartProps) {
  return (
    <motion.div
      key="temperature-chart-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            domain={[35, 39]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#111',
            }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#FF7601"
            strokeWidth={3}
            dot={{ fill: '#FF7601', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
