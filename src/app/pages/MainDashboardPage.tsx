import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, ThermometerSun, Mountain, Wind, Gauge, TriangleAlert, CheckCircle2, AlertCircle, Activity } from 'lucide-react';

const MQTT_BRIDGE_URL =
  import.meta.env.VITE_MQTT_BRIDGE_URL || 'ws://localhost:8080/stream';
const MQTT_BRIDGE_HTTP_URL =
  import.meta.env.VITE_MQTT_BRIDGE_HTTP_URL ||
  MQTT_BRIDGE_URL.replace(/^ws/, 'http').replace(/\/stream$/, '');
const HISTORY_LIMIT = 180;
const BASELINE_SAMPLES = 120;
const HISTORY_PERIODS = [
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
];

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

type StatusLevel = 'green' | 'yellow' | 'red';

type HistoryPoint = {
  time: string;
  activityMode: string;
  confidence: number;
  fatigueRun: number;
  tempC?: number;
  iaq?: number;
};

type MetricStatus = {
  level: StatusLevel;
  label: string;
  value: string;
  detail: string;
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function computeHeatIndexC(tempC: number, humidity: number) {
  const vaporPressure =
    (humidity / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  return tempC + 0.33 * vaporPressure - 4.0;
}

function getHeatIndexStatus(heatIndexC: number): MetricStatus {
  if (heatIndexC >= 39.4) {
    return { level: 'red', label: 'Danger', value: `${heatIndexC.toFixed(1)}°C`, detail: 'Very high heat strain' };
  }
  if (heatIndexC >= 32.8) {
    return { level: 'red', label: 'High', value: `${heatIndexC.toFixed(1)}°C`, detail: 'Reduce intensity and hydrate' };
  }
  if (heatIndexC >= 27) {
    return { level: 'yellow', label: 'Caution', value: `${heatIndexC.toFixed(1)}°C`, detail: 'Heat load is rising' };
  }
  return { level: 'green', label: 'Normal', value: `${heatIndexC.toFixed(1)}°C`, detail: 'Comfortable heat index' };
}

function pressureKpaToHpa(pressureKpa: number) {
  return pressureKpa * 10;
}

function pressureToAltitudeM(pressureKpa: number) {
  const pressureHpa = pressureKpaToHpa(pressureKpa);
  return 44330 * (1 - Math.pow(pressureHpa / 1013.25, 0.1903));
}

function getPressureStatus(pressureKpa: number, altitudeM: number): MetricStatus {
  const pressureHpa = pressureKpaToHpa(pressureKpa);
  if (pressureHpa < 752) {
    return { level: 'red', label: 'High altitude', value: `${pressureKpa.toFixed(2)} kPa`, detail: `~${Math.round(altitudeM)} m altitude context` };
  }
  if (pressureHpa < 850) {
    return { level: 'yellow', label: 'Watch', value: `${pressureKpa.toFixed(2)} kPa`, detail: `~${Math.round(altitudeM)} m, oxygen load rising` };
  }
  return { level: 'green', label: 'Normal', value: `${pressureKpa.toFixed(2)} kPa`, detail: `~${Math.round(altitudeM)} m equivalent` };
}

function getAqiStatus(aqi: number, eco2: number): MetricStatus {
  if (aqi > 150 || eco2 > 1200) {
    return { level: 'red', label: 'Poor', value: `${aqi.toFixed(0)} IAQ`, detail: `eCO₂ ${eco2.toFixed(0)} ppm` };
  }
  if (aqi > 100 || eco2 > 900) {
    return { level: 'yellow', label: 'Moderate', value: `${aqi.toFixed(0)} IAQ`, detail: `eCO₂ ${eco2.toFixed(0)} ppm` };
  }
  return { level: 'green', label: 'Good', value: `${aqi.toFixed(0)} IAQ`, detail: `eCO₂ ${eco2.toFixed(0)} ppm` };
}

function getEnvironmentStatus(pressureKpa: number, tempC: number, humidity: number, heatIndexC: number): MetricStatus {
  const pressureHpa = pressureKpaToHpa(pressureKpa);
  if ((pressureHpa < 752 && tempC >= 33) || heatIndexC >= 39.4) {
    return { level: 'red', label: 'Red action', value: 'High', detail: 'Pause, cool down, hydrate' };
  }
  if (pressureHpa < 795 || tempC >= 33 || heatIndexC >= 32.8) {
    return { level: 'red', label: 'High load', value: 'Red', detail: `${tempC.toFixed(1)}°C • ${humidity.toFixed(0)}% RH` };
  }
  if ((pressureHpa >= 795 && pressureHpa <= 850) || (tempC >= 30 && tempC < 33) || heatIndexC >= 27) {
    return { level: 'yellow', label: 'Elevated', value: 'Yellow', detail: `${tempC.toFixed(1)}°C • ${humidity.toFixed(0)}% RH` };
  }
  return { level: 'green', label: 'Normal', value: 'Green', detail: `${tempC.toFixed(1)}°C • ${humidity.toFixed(0)}% RH` };
}

function getFatigueStatus(
  impactRatio: number,
  cadenceDrop: number,
  tiltRatio: number,
  heatIndexC: number,
  baselineReady: boolean,
): MetricStatus {
  if (!baselineReady) {
    return { level: 'yellow', label: 'Learning', value: 'Baseline', detail: 'Collecting first movement samples' };
  }

  if (
    heatIndexC >= 33 ||
    impactRatio > 1.3 ||
    (cadenceDrop > 0.15 && impactRatio > 1.15) ||
    tiltRatio > 1.5
  ) {
    return {
      level: 'red',
      label: 'Danger',
      value: `${impactRatio.toFixed(2)}x`,
      detail: `Cadence ${(cadenceDrop * 100).toFixed(0)}% • Tilt ${tiltRatio.toFixed(2)}x`,
    };
  }
  if (
    (heatIndexC >= 27 && heatIndexC < 33) ||
    (impactRatio > 1.15 && impactRatio <= 1.3) ||
    (cadenceDrop >= 0.05 && cadenceDrop <= 0.15) ||
    (tiltRatio > 1.2 && tiltRatio <= 1.5)
  ) {
    return {
      level: 'yellow',
      label: 'Caution',
      value: `${impactRatio.toFixed(2)}x`,
      detail: `Cadence ${(cadenceDrop * 100).toFixed(0)}% • Tilt ${tiltRatio.toFixed(2)}x`,
    };
  }
  return {
    level: 'green',
    label: 'Stable',
    value: `${impactRatio.toFixed(2)}x`,
    detail: `Cadence ${(cadenceDrop * 100).toFixed(0)}% • Tilt ${tiltRatio.toFixed(2)}x`,
  };
}

function getLevelStyles(level: StatusLevel) {
  if (level === 'red') {
    return {
      badge: 'bg-red-100 text-red-700',
      border: 'border-red-200',
      icon: '#dc2626',
    };
  }
  if (level === 'yellow') {
    return {
      badge: 'bg-amber-100 text-amber-700',
      border: 'border-amber-200',
      icon: '#d97706',
    };
  }
  return {
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    icon: '#059669',
  };
}

function StatusCard({
  title,
  icon: Icon,
  status,
}: {
  title: string;
  icon: typeof ThermometerSun;
  status: MetricStatus;
}) {
  const styles = getLevelStyles(status.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-5 shadow-sm border ${styles.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <div className="text-2xl font-bold text-gray-900">{status.value}</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50">
          <Icon className="w-5 h-5" style={{ color: styles.icon }} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles.badge}`}>
          {status.label}
        </span>
        <span className="text-xs text-gray-500 text-right">{status.detail}</span>
      </div>
    </motion.div>
  );
}

export function MainDashboardPage() {
  const { t, userData, bmi } = useApp();
  const navigate = useNavigate();

  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [motionHistory, setMotionHistory] = useState<Array<{ timestamp: number; ax: number; ay: number; az: number; gx: number; gy: number; gz: number }>>([]);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentHumidity, setCurrentHumidity] = useState(0);
  const [currentPressureKpa, setCurrentPressureKpa] = useState(101.325);
  const [currentAqi, setCurrentAqi] = useState(0);
  const [currentEco2, setCurrentEco2] = useState(0);
  const [prediction, setPrediction] = useState<PredictionSample | null>(null);
  const [historyPeriod, setHistoryPeriod] = useState('1h');
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(MQTT_BRIDGE_URL);

    socket.addEventListener('message', (event) => {
      const packet = JSON.parse(event.data) as BridgePacket;

      if (packet.type === 'status') {
        setBridgeConnected(Boolean(packet.connected));
        return;
      }

      if (packet.type !== 'snapshot' || !packet.payload) return;
      const snapshot = packet.payload;

      if (snapshot.motion) {
        setMotionHistory((current) =>
          [
            ...current,
            {
              timestamp: Number(snapshot.timestamp_ms ?? Date.now()),
              ax: Number(snapshot.motion?.ax ?? 0),
              ay: Number(snapshot.motion?.ay ?? 0),
              az: Number(snapshot.motion?.az ?? 0),
              gx: Number(snapshot.motion?.gx ?? 0),
              gy: Number(snapshot.motion?.gy ?? 0),
              gz: Number(snapshot.motion?.gz ?? 0),
            },
          ].slice(-HISTORY_LIMIT)
        );
      }

      if (snapshot.thermo) {
        setCurrentTemp(Number(snapshot.thermo.temp_c ?? 0));
        setCurrentHumidity(Number(snapshot.thermo.humidity ?? 0));
      }

      if (snapshot.bme680) {
        setCurrentAqi(Number(snapshot.bme680.aqi ?? 0));
        setCurrentEco2(Number(snapshot.bme680.eco2 ?? 0));
      }

      if (snapshot.nano_ble?.pressure_kpa) {
        setCurrentPressureKpa(Number(snapshot.nano_ble.pressure_kpa));
      }

      if (snapshot.prediction) {
        setPrediction(snapshot.prediction);
      }
    });

    socket.addEventListener('close', () => setBridgeConnected(false));
    socket.addEventListener('error', () => setBridgeConnected(false));

    return () => socket.close();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await fetch(
          `${MQTT_BRIDGE_HTTP_URL}/history?period=${encodeURIComponent(historyPeriod)}`
        );
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'History request failed');
        }

        if (cancelled) return;

        setHistoryData(
          data.rows.map((row: Record<string, unknown>) => {
            const eventTime = new Date(String(row.event_time));
            return {
              time: eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              activityMode: String(row.predicted_label || ''),
              confidence: Number(row.confidence || 0),
              fatigueRun: Number(row.prob_fatigue_run || 0),
              tempC: row.temp_c == null ? undefined : Number(row.temp_c),
              iaq: row.iaq == null ? undefined : Number(row.iaq),
            };
          })
        );
      } catch (error) {
        if (!cancelled) {
          setHistoryError(error instanceof Error ? error.message : 'History request failed');
          setHistoryData([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadHistory();
    const interval = window.setInterval(loadHistory, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [historyPeriod]);

  if (!userData || !bmi) {
    navigate('/');
    return null;
  }

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: t.bmi.underweight, color: '#3b82f6' };
    if (bmiValue < 25) return { label: t.bmi.normal, color: '#00809D' };
    if (bmiValue < 30) return { label: t.bmi.overweight, color: '#FF7601' };
    return { label: t.bmi.obese, color: '#ef4444' };
  };

  const category = getBMICategory(bmi);

  const getBMIPercentage = (bmiValue: number) => {
    const min = 15;
    const max = 40;
    return Math.min(100, Math.max(0, ((bmiValue - min) / (max - min)) * 100));
  };

  const weightHistory = [
    { day: 'Mon', weight: userData.weight + 2 },
    { day: 'Tue', weight: userData.weight + 1.5 },
    { day: 'Wed', weight: userData.weight + 1 },
    { day: 'Thu', weight: userData.weight + 0.5 },
    { day: 'Fri', weight: userData.weight + 0.2 },
    { day: 'Sat', weight: userData.weight - 0.1 },
    { day: 'Sun', weight: userData.weight },
  ];

  const movementMetrics = useMemo(() => {
    const enriched = motionHistory.map((sample) => {
      const accMag = Math.sqrt(sample.ax ** 2 + sample.ay ** 2 + sample.az ** 2);
      const dynamicAcc = Math.abs(accMag - 1);
      return { ...sample, accMag, dynamicAcc };
    });

    const baselineWindow = enriched.slice(0, BASELINE_SAMPLES);
    const latest = enriched[enriched.length - 1];
    const baselineImpact = average(baselineWindow.map((sample) => Math.abs(sample.az)));
    const impactRatio = latest ? Math.abs(latest.az) / Math.max(baselineImpact, 0.05) : 1;

    const computeCadence = (samples: typeof enriched) => {
      if (samples.length < 4) return 0;
      let peaks = 0;
      for (let index = 1; index < samples.length - 1; index += 1) {
        const current = samples[index].accMag;
        if (
          current > 1.15 &&
          current > samples[index - 1].accMag &&
          current >= samples[index + 1].accMag
        ) {
          peaks += 1;
        }
      }
      const durationMs = Math.max(
        (samples[samples.length - 1].timestamp || 0) - (samples[0].timestamp || 0),
        1000,
      );
      return peaks * (60000 / durationMs);
    };

    const baselineCadence = computeCadence(baselineWindow);
    const currentWindow = enriched.slice(-Math.min(enriched.length, 20));
    const currentCadence = computeCadence(currentWindow);
    const cadenceDrop =
      baselineCadence > 0
        ? Math.max(0, (baselineCadence - currentCadence) / baselineCadence)
        : 0;

    const computeStd = (values: number[]) => {
      if (!values.length) return 0;
      const mean = average(values);
      return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
    };

    const baselineTiltStd = computeStd(baselineWindow.map((sample) => sample.gx));
    const currentTiltStd = computeStd(currentWindow.map((sample) => sample.gx));
    const tiltRatio = currentTiltStd / Math.max(baselineTiltStd, 0.01);

    return {
      baselineReady: baselineWindow.length >= 20,
      latest,
      impactRatio,
      cadenceDrop,
      tiltRatio,
    };
  }, [motionHistory]);

  const heatIndexC = useMemo(
    () => computeHeatIndexC(currentTemp, currentHumidity),
    [currentTemp, currentHumidity],
  );

  const altitudeM = useMemo(
    () => pressureToAltitudeM(currentPressureKpa),
    [currentPressureKpa],
  );

  const heatStatus = getHeatIndexStatus(heatIndexC);
  const environmentStatus = getEnvironmentStatus(currentPressureKpa, currentTemp, currentHumidity, heatIndexC);
  const aqiStatus = getAqiStatus(currentAqi, currentEco2);
  const pressureStatus = getPressureStatus(currentPressureKpa, altitudeM);
  const fatigueStatus = getFatigueStatus(
    movementMetrics.impactRatio,
    movementMetrics.cadenceDrop,
    movementMetrics.tiltRatio,
    heatIndexC,
    movementMetrics.baselineReady,
  );

  const predictionStatus = useMemo(() => {
    if (prediction?.label) {
      const label = prediction.label;
      const confidence = `${(Number(prediction.confidence || 0) * 100).toFixed(1)}%`;
      if (label === 'fatigue_run') {
        return {
          level: 'red' as const,
          label: 'Model warning',
          value: label,
          detail: `Confidence ${confidence}`,
        };
      }
      if (label === 'normal_run' || label === 'fast_run') {
        return {
          level: 'green' as const,
          label: 'Model stable',
          value: label,
          detail: `Confidence ${confidence}`,
        };
      }
      return {
        level: 'yellow' as const,
        label: 'Model detected',
        value: label,
        detail: `Confidence ${confidence}`,
      };
    }

    return {
      level: fatigueStatus.level,
      label: 'Derived',
      value: fatigueStatus.label,
      detail: 'Using motion + thermo fallback',
    };
  }, [prediction, fatigueStatus]);

  const dangerStates = [
    { title: 'Heat Index', status: heatStatus },
    { title: 'Environment Load', status: environmentStatus },
    { title: 'IAQ', status: aqiStatus },
    { title: 'Pressure / Altitude', status: pressureStatus },
    { title: 'Fatigue Risk', status: predictionStatus },
  ].filter((item) => item.status.level === 'red');

  const coachingNotes = [
    ...(dangerStates.length
      ? [{
          tone: 'danger' as const,
          message: `Warning: ${dangerStates.map((item) => item.title).join(', ')} ${dangerStates.length > 1 ? 'are' : 'is'} in the danger zone. Reduce intensity, hydrate, and monitor form now.`,
        }]
      : []),
    {
      tone: bridgeConnected ? ('ok' as const) : ('neutral' as const),
      message: bridgeConnected
        ? `Live stream connected. Environment load is ${environmentStatus.label.toLowerCase()}.`
        : 'Waiting for live MQTT data from the bridge.',
    },
    {
      tone: prediction?.label ? ('ok' as const) : ('neutral' as const),
      message: prediction?.label
        ? `Model prediction is ${prediction.label} at ${(Number(prediction.confidence || 0) * 100).toFixed(1)}% confidence.`
        : 'No model prediction yet, so the dashboard is using fallback calculations from movement and environment.',
    },
    {
      tone: heatStatus.level === 'red' ? ('danger' as const) : heatStatus.level === 'yellow' ? ('warn' as const) : ('neutral' as const),
      message: `Heat index is ${heatStatus.value}. ${heatStatus.detail}.`,
    },
    {
      tone: pressureStatus.level === 'red' ? ('danger' as const) : pressureStatus.level === 'yellow' ? ('warn' as const) : ('neutral' as const),
      message: `Nano pressure is ${currentPressureKpa.toFixed(2)} kPa (~${Math.round(altitudeM)} m equivalent), so altitude load is ${pressureStatus.label.toLowerCase()}.`,
    },
    {
      tone: !prediction?.label && fatigueStatus.level === 'red' ? ('danger' as const) : !prediction?.label && fatigueStatus.level === 'yellow' ? ('warn' as const) : ('neutral' as const),
      message: !prediction?.label && movementMetrics.baselineReady
        ? `Impact is ${fatigueStatus.value} of baseline, cadence drop is ${(movementMetrics.cadenceDrop * 100).toFixed(0)}%, and tilt ratio is ${movementMetrics.tiltRatio.toFixed(2)}x.`
        : !prediction?.label
          ? 'Movement baseline is still learning for the first session samples.'
          : `Fallback fatigue signal is ${fatigueStatus.label.toLowerCase()} for cross-checking the model result.`,
    },
  ];

  const fatigueHistory = historyData.filter((point) => point.fatigueRun > 0);
  const peakFatiguePoint = historyData.reduce<HistoryPoint | null>(
    (peak, point) => (!peak || point.fatigueRun > peak.fatigueRun ? point : peak),
    null,
  );
  const activityModeCounts = historyData.reduce<Record<string, number>>((counts, point) => {
    const mode = point.activityMode || 'unknown';
    counts[mode] = (counts[mode] || 0) + 1;
    return counts;
  }, {});
  const dominantActivityMode = Object.entries(activityModeCounts).sort((a, b) => b[1] - a[1])[0];
  const latestFatigueRows = fatigueHistory.slice(-8).reverse();
  const fatiguePercent = historyData.length
    ? (fatigueHistory.length / historyData.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
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
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${bridgeConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {bridgeConnected ? 'LIVE' : 'Waiting'}
              </span>
              <div className="hidden md:flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#00809D] to-[#FF7601] rounded-full text-white font-bold">
                {userData.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6 mb-6">
          <StatusCard title="Heat Index" icon={ThermometerSun} status={heatStatus} />
          <StatusCard title="Environment Load" icon={TriangleAlert} status={environmentStatus} />
          <StatusCard title="IAQ" icon={Wind} status={aqiStatus} />
          <StatusCard title="Pressure / Altitude" icon={Mountain} status={pressureStatus} />
          <StatusCard title="Fatigue Risk" icon={Gauge} status={predictionStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Live Coaching Summary</h3>

            <div className="space-y-3">
              {coachingNotes.map((note, index) => {
                const Icon =
                  note.tone === 'danger'
                    ? AlertCircle
                    : index === 1
                      ? ThermometerSun
                      : index === 2
                        ? Mountain
                        : CheckCircle2;
                const color =
                  note.tone === 'danger'
                    ? '#dc2626'
                    : note.tone === 'warn'
                      ? '#d97706'
                      : index === 1
                        ? '#FF7601'
                        : index === 2
                          ? '#6495A7'
                          : '#00809D';
                const backgroundClass =
                  note.tone === 'danger'
                    ? 'bg-red-50 border border-red-200'
                    : note.tone === 'warn'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-gray-50';
                return (
                  <motion.div
                    key={`${index}-${note.message}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`flex items-start gap-3 p-3 md:p-4 rounded-xl ${backgroundClass}`}
                  >
                    <Icon className="w-5 h-5 mt-0.5" style={{ color }} />
                    <span className="font-medium text-gray-700 text-sm md:text-base">{note.message}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-sm mb-6"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Activity History Summary</h3>
              <p className="text-sm text-gray-500 mt-1">
                Stored model states from Postgres, sampled by the MQTT bridge
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {HISTORY_PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setHistoryPeriod(period.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    historyPeriod === period.value
                      ? 'bg-[#00809D] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {historyError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              {historyError}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">Stored Records</p>
                    <Activity className="w-5 h-5 text-[#00809D]" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{historyData.length}</div>
                  <p className="text-xs text-gray-500 mt-1">{historyLoading ? 'Updating...' : `Period ${historyPeriod}`}</p>
                </div>

                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-red-700">fatigue_run Count</p>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-700">{fatigueHistory.length}</div>
                  <p className="text-xs text-red-600 mt-1">Only records where fatigue_run &gt; 0</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">Peak fatigue_run</p>
                    <Gauge className="w-5 h-5 text-[#FF7601]" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {peakFatiguePoint ? `${(peakFatiguePoint.fatigueRun * 100).toFixed(1)}%` : '0.0%'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{peakFatiguePoint?.time || 'No history yet'}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">Main Activity Mode</p>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {dominantActivityMode?.[0] || 'unknown'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {dominantActivityMode ? `${dominantActivityMode[1]} records` : 'No history yet'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recent fatigue_run records</h4>
                <div className="space-y-2">
                  {latestFatigueRows.length ? latestFatigueRows.map((point, index) => (
                    <div key={`${point.time}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                      <div>
                        <div className="font-semibold text-gray-800">{point.activityMode || 'unknown'}</div>
                        <div className="text-xs text-gray-500">{point.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">{(point.fatigueRun * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">fatigue_run</div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-lg bg-white px-3 py-4 text-sm text-gray-500">
                      No fatigue_run records above 0 in this period.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span>{fatiguePercent.toFixed(1)}% of stored records include fatigue_run above 0</span>
                <span>Source: public.prediction_events</span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
