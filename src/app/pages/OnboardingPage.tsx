import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Ruler, Weight, Cake } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function OnboardingPage() {
  const { t, setUserData, userData } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(userData?.name || '');
  const [height, setHeight] = useState(userData?.height || 170);
  const [weight, setWeight] = useState(userData?.weight || 70);
  const [age, setAge] = useState(userData?.age || 25);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(userData?.gender || 'male');

  const handleCalculate = () => {
    setUserData({ name: name || 'User', height, weight, age, gender });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] p-4 md:p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block p-4 bg-gradient-to-br from-[#51553a] to-[#7a8a45] rounded-full mb-6"
          >
            <User className="w-8 md:w-12 h-8 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-[#51553a] via-[#7a8a45] to-[#a0b868] bg-clip-text text-transparent">
            {t.onboarding.title}
          </h1>
          <p className="text-gray-600 text-base md:text-lg">{t.onboarding.subtitle}</p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-lg space-y-6 md:space-y-8"
        >
          {/* Name Input */}
          <div>
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-3">
              {t.onboarding.yourName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.onboarding.namePlaceholder}
              className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51553a] focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Height Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-[#51553a]" />
                <label className="text-base md:text-lg font-semibold text-gray-900">{t.onboarding.height}</label>
              </div>
              <div className="flex items-center gap-1 text-xl md:text-2xl font-bold text-[#51553a]">
                <input
                  type="number"
                  min="100"
                  max="220"
                  value={height}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 100 && v <= 220) setHeight(v);
                  }}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v < 100) setHeight(100);
                    else if (v > 220) setHeight(220);
                  }}
                  className="w-20 md:w-24 text-right bg-transparent border-b-2 border-transparent focus:border-[#51553a] outline-none font-bold text-[#51553a] text-xl md:text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>{t.onboarding.cm}</span>
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#51553a]"
            />
            <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
              <span>100 {t.onboarding.cm}</span>
              <span>220 {t.onboarding.cm}</span>
            </div>
          </div>

          {/* Weight Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Weight className="w-5 h-5 text-[#7a8a45]" />
                <label className="text-base md:text-lg font-semibold text-gray-900">{t.onboarding.weight}</label>
              </div>
              <div className="flex items-center gap-1 text-xl md:text-2xl font-bold text-[#7a8a45]">
                <input
                  type="number"
                  min="30"
                  max="150"
                  value={weight}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 30 && v <= 150) setWeight(v);
                  }}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v < 30) setWeight(30);
                    else if (v > 150) setWeight(150);
                  }}
                  className="w-20 md:w-24 text-right bg-transparent border-b-2 border-transparent focus:border-[#7a8a45] outline-none font-bold text-[#7a8a45] text-xl md:text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>{t.onboarding.kg}</span>
              </div>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7a8a45]"
            />
            <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
              <span>30 {t.onboarding.kg}</span>
              <span>150 {t.onboarding.kg}</span>
            </div>
          </div>

          {/* Age Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cake className="w-5 h-5 text-[#a0b868]" />
                <label className="text-base md:text-lg font-semibold text-gray-900">{t.onboarding.age}</label>
              </div>
              <div className="flex items-center gap-1 text-xl md:text-2xl font-bold text-[#a0b868]">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 10 && v <= 100) setAge(v);
                  }}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v < 10) setAge(10);
                    else if (v > 100) setAge(100);
                  }}
                  className="w-20 md:w-24 text-right bg-transparent border-b-2 border-transparent focus:border-[#a0b868] outline-none font-bold text-[#a0b868] text-xl md:text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>{t.onboarding.years}</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#a0b868]"
            />
            <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
              <span>10 {t.onboarding.years}</span>
              <span>100 {t.onboarding.years}</span>
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-base md:text-lg font-semibold text-gray-900 mb-4">{t.onboarding.gender}</label>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-3 px-3 md:px-4 rounded-lg border-2 font-medium transition-all text-sm md:text-base ${
                    gender === g
                      ? 'bg-[#51553a]/20 border-[#51553a] text-[#51553a]'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {t.onboarding[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCalculate}
            className="w-full py-3 md:py-4 bg-gradient-to-r from-[#51553a] to-[#7a8a45] text-white font-bold text-base md:text-lg rounded-xl hover:shadow-lg hover:shadow-[#51553a]/20 transition-all"
          >
            {t.onboarding.calculate}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
