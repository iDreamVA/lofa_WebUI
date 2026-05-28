import React, { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, Trash2, Plus, Gauge, X } from 'lucide-react';
import { useApp, SENSOR_TEMPLATES, SENSOR_ICON_MAP, SensorNode, SensorEdge, NODE_CARD_WIDTH, NODE_CARD_HEIGHT } from '../context/AppContext';
import { useIsMobile } from '../components/ui/use-mobile';

type Port = 'top' | 'right' | 'bottom' | 'left';

interface SensorTemplate {
  type: string;
  label: string;
  icon: string;
  color: string;
}

function getPortPosition(node: SensorNode, port: Port) {
  const cx = node.x + NODE_CARD_WIDTH / 2;
  const cy = node.y + NODE_CARD_HEIGHT / 2;
  switch (port) {
    case 'top': return { x: cx, y: node.y };
    case 'right': return { x: node.x + NODE_CARD_WIDTH, y: cy };
    case 'bottom': return { x: cx, y: node.y + NODE_CARD_HEIGHT };
    case 'left': return { x: node.x, y: cy };
  }
}

function SensorTemplateCard({ template }: { template: SensorTemplate }) {
  const { t } = useApp();
  const Icon = SENSOR_ICON_MAP[template.icon] || Gauge;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'sensor',
    item: { template },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const labelMap: Record<string, string> = {
    temperature: t.sensors.temperature,
    gyroscope: t.sensors.gyroscope,
    humidity: t.sensors.humidity,
    airQuality: t.sensors.airQuality,
    airPressure: t.sensors.airPressure,
    buzzer: t.sensors.buzzer,
    aiAgent: t.sensors.aiAgent,
  };

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.05 }}
      className={`p-4 bg-gray-50 border-2 rounded-lg cursor-move transition-all shadow-sm ${
        isDragging ? 'opacity-50 border-dashed' : 'border-gray-200'
      }`}
      style={{ borderColor: isDragging ? template.color : undefined }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${template.color}20` }}>
          <Icon className="w-5 h-5" style={{ color: template.color }} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{labelMap[template.type] || template.label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function PortDot({ node, port, visible, onStartConnection }: {
  node: SensorNode;
  port: Port;
  visible: boolean;
  onStartConnection: (nodeId: string, port: Port, e: React.MouseEvent) => void;
}) {
  const offsets: Record<Port, string> = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    left: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`absolute flex items-center justify-center z-20 cursor-crosshair ${offsets[port]}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onStartConnection(node.id, port, e);
      }}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 border-white transition-all ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        style={{ backgroundColor: node.color, boxShadow: `0 0 10px ${node.color}90` }}
      />
    </div>
  );
}

function SensorNodeCard({
  node,
  onMove,
  onToggleConnection,
  onDelete,
  onStartConnection,
}: {
  node: SensorNode;
  onMove: (id: string, x: number, y: number) => void;
  onToggleConnection: (id: string) => void;
  onDelete: (id: string) => void;
  onStartConnection: (nodeId: string, port: Port, e: React.MouseEvent) => void;
}) {
  const { t } = useApp();
  const Icon = SENSOR_ICON_MAP[node.icon] || Gauge;
  const [activePort, setActivePort] = useState<Port | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'node',
    item: { id: node.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const labelMap: Record<string, string> = {
    temperature: t.sensors.temperature,
    gyroscope: t.sensors.gyroscope,
    humidity: t.sensors.humidity,
    airQuality: t.sensors.airQuality,
    airPressure: t.sensors.airPressure,
    buzzer: t.sensors.buzzer,
    aiAgent: t.sensors.aiAgent,
  };

  const ports: Port[] = ['top', 'right', 'bottom', 'left'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const distTop = y;
    const distRight = w - x;
    const distBottom = h - y;
    const distLeft = x;
    const min = Math.min(distTop, distRight, distBottom, distLeft);

    const threshold = Math.min(w, h) / 3;
    if (min > threshold) {
      setActivePort(null);
      return;
    }

    if (min === distTop) setActivePort('top');
    else if (min === distRight) setActivePort('right');
    else if (min === distBottom) setActivePort('bottom');
    else setActivePort('left');
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActivePort(null)}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: node.color,
        boxShadow: node.connected
          ? `0 0 20px ${node.color}40, 0 0 40px ${node.color}20`
          : `0 0 20px ${node.color}40`,
      }}
      className="rounded-xl p-4 shadow-lg group"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      {/* Gradient overlay like mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-xl pointer-events-none" />

      {ports.map(port => (
        <PortDot key={port} node={node} port={port} visible={activePort === port} onStartConnection={onStartConnection} />
      ))}

      {/* Drag handle area */}
      <div ref={drag} className="flex items-center justify-between mb-3 cursor-move">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-sm text-white">{labelMap[node.type] || node.label}</span>
          {node.connected && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-white/70 hover:text-red-400" />
        </button>
      </div>

      <button
        onClick={() => onToggleConnection(node.id)}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
          node.connected
            ? 'bg-white/30 text-white'
            : 'bg-black/20 text-white/70 hover:bg-black/30'
        }`}
      >
        {node.connected ? (
          <><Wifi className="w-4 h-4" /><span className="text-xs font-medium">{t.sensors.connected}</span></>
        ) : (
          <><WifiOff className="w-4 h-4" /><span className="text-xs font-medium">{t.sensors.disconnected}</span></>
        )}
      </button>
    </motion.div>
  );
}

function EdgeLines({ edges, sensors }: { edges: SensorEdge[]; sensors: SensorNode[] }) {
  const nodeMap = new Map(sensors.map(s => [s.id, s]));

  return (
    <>
      {edges.map(edge => {
        const fromNode = nodeMap.get(edge.fromNodeId);
        const toNode = nodeMap.get(edge.toNodeId);
        if (!fromNode || !toNode) return null;

        const from = getPortPosition(fromNode, edge.fromPort);
        const to = getPortPosition(toNode, edge.toPort);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cx = dx * 0.5;
        const cy = dy * 0.5;
        const path = `M ${from.x} ${from.y} C ${from.x + cx} ${from.y}, ${to.x - cx} ${to.y}, ${to.x} ${to.y}`;

        return (
          <g key={edge.id}>
            <path
              d={path}
              stroke={fromNode.color}
              strokeWidth={2.5}
              fill="none"
              opacity={0.5}
              strokeLinecap="round"
            />
            <circle cx={to.x} cy={to.y} r={4} fill={toNode.color} opacity={0.7} />
          </g>
        );
      })}
    </>
  );
}

function MobileSensorPicker({ onSelect, onClose }: {
  onSelect: (template: SensorTemplate) => void;
  onClose: () => void;
}) {
  const { t } = useApp();
  const labelMap: Record<string, string> = {
    temperature: t.sensors.temperature,
    gyroscope: t.sensors.gyroscope,
    humidity: t.sensors.humidity,
    airQuality: t.sensors.airQuality,
    airPressure: t.sensors.airPressure,
    buzzer: t.sensors.buzzer,
    aiAgent: t.sensors.aiAgent,
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white border-t border-gray-200 p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <h2 className="text-xl font-bold mb-1 text-gray-900">{t.sensors.catalog || 'Select Sensor'}</h2>
          <p className="text-gray-500 text-sm mb-6">{t.sensors.subtitle}</p>
          <div className="grid grid-cols-2 gap-3">
            {SENSOR_TEMPLATES.map((template) => {
              const Icon = SENSOR_ICON_MAP[template.icon] || Gauge;
              return (
                <motion.button
                  key={template.type}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onSelect(template); onClose(); }}
                  className="p-4 rounded-2xl transition-all flex flex-col items-center gap-2"
                  style={{ backgroundColor: `${template.color}20`, border: `2px solid ${template.color}40` }}
                  whileHover={{ scale: 1.05, borderColor: template.color }}
                >
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${template.color}30` }}>
                    <Icon className="w-6 h-6" style={{ color: template.color }} />
                  </div>
                  <span className="text-xs font-semibold text-center text-gray-900">
                    {labelMap[template.type] || template.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function MobilePuzzleGrid({ onToggleConnection, onDelete, onAddSensorClick }: {
  onToggleConnection: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSensorClick: () => void;
}) {
  const { t, sensors } = useApp();
  const labelMap: Record<string, string> = {
    temperature: t.sensors.temperature,
    gyroscope: t.sensors.gyroscope,
    humidity: t.sensors.humidity,
    airQuality: t.sensors.airQuality,
    airPressure: t.sensors.airPressure,
    buzzer: t.sensors.buzzer,
    aiAgent: t.sensors.aiAgent,
  };

  return (
    <div className="w-full space-y-4">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onAddSensorClick}
        className="w-full py-4 px-4 bg-gradient-to-r from-[#a0b868] to-[#51553a] rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
      >
        <Plus className="w-5 h-5" />
        <span>Add Sensor</span>
      </motion.button>

      {sensors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Gauge className="w-16 h-16 mx-auto mb-4 opacity-20 text-gray-400" />
          <p className="text-gray-500 text-sm">{t.sensors.dragInstruction}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sensors.map((node, index) => {
            const Icon = SENSOR_ICON_MAP[node.icon] || Gauge;
            return (
              <motion.div
                key={node.id}
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="min-h-[100px] relative bg-gradient-to-br rounded-3xl p-5 cursor-pointer overflow-hidden group transition-all"
                style={{ backgroundColor: node.color, opacity: 0.92, boxShadow: `0 8px 24px ${node.color}30` }}
                whileHover={{ opacity: 1, scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-3xl" />
                <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors z-10">
                  <X className="w-4 h-4 text-white/70" />
                </button>
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{labelMap[node.type] || node.label}</h3>
                        {node.connected && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/70">{node.connected ? t.sensors.connected : t.sensors.disconnected}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleConnection(node.id); }}
                    className={`mt-4 text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 w-full ${
                      node.connected ? 'bg-white/30 text-white' : 'bg-black/20 text-white/70 hover:bg-black/30'
                    }`}
                  >
                    {node.connected ? <><Wifi className="w-3 h-3" /><span>{t.sensors.connected}</span></> : <><WifiOff className="w-3 h-3" /><span>{t.sensors.disconnected}</span></>}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Workspace({ onDrop, onMove, onToggleConnection, onDelete }: {
  onDrop: (template: SensorTemplate, x: number, y: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  onToggleConnection: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t, sensors, edges, addEdge } = useApp();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [draggingConnection, setDraggingConnection] = useState<{ fromNodeId: string; fromPort: Port; mouseX: number; mouseY: number } | null>(null);

  const [, drop] = useDrop(() => ({
    accept: ['sensor', 'node'],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const el = document.getElementById('workspace');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = offset.x - rect.left;
      const y = offset.y - rect.top;
      if (item.template) onDrop(item.template, x, y);
      else if (item.id) onMove(item.id, x, y);
    },
  }));

  const handleStartConnection = useCallback((nodeId: string, port: Port, e: React.MouseEvent) => {
    const el = workspaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDraggingConnection({
      fromNodeId: nodeId,
      fromPort: port,
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top,
    });

    const handleMove = (ev: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setDraggingConnection(prev => prev ? { ...prev, mouseX: ev.clientX - r.left, mouseY: ev.clientY - r.top } : null);
    };

    const handleUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      setDraggingConnection(null);

      // Find if mouse is over a port on another node
      const r = el.getBoundingClientRect();
      const mx = ev.clientX - r.left;
      const my = ev.clientY - r.top;

      for (const node of sensors) {
        if (node.id === nodeId) continue;
        const ports: Port[] = ['top', 'right', 'bottom', 'left'];
        for (const p of ports) {
          const pos = getPortPosition(node, p);
          const dist = Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2);
          if (dist < 40) {
            const exists = edges.some(e =>
              (e.fromNodeId === nodeId && e.toNodeId === node.id) ||
              (e.fromNodeId === node.id && e.toNodeId === nodeId)
            );
            if (!exists) {
              addEdge({
                id: `edge-${nodeId}-${node.id}-${Date.now()}`,
                fromNodeId: nodeId,
                fromPort: port,
                toNodeId: node.id,
                toPort: p,
              });
            }
            return;
          }
        }
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [sensors, edges, addEdge]);

  const fromNode = draggingConnection ? sensors.find(s => s.id === draggingConnection.fromNodeId) : null;

  return (
    <div
      id="workspace"
      ref={(node) => {
        drop(node);
        (workspaceRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className="relative flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden"
      style={{ minHeight: '600px' }}
    >
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {/* Auto-connect chain lines between consecutive sensors */}
        {sensors.length > 1 && sensors.slice(0, -1).map((node, i) => {
          const next = sensors[i + 1];
          const from = { x: node.x + NODE_CARD_WIDTH / 2, y: node.y + NODE_CARD_HEIGHT / 2 };
          const to = { x: next.x + NODE_CARD_WIDTH / 2, y: next.y + NODE_CARD_HEIGHT / 2 };
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const cx = dx * 0.4;
          const cy = dy * 0.4;
          const path = `M ${from.x} ${from.y} C ${from.x + cx} ${from.y + cy}, ${to.x - cx} ${to.y - cy}, ${to.x} ${to.y}`;
          const isLatest = i === sensors.length - 2;
          return (
            <path
              key={`auto-${node.id}-${next.id}`}
              d={path}
              stroke="#51553a"
              strokeWidth={2}
              strokeDasharray="8 6"
              fill="none"
              opacity={0.5}
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1s" repeatCount="indefinite" />
            </path>
          );
        })}
      </svg>

      {sensors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Gauge className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg text-gray-500">{t.sensors.dragInstruction}</p>
          </div>
        </div>
      )}

      {sensors.map((node) => (
        <SensorNodeCard
          key={node.id}
          node={node}
          onMove={onMove}
          onToggleConnection={onToggleConnection}
          onDelete={onDelete}
          onStartConnection={handleStartConnection}
        />
      ))}
    </div>
  );
}

export function SensorCanvasPage() {
  const { t, addSensor, removeSensor, updateSensorPosition, toggleSensorConnection } = useApp();
  const isMobile = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);

  const handleDrop = (template: SensorTemplate, x: number, y: number) => {
    const sizes = ['small', 'small', 'medium', 'large'] as const;
    addSensor({
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      label: template.label,
      icon: template.icon,
      color: template.color,
      x: x - 90,
      y: y - 40,
      connected: true,
      size: sizes[Math.floor(Math.random() * sizes.length)],
    });
  };

  const handleAddSensor = (template: SensorTemplate) => {
    const sizes = ['small', 'small', 'medium', 'large'] as const;
    addSensor({
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      label: template.label,
      icon: template.icon,
      color: template.color,
      x: 0,
      y: 0,
      connected: true,
      size: sizes[Math.floor(Math.random() * sizes.length)],
    });
  };

  const handleMove = (id: string, x: number, y: number) => {
    updateSensorPosition(id, x - 90, y - 40);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] text-gray-900 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-1">{t.sensors.title}</h1>
            <p className="text-gray-500 text-sm">{t.sensors.subtitle}</p>
          </header>
          <MobilePuzzleGrid onToggleConnection={toggleSensorConnection} onDelete={removeSensor} onAddSensorClick={() => setShowMobileModal(true)} />
          <AnimatePresence>
            {showMobileModal && <MobileSensorPicker onSelect={handleAddSensor} onClose={() => setShowMobileModal(false)} />}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-[#fffef5] to-[#f0ede0] text-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t.sensors.title}</h1>
            <p className="text-gray-500">{t.sensors.subtitle}</p>
          </header>

          <div className="flex gap-6">
            <div className="w-72">
              <h3 className="text-lg font-semibold mb-4 text-[#00809D]">{t.sensors.individualNodes}</h3>
              <div className="space-y-3">
                {SENSOR_TEMPLATES.map((template) => (
                  <SensorTemplateCard key={template.type} template={template} />
                ))}
              </div>
            </div>

            <Workspace
              onDrop={handleDrop}
              onMove={handleMove}
              onToggleConnection={toggleSensorConnection}
              onDelete={removeSensor}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
