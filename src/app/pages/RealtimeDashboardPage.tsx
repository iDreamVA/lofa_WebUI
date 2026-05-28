import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Droplets, Radio, Activity } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { TemperatureChart } from '../components/TemperatureChart';
import { GyroscopeVisualization } from '../components/GyroscopeVisualization';
import { ActivityChart } from '../components/ActivityChart';
import { useApp } from '../context/AppContext';

const MQTT_BRIDGE_URL =
  import.meta.env.VITE_MQTT_BRIDGE_URL || 'ws://localhost:8080/stream';
const HISTORY_LIMIT = 200;

type MovementPayload = {
  x?: number;
  y?: number;
  z?: number;
  roll?: number;
  pitch?: number;
  yaw?: number;
  ts?: number;
};

type ThermoPayload = {
  temperature?: number;
  humidity?: number;
  ts?: number;
};

type BridgePacket =
  | {
      type: 'status';
      connected?: boolean;
      has_movement?: boolean;
      has_thermo?: boolean;
      message?: string;
    }
  | {
      type: 'sensor';
      topic?: string;
      payload?: MovementPayload & ThermoPayload;
    };

export function RealtimeDashboardPage() {
  const { t, connectedSensors, connectedSensorTypes } = useApp();
  const navigate = useNavigate();

  const wantsTemp = connectedSensorTypes.includes('temperature');
  const wantsHumidity = connectedSensorTypes.includes('humidity');
  const wantsGyro = connectedSensorTypes.includes('gyroscope');
  const hasAnySelectedSensor = connectedSensors.length > 0;

  const [connectionText, setConnectionText] = useState('Connecting to MQTT bridge...');
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [movementReady, setMovementReady] = useState(false);
  const [thermoReady, setThermoReady] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentHumidity, setCurrentHumidity] = useState(0);
  const [gyroData, setGyroData] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [tempData, setTempData] = useState<Array<{ id: string; time: string; temp: number }>>([]);
  const [activityData, setActivityData] = useState<
    Array<{ id: string; time: string; x: number; y: number; z: number }>
  >([]);

  useEffect(() => {
    const socket = new WebSocket(MQTT_BRIDGE_URL);

    socket.addEventListener('open', () => {
      setConnectionText('LIVE');
    });

    socket.addEventListener('close', () => {
      setBridgeConnected(false);
      setConnectionText('MQTT bridge disconnected');
    });

    socket.addEventListener('error', () => {
      setBridgeConnected(false);
      setConnectionText('Cannot reach MQTT bridge');
    });

    socket.addEventListener('message', (event) => {
      const packet = JSON.parse(event.data) as BridgePacket;

      if (packet.type === 'status') {
        setBridgeConnected(Boolean(packet.connected));
        setMovementReady(Boolean(packet.has_movement));
        setThermoReady(Boolean(packet.has_thermo));
        setConnectionText(packet.message || 'Status update');
        return;
      }

      if (packet.type !== 'sensor' || !packet.topic || !packet.payload) {
        return;
      }

      if (packet.topic === 'lofa-movement') {
        const movement = packet.payload;
        const timestamp = movement.ts ? new Date(movement.ts) : new Date();
        const timeLabel = timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        setGyroData({
          pitch: Number(movement.pitch || 0),
          roll: Number(movement.roll || 0),
          yaw: Number(movement.yaw || 0),
        });
        setAccelData({
          x: Number(movement.x || 0),
          y: Number(movement.y || 0),
          z: Number(movement.z || 0),
        });

        setActivityData((current) => {
          const next = [
            ...current,
            {
              id: `activity-${movement.ts || Date.now()}`,
              time: timeLabel,
              x: Number(movement.x || 0),
              y: Number(movement.y || 0),
              z: Number(movement.z || 0),
            },
          ];
          return next.slice(-HISTORY_LIMIT);
        });
        return;
      }

      if (packet.topic === 'lofa-thermo') {
        const thermo = packet.payload;
        const timestamp = thermo.ts ? new Date(thermo.ts) : new Date();
        const timeLabel = timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const nextTemp = Number(thermo.temperature || 0);
        const nextHumidity = Number(thermo.humidity || 0);

        setCurrentTemp(nextTemp);
        setCurrentHumidity(nextHumidity);
        setTempData((current) => {
          const next = [
            ...current,
            {
              id: `temp-${thermo.ts || Date.now()}`,
              time: timeLabel,
              temp: nextTemp,
            },
          ];
          return next.slice(-HISTORY_LIMIT);
        });
      }
    });

    return () => socket.close();
  }, []);

  const showThermo = thermoReady && (wantsTemp || wantsHumidity);
  const showGyro = movementReady && wantsGyro;

  const activityLevel = useMemo(() => {
    if (!activityData.length) return 'Waiting';
    const latest = activityData[activityData.length - 1];
    const intensity = Math.abs(latest.x) + Math.abs(latest.y) + Math.abs(latest.z);
    if (intensity >= 2.4) return t.activityLevels.high;
    if (intensity >= 1.2) return t.activityLevels.medium || 'Medium';
    return t.activityLevels.low || 'Low';
  }, [activityData, t.activityLevels.high, t.activityLevels.low, t.activityLevels.medium]);

  const temperatureTrend = useMemo(() => {
    if (tempData.length < 2) {
      return { direction: 'stable' as const, value: '0.0°C', context: '', className: 'text-gray-400' };
    }

    const latest = tempData[tempData.length - 1].temp;
    const fiveMinutesAgoIndex = Math.max(0, tempData.length - 6);
    const baseline = tempData[fiveMinutesAgoIndex].temp;
    const diff = latest - baseline;
    const sign = diff > 0 ? '+' : '';
    return {
      direction: diff > 0 ? ('up' as const) : diff < 0 ? ('down' as const) : ('stable' as const),
      value: `${sign}${diff.toFixed(1)}°C`,
      context: '',
      className:
        diff > 0
          ? 'text-red-500'
          : diff < 0
            ? 'text-blue-500'
            : 'text-gray-400',
    };
  }, [tempData]);

  if (!hasAnySelectedSensor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] text-gray-900 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Radio className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold mb-3">{t.sensors.noSensorsConnected || 'No Sensors Connected'}</h2>
          <p className="text-gray-500 mb-6">{t.sensors.noSensorsDesc || 'Add and connect sensors on the Sensor Configuration page to see live data here.'}</p>
          <button
            onClick={() => navigate('/sensors')}
            className="px-6 py-3 bg-gradient-to-r from-[#a0b868] to-[#51553a] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            {t.sensors.goToSensorPage || 'Configure Sensors'}
          </button>
        </div>
      </div>
    );
  }

  if (!showThermo && !showGyro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] text-gray-900 p-6 flex items-center justify-center">
        <div className="text-center max-w-xl">
          <Radio className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold mb-3">Waiting for selected sensor data</h2>
          <p className="text-gray-500 mb-3">
            Realtime widgets appear only when the sensor is connected in Sensor Canvas and live MQTT data is arriving.
          </p>
          <p className="text-gray-500">
            Bridge: <span className="font-mono">{bridgeConnected ? connectionText : MQTT_BRIDGE_URL}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t.subtitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#FF7601]/20 px-4 py-2 rounded-full border border-[#FF7601]/30">
                <div className="w-2 h-2 bg-[#FF7601] rounded-full animate-pulse" />
                <span className="text-[#FF7601] text-sm font-semibold">{bridgeConnected ? t.liveStatus : connectionText}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {showThermo && wantsTemp && (
            <MetricCard
              title={t.bodyTemperature}
              value={currentTemp.toFixed(1)}
              unit={t.unit.celsius}
              icon={Thermometer}
              trend={temperatureTrend.direction}
              trendValue={temperatureTrend.value}
              trendContext={temperatureTrend.context}
              trendClassName={temperatureTrend.className}
              color="#FF7601"
            />
          )}
          {showThermo && wantsHumidity && (
            <MetricCard
              title={t.sensors.humidity}
              value={currentHumidity.toFixed(0)}
              unit="%"
              icon={Droplets}
              trend="stable"
              trendValue={t.trend.onPace}
              trendContext=""
              color="#F3A26D"
            />
          )}
          {showGyro && (
            <MetricCard
              title={t.activityLevel}
              value={activityLevel}
              unit=""
              icon={Radio}
              color="#00809D"
            />
          )}
          {showGyro && (
            <MetricCard
              title="X Accel"
              value={accelData.x.toFixed(3)}
              unit="g"
              icon={Activity}
              color="#0068C9"
            />
          )}
          {showGyro && (
            <MetricCard
              title="Y Accel"
              value={accelData.y.toFixed(3)}
              unit="g"
              icon={Activity}
              color="#FF9900"
            />
          )}
          {showGyro && (
            <MetricCard
              title="Z Accel"
              value={accelData.z.toFixed(3)}
              unit="g"
              icon={Activity}
              color="#FF2B2B"
            />
          )}
        </div>

        {(showThermo || showGyro) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {showThermo && wantsTemp && <TemperatureChart data={tempData} title={t.temperatureChart} />}
            {showGyro && <ActivityChart data={activityData} title={t.gyroscopeMovement} />}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showGyro && (
            <GyroscopeVisualization
              pitch={gyroData.pitch}
              roll={gyroData.roll}
              yaw={gyroData.yaw}
              title={t.realTime3DMovement}
            />
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">{t.footerText}</p>
        </footer>
      </div>
    </div>
  );
}
