import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, Translations } from '../i18n/translations';
import { Thermometer, Gauge, Droplets, LucideIcon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface UserData {
  name: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface SensorNode {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  connected: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface SensorEdge {
  id: string;
  fromNodeId: string;
  fromPort: 'top' | 'right' | 'bottom' | 'left';
  toNodeId: string;
  toPort: 'top' | 'right' | 'bottom' | 'left';
}

export const SENSOR_TEMPLATES = [
  { type: 'temperature', label: 'Temperature', icon: 'Thermometer', color: '#FF7601' },
  { type: 'gyroscope', label: 'Movement', icon: 'Gauge', color: '#00809D' },
  { type: 'humidity', label: 'Humidity', icon: 'Droplets', color: '#F3A26D' },
];

export const SENSOR_ICON_MAP: Record<string, LucideIcon> = {
  Thermometer,
  Gauge,
  Droplets,
};

export const NODE_CARD_WIDTH = 180;
export const NODE_CARD_HEIGHT = 100;

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  toggleTheme: () => void;
  t: Translations;
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  bmi: number | null;
  sensors: SensorNode[];
  edges: SensorEdge[];
  addSensor: (sensor: SensorNode) => void;
  removeSensor: (id: string) => void;
  updateSensorPosition: (id: string, x: number, y: number) => void;
  toggleSensorConnection: (id: string) => void;
  addEdge: (edge: SensorEdge) => void;
  removeEdge: (id: string) => void;
  connectedSensors: SensorNode[];
  connectedSensorTypes: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadSensors(): SensorNode[] {
  try {
    const saved = localStorage.getItem('lofa-sensors');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function loadEdges(): SensorEdge[] {
  try {
    const saved = localStorage.getItem('lofa-edges');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function loadUserData(): UserData | null {
  try {
    const saved = localStorage.getItem('profile.json');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [userData, setUserDataState] = useState<UserData | null>(loadUserData);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [sensors, setSensors] = useState<SensorNode[]>(loadSensors);
  const [edges, setEdges] = useState<SensorEdge[]>(loadEdges);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lofa-sensors', JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem('lofa-edges', JSON.stringify(edges));
  }, [edges]);

  useEffect(() => {
    if (userData) {
      localStorage.setItem('profile.json', JSON.stringify(userData));
    }
  }, [userData]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'th' : 'en');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setUserData = (data: UserData) => {
    setUserDataState(data);
  };

  const addSensor = (sensor: SensorNode) => {
    setSensors(prev => [...prev, sensor]);
  };

  const removeSensor = (id: string) => {
    setSensors(prev => prev.filter(s => s.id !== id));
    setEdges(prev => prev.filter(e => e.fromNodeId !== id && e.toNodeId !== id));
  };

  const updateSensorPosition = (id: string, x: number, y: number) => {
    setSensors(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const toggleSensorConnection = (id: string) => {
    setSensors(prev => prev.map(s => s.id === id ? { ...s, connected: !s.connected } : s));
  };

  const addEdge = (edge: SensorEdge) => {
    setEdges(prev => [...prev, edge]);
  };

  const removeEdge = (id: string) => {
    setEdges(prev => prev.filter(e => e.id !== id));
  };

  const bmi = userData
    ? Number((userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1))
    : null;

  const connectedSensors = sensors.filter(s => s.connected);
  const connectedSensorTypes = [...new Set(connectedSensors.map(s => s.type))];

  const value: AppContextType = {
    language,
    setLanguage,
    toggleLanguage,
    theme,
    toggleTheme,
    t: translations[language],
    userData,
    setUserData,
    bmi,
    sensors,
    edges,
    addSensor,
    removeSensor,
    updateSensorPosition,
    toggleSensorConnection,
    addEdge,
    removeEdge,
    connectedSensors,
    connectedSensorTypes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
