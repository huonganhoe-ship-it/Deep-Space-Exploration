import React, { useRef, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialObject } from '../data/solarSystem';

interface PlanetNodeProps {
  obj: CelestialObject;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isPaused?: boolean;
}

const SunCorona: React.FC<{ isPaused?: boolean }> = ({ isPaused }) => {
  const coronaRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (isPaused) return;
    if (coronaRef.current) {
      coronaRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.rotation.z += 0.005 * (i + 1);
        mesh.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05);
      });
    }
  });

  return (
    <group ref={coronaRef}>
      {[1, 1.2, 1.5].map((scale, i) => (
        <mesh key={i} scale={[scale, scale, scale]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color="#FDB813" 
            transparent 
            opacity={0.15 / (i + 1)} 
            side={THREE.BackSide}
          />
        </mesh>
      ))}
    </group>
  );
};

const Nebula: React.FC = () => {
  return (
    <group>
      {[
        { pos: [-50, 20, -50], color: "#442266", scale: 40 },
        { pos: [60, -10, -40], color: "#224466", scale: 50 },
        { pos: [0, -30, -60], color: "#662244", scale: 45 },
      ].map((n, i) => (
        <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={n.pos as [number, number, number]}>
            <sphereGeometry args={[n.scale, 16, 16]} />
            <meshBasicMaterial 
              color={n.color} 
              transparent 
              opacity={0.03} 
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const PlanetNode: React.FC<PlanetNodeProps> = ({ obj, selectedId, onSelect, isPaused }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isSelected = selectedId === obj.id;

  // Orbital movement
  useFrame((state) => {
    if (isPaused) return;
    if (groupRef.current && obj.orbitRadius > 0 && obj.orbitalPeriod) {
      // "Reality Time" calculation
      // We use a high multiplier (100000) so movement is visible, 
      // but ratios are exactly based on real orbital periods.
      const timeScale = 100000; 
      const dayInMs = 24 * 60 * 60 * 1000;
      const totalMs = Date.now() * timeScale;
      const periodInMs = obj.orbitalPeriod * dayInMs;
      
      // Calculate angle based on current time and period
      const angle = (totalMs / periodInMs) % (Math.PI * 2);
      groupRef.current.rotation.y = angle;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const scale = obj.size * 0.04;
  const orbitDist = obj.orbitRadius * 0.08;

  return (
    <group ref={groupRef}>
      {/* Orbit Ring */}
      {obj.orbitRadius > 0 && !obj.hideOrbit && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[orbitDist, orbitDist + 0.05, 128]} />
          <meshBasicMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Planet Body */}
      <group position={[orbitDist, 0, 0]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh 
            ref={meshRef} 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(obj.id);
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            {obj.isArtificial ? (
              <boxGeometry args={[scale, scale, scale]} />
            ) : (
              <sphereGeometry args={[scale, 32, 32]} />
            )}
            <meshStandardMaterial 
              color={obj.color} 
              emissive={obj.id === 'sun' ? obj.color : 'black'}
              emissiveIntensity={obj.id === 'sun' ? 1.5 : 0}
              roughness={0.7}
              metalness={obj.isArtificial ? 0.9 : 0.2}
            />
            {obj.id === 'sun' && <SunCorona isPaused={isPaused} />}
            {isSelected && (
              <mesh>
                {obj.isArtificial ? (
                  <boxGeometry args={[scale * 1.5, scale * 1.5, scale * 1.5]} />
                ) : (
                  <sphereGeometry args={[scale * 1.3, 16, 16]} />
                )}
                <meshBasicMaterial color="white" transparent opacity={0.3} wireframe />
              </mesh>
            )}
          </mesh>
        </Float>
        
        {/* Render Satellites recursively so they are relative to this planet */}
        {obj.satellites?.filter(sat => !sat.isPlanned).map((sat) => (
          <PlanetNode 
            key={sat.id}
            obj={sat}
            selectedId={selectedId}
            onSelect={onSelect}
            isPaused={isPaused}
          />
        ))}
      </group>
    </group>
  );
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("SolarSystem3D Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-900/10 text-red-400 text-xs font-mono p-8 text-center">
          System Visualization Error. Please check your browser's WebGL support.
        </div>
      );
    }
    return this.props.children;
  }
}

interface SolarSystem3DProps {
  objects: CelestialObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isPaused?: boolean;
}

export const SolarSystem3D: React.FC<SolarSystem3DProps> = ({ objects, selectedId, onSelect, isPaused }) => {
  const visibleObjects = React.useMemo(() => objects.filter(obj => !obj.isPlanned), [objects]);

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[600px] bg-black/60 rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden group">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex flex-col gap-1 pointer-events-none">
        <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 w-fit">
          System Overview 3D
        </span>
        <span className="text-[7px] sm:text-[9px] font-mono text-white/30 italic">
          {isPaused ? 'Signal Lost • Interface Frozen' : 'Drag to explore • Scroll to zoom • Click planets'}
        </span>
      </div>

      <ErrorBoundary>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 30, 50]} fov={45} />
          <Suspense fallback={null}>
            <Stars radius={150} depth={50} count={5000} factor={4} saturation={0} fade speed={isPaused ? 0 : 1} />
            <Nebula />
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 0, 0]} intensity={2.5} color="#FDB813" />
            <directionalLight position={[10, 20, 10]} intensity={1} />
            
            {visibleObjects.map((obj) => (
              <PlanetNode 
                key={obj.id} 
                obj={obj} 
                selectedId={selectedId} 
                onSelect={onSelect} 
                isPaused={isPaused}
              />
            ))}

            <ContactShadows position={[0, -10, 0]} opacity={0.3} scale={100} blur={2} far={20} />
          </Suspense>
          <OrbitControls 
            enablePan={!isPaused} 
            enableZoom={!isPaused} 
            enableRotate={!isPaused}
            minDistance={10} 
            maxDistance={150}
            makeDefault
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};
