import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface GyroscopeVisualizationProps {
  pitch: number;
  roll: number;
  yaw: number;
  title?: string;
}

export function GyroscopeVisualization({ pitch, roll, yaw, title = 'Body Movement Analysis' }: GyroscopeVisualizationProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [rotateZ, setRotateZ] = useState(0);

  useEffect(() => {
    setRotateX(pitch);
    setRotateY(roll);
    setRotateZ(yaw);
  }, [pitch, roll, yaw]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{title}</h3>

      <div className="flex flex-col items-center justify-center h-80">
        <div className="perspective-1000 mb-8">
          <motion.div
            className="w-40 h-40 relative"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateX: rotateX,
              rotateY: rotateY,
              rotateZ: rotateZ,
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          >
            {/* Front face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[#00809D]/30 to-[#00809D]/50 border-2 border-[#00809D]/60 rounded-lg flex items-center justify-center"
              style={{ transform: 'translateZ(80px)' }}>
              <span className="text-[#00809D] font-bold">FRONT</span>
            </div>

            {/* Back face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[#00809D]/20 to-[#00809D]/30 border-2 border-[#00809D]/40 rounded-lg flex items-center justify-center"
              style={{ transform: 'translateZ(-80px) rotateY(180deg)' }}>
              <span className="text-[#00809D]/70 font-bold">BACK</span>
            </div>

            {/* Top face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[#00809D]/25 to-[#00809D]/35 border-2 border-[#00809D]/50 rounded-lg"
              style={{ transform: 'rotateX(90deg) translateZ(80px)' }} />

            {/* Bottom face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[#00809D]/25 to-[#00809D]/35 border-2 border-[#00809D]/50 rounded-lg"
              style={{ transform: 'rotateX(-90deg) translateZ(80px)' }} />

            {/* Left face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[#00809D]/25 to-[#00809D]/35 border-2 border-[#00809D]/50 rounded-lg"
              style={{ transform: 'rotateY(-90deg) translateZ(80px)' }} />

            {/* Right face */}
            <div className="absolute w-full h-full bg-gradient-to-br from-[#00809D]/25 to-[#00809D]/35 border-2 border-[#00809D]/50 rounded-lg"
              style={{ transform: 'rotateY(90deg) translateZ(80px)' }} />
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-1">Pitch</p>
            <p className="text-[#00809D] text-xl font-bold">{pitch.toFixed(1)}°</p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-1">Roll</p>
            <p className="text-[#00809D] text-xl font-bold">{roll.toFixed(1)}°</p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-1">Yaw</p>
            <p className="text-[#00809D] text-xl font-bold">{yaw.toFixed(1)}°</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
