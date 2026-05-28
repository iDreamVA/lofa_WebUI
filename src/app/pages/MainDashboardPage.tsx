import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export function MainDashboardPage() {
  const { t, userData, bmi } = useApp();
  const navigate = useNavigate();

  if (!userData || !bmi) {
    navigate('/');
    return null;
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: t.bmi.underweight, color: '#3b82f6' };
    if (bmi < 25) return { label: t.bmi.normal, color: '#00809D' };
    if (bmi < 30) return { label: t.bmi.overweight, color: '#FF7601' };
    return { label: t.bmi.obese, color: '#ef4444' };
  };

  const category = getBMICategory(bmi);

  const getBMIPercentage = (bmi: number) => {
    const min = 15;
    const max = 40;
    return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
  };

  // Mock weight history data
  const weightHistory = [
    { day: 'Mon', weight: userData.weight + 2 },
    { day: 'Tue', weight: userData.weight + 1.5 },
    { day: 'Wed', weight: userData.weight + 1 },
    { day: 'Thu', weight: userData.weight + 0.5 },
    { day: 'Fri', weight: userData.weight + 0.2 },
    { day: 'Sat', weight: userData.weight - 0.1 },
    { day: 'Sun', weight: userData.weight },
  ];

  // Mock posture data
  const postureAreas = [
    { area: 'Neck', status: 'normal', icon: CheckCircle2, color: '#00809D' },
    { area: 'Upper Back', status: 'warning', icon: AlertCircle, color: '#FF7601' },
    { area: 'Lower Back', status: 'normal', icon: CheckCircle2, color: '#00809D' },
    { area: 'Shoulders', status: 'normal', icon: CheckCircle2, color: '#00809D' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - User Welcome */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 bg-white rounded-2xl p-4 md:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Hello {userData.name || 'User'} 👋
              </h1>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                {t.onboarding.height}: {userData.height}{t.onboarding.cm} • {t.onboarding.weight}: {userData.weight}
                {t.onboarding.kg} • {t.onboarding.age}: {userData.age} {t.onboarding.years}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00809D] to-[#FF7601] rounded-full text-white font-bold">
              {userData.name?.charAt(0) || 'U'}
            </div>
          </div>
        </motion.header>

        {/* Main Grid - BMI and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* BMI Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">{t.bmi.title}</h3>

            <div className="text-center mb-6">
              <div className="text-5xl md:text-6xl font-bold mb-2" style={{ color: category.color }}>
                {bmi}
              </div>
              <div className="text-base md:text-lg text-gray-600 mb-4">
                {t.bmi.category}: <span style={{ color: category.color }} className="font-semibold">{category.label}</span>
              </div>
            </div>

            {/* BMI Scale */}
            <div className="relative h-6 md:h-8 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3b82f6] via-[#00809D] via-[#FF7601] to-[#ef4444] rounded-full"
                style={{ width: '100%' }}
              />
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: `${getBMIPercentage(bmi)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 md:w-1 h-8 md:h-10 bg-white shadow-lg"
                style={{ marginLeft: '-2px' }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{t.bmi.underweight}</span>
              <span>{t.bmi.normal}</span>
              <span>{t.bmi.overweight}</span>
              <span>{t.bmi.obese}</span>
            </div>
          </motion.div>

          {/* Posture Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">{t.posture.title}</h3>

            <div className="space-y-3">
              {postureAreas.map((area, index) => {
                const Icon = area.icon;
                return (
                  <motion.div
                    key={area.area}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" style={{ color: area.color }} />
                      <span className="font-medium text-gray-700 text-sm md:text-base">{area.area}</span>
                    </div>
                    <span
                      className="text-xs md:text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${area.color}20`,
                        color: area.color,
                      }}
                    >
                      {area.status === 'normal' ? t.posture.normal : t.posture.warning}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Weight History Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">{t.history.weightTrend}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingDown className="w-4 h-4 text-[#00809D]" />
              <span>{t.history.lastWeek}</span>
            </div>
          </div>

          <div className="w-full h-64 md:h-80 overflow-x-auto">
            <ResponsiveContainer width="100%" height={320} minWidth={300}>
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  domain={[userData.weight - 3, userData.weight + 3]}
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
                  dataKey="weight"
                  stroke="#00809D"
                  strokeWidth={3}
                  dot={{ fill: '#00809D', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
