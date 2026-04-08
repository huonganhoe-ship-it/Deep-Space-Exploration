import React from 'react';
import { motion } from 'motion/react';
import { CelestialObject } from '../data/solarSystem';
import { cn } from '../lib/utils';

interface OrbitVisualizerProps {
  objects: CelestialObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const OrbitVisualizer: React.FC<OrbitVisualizerProps> = ({ objects, selectedId, onSelect }) => {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
      {/* Starfield Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center scale-75 md:scale-100">
        {objects.map((obj) => (
          <React.Fragment key={obj.id}>
            {/* Orbit Line */}
            {obj.orbitRadius > 0 && !obj.hideOrbit && (
              <div
                className={cn(
                  "absolute border border-white/10 rounded-full pointer-events-none transition-colors",
                  selectedId === obj.id && "border-white/30"
                )}
                style={{
                  width: obj.orbitRadius * 2,
                  height: obj.orbitRadius * 2,
                }}
              />
            )}

            {/* Planet */}
            <motion.div
              className="absolute cursor-pointer group"
              initial={false}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: obj.orbitRadius * 0.5 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: obj.orbitRadius * 2,
                height: obj.orbitRadius * 2,
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: -obj.size / 2 }}
                onClick={() => onSelect(obj.id)}
              >
                <motion.div
                  className={cn(
                    "rounded-full shadow-lg transition-all duration-300",
                    selectedId === obj.id ? "ring-2 ring-white ring-offset-4 ring-offset-black scale-125" : "hover:scale-110"
                  )}
                  style={{
                    width: obj.size,
                    height: obj.size,
                    backgroundColor: obj.color,
                    boxShadow: `0 0 20px ${obj.color}44`,
                  }}
                />
                
                {/* Label */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-white/10">
                    {obj.name}
                  </span>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
