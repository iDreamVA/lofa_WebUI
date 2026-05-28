import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CircleGauge, Droplets, Radio, Thermometer, Wind } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { TemperatureChart } from '../components/TemperatureChart';
import { GyroscopeVisualization } from '../components/GyroscopeVisualization';
import { ActivityChart } from '../components/ActivityChart';
import { useApp } from '../context/AppContext';

const MQTT_BRIDGE_URL =
  import.meta.env.VITE_MQTT_BRIDGE_URL || 'ws://localhost:8080/stream';
const HISTORY_LIMIT = 200;
const UI_UPDATE_MS = 250;

type MotionSample = {
  ax?: number;
  ay?: number;
  az?: number;
  gx?: number;
  gy?: number;
  gz?: number;
};

type ThermoSample = {
  temp_c?: number;
  humidity?: number;
};

type Bme680Sample = {
  gas_kohm?: number;
  eco2?: number;
  aqi?: number;
};

type NanoBleSample = {
  pressure_kpa?: number;
};

type PredictionSample = {
  label?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
};

type SnapshotPayload = {
  wall_time?: string;
  timestamp_ms?: number;
  motion?: MotionSample;
  thermo?: ThermoSample;
  bme680?: Bme680Sample;
  nano_ble?: NanoBleSample;
  prediction?: PredictionSample;
  raw?: Record<string, unknown>;
};

type BridgePacket =
  | {
      type: 'status';
      connected?: boolean;
      has_movement?: boolean;
      has_thermo?: boolean;
      has_bme680?: boolean;
      message?: string;
    }
  | {
      type: 'snapshot';
      payload?: SnapshotPayload;
    };

export function RealtimeDashboardPage() {
  const { t, connectedSensors, connectedSensorTypes } = useApp();
  const navigate = useNavigate();

  const wantsTemp = connectedSensorTypes.includes('temperature');
  const wantsHumidity = connectedSensorTypes.includes('humidity');
  const wantsMovement = connectedSensorTypes.includes('gyroscope');
  const wantsAirQuality = connectedSensorTypes.includes('airQuality');
  const wantsAirPressure = connectedSensorTypes.includes('airPressure');
  const hasAnySelectedSensor = connectedSensors.length > 0;

  const [connectionText, setConnectionText] = useState('Connecting...');
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [movementReady, setMovementReady] = useState(false);
  const [thermoReady, setThermoReady] = useState(false);
  const [bme680Ready, setBme680Ready] = useState(false);

  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentHumidity, setCurrentHumidity] = useState(0);
  const [currentPressureKpa, setCurrentPressureKpa] = useState(0);
  const [currentAqi, setCurrentAqi] = useState(0);
  const [currentEco2, setCurrentEco2] = useState(0);
  const [prediction, setPrediction] = useState<PredictionSample | null>(null);
  const [rawSnapshot, setRawSnapshot] = useState<Record<string, unknown> | null>(null);
  const lastRawSnapshotAt = useRef(0);
  const latestSnapshotRef = useRef<SnapshotPayload | null>(null);

  const [gyroData, setGyroData] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [tempData, setTempData] = useState<Array<{ id: string; time: string; temp: number }>>([]);
  const [activityData, setActivityData] = useState<
    Array<{ id: string; time: string; x: number; y: number; z: number }>
  >([]);

  useEffect(() => {
    const socket = new WebSocket(MQTT_BRIDGE_URL);

    const flushInterval = window.setInterval(() => {
      const snapshot = latestSnapshotRef.current;
      if (!snapshot) return;
      latestSnapshotRef.current = null;

      const now = Date.now();
      if (now - lastRawSnapshotAt.current >= 500) {
        lastRawSnapshotAt.current = now;
        setRawSnapshot(snapshot.raw || snapshot as unknown as Record<string, unknown>);
      }

      const timeLabel = snapshot.wall_time
        ? snapshot.wall_time.slice(11, 19)
        : new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

      if (snapshot.motion) {
        setAccelData({
          x: Number(snapshot.motion.ax || 0),
          y: Number(snapshot.motion.ay || 0),
          z: Number(snapshot.motion.az || 0),
        });
        setGyroData({
          pitch: Number(snapshot.motion.gx || 0),
          roll: Number(snapshot.motion.gy || 0),
          yaw: Number(snapshot.motion.gz || 0),
        });
        setActivityData((current) =>
          [
            ...current,
            {
              id: `activity-${snapshot.timestamp_ms || Date.now()}`,
              time: timeLabel,
              x: Number(snapshot.motion?.ax || 0),
              y: Number(snapshot.motion?.ay || 0),
              z: Number(snapshot.motion?.az || 0),
            },
          ].slice(-HISTORY_LIMIT)
        );
      }

      if (snapshot.thermo) {
        const nextTemp = Number(snapshot.thermo.temp_c || 0);
        const nextHumidity = Number(snapshot.thermo.humidity || 0);
        setCurrentTemp(nextTemp);
        setCurrentHumidity(nextHumidity);
        setTempData((current) =>
          [
            ...current,
            {
              id: `temp-${snapshot.timestamp_ms || Date.now()}`,
              time: timeLabel,
              temp: nextTemp,
            },
          ].slice(-HISTORY_LIMIT)
        );
      }

      if (snapshot.nano_ble?.pressure_kpa) {
        setCurrentPressureKpa(Number(snapshot.nano_ble.pressure_kpa || 0));
      }

      if (snapshot.bme680) {
        setCurrentAqi(Number(snapshot.bme680.aqi || 0));
        setCurrentEco2(Number(snapshot.bme680.eco2 || 0));
      }

      if (snapshot.prediction) {
        setPrediction(snapshot.prediction);
      }
    }, UI_UPDATE_MS);

    socket.addEventListener('open', () => {
      setConnectionText('LIVE');
    });

    socket.addEventListener('close', () => {
      setBridgeConnected(false);
      setMovementReady(false);
      setThermoReady(false);
      setBme680Ready(false);
      setConnectionText('Disconnected');
    });

    socket.addEventListener('error', () => {
      setBridgeConnected(false);
      setMovementReady(false);
      setThermoReady(false);
      setBme680Ready(false);
      setConnectionText('Cannot reach bridge');
    });

    socket.addEventListener('message', (event) => {
      const packet = JSON.parse(event.data) as BridgePacket;

      if (packet.type === 'status') {
        setBridgeConnected(Boolean(packet.connected));
        setMovementReady(Boolean(packet.has_movement));
        setThermoReady(Boolean(packet.has_thermo));
        setBme680Ready(Boolean(packet.has_bme680));
        if (!packet.connected && packet.message) {
          setConnectionText(packet.message);
        }
        return;
      }

      if (packet.type !== 'snapshot' || !packet.payload) return;

      latestSnapshotRef.current = packet.payload;
    });

    return () => {
      window.clearInterval(flushInterval);
      socket.close();
    };
  }, []);

  const showThermo = wantsTemp || wantsHumidity;
  const showMovement = wantsMovement;
  const showAir = wantsAirQuality || wantsAirPressure;

  const activityLevel = useMemo(() => {
    if (!activityData.length) return 'Waiting';
    const latest = activityData[activityData.length - 1];
    const intensity = Math.abs(latest.x) + Math.abs(latest.y) + Math.abs(latest.z);
    if (intensity >= 2.4) return t.activityLevels.high;
    if (intensity >= 1.2) return t.activityLevels.medium || 'Medium';
    return t.activityLevels.low || 'Low';
  }, [activityData, t.activityLevels.high, t.activityLevels.low, t.activityLevels.medium]);

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
                <span className="text-[#FF7601] text-sm font-semibold">{bridgeConnected ? 'LIVE' : connectionText}</span>
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
              color="#FF7601"
            />
          )}
          {showThermo && wantsHumidity && (
            <MetricCard
              title={t.sensors.humidity}
              value={currentHumidity.toFixed(0)}
              unit="%"
              icon={Droplets}
              color="#F3A26D"
            />
          )}
          {showMovement && (
            <MetricCard
              title={t.activityLevel}
              value={prediction?.label || activityLevel}
              unit=""
              icon={Radio}
              color="#00809D"
            />
          )}
          {showMovement && (
            <MetricCard
              title="X Accel"
              value={accelData.x.toFixed(3)}
              unit="g"
              icon={Activity}
              color="#0068C9"
            />
          )}
          {showMovement && (
            <MetricCard
              title="Y Accel"
              value={accelData.y.toFixed(3)}
              unit="g"
              icon={Activity}
              color="#FF9900"
            />
          )}
          {showMovement && (
            <MetricCard
              title="Z Accel"
              value={accelData.z.toFixed(3)}
              unit="g"
              icon={Activity}
              color="#FF2B2B"
            />
          )}
          {showAir && wantsAirPressure && (
            <MetricCard
              title="Pressure"
              value={currentPressureKpa.toFixed(2)}
              unit="kPa"
              icon={CircleGauge}
              color="#6495A7"
            />
          )}
          {showAir && wantsAirQuality && (
            <MetricCard
              title="Air Quality"
              value={currentAqi.toFixed(0)}
              unit="IAQ"
              icon={Wind}
              color={currentAqi > 150 ? '#dc2626' : '#77ABA4'}
            />
          )}
          {showAir && wantsAirQuality && (
            <MetricCard
              title="eCO₂"
              value={currentEco2.toFixed(0)}
              unit="ppm"
              icon={Wind}
              color="#82758e"
            />
          )}
        </div>

        {(showThermo || showMovement) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {showThermo && wantsTemp && <TemperatureChart data={tempData} title={t.temperatureChart} />}
            {showMovement && <ActivityChart data={activityData} title={t.gyroscopeMovement} />}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showMovement && (
            <GyroscopeVisualization
              pitch={gyroData.pitch}
              roll={gyroData.roll}
              yaw={gyroData.yaw}
              title={t.realTime3DMovement}
            />
          )}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Raw Broadcast</h3>
              {prediction?.label && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#00809D]/10 text-[#00809D]">
                  {prediction.label} · {(Number(prediction.confidence || 0) * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <pre className="bg-gray-50 rounded-xl p-4 text-xs text-gray-700 overflow-auto max-h-[420px] whitespace-pre-wrap break-words">
              {rawSnapshot ? JSON.stringify(rawSnapshot, null, 2) : 'Waiting for MQTT snapshot...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
