import React, { Suspense, Component, ErrorInfo, ReactNode, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Stars } from '@react-three/drei';
import { Planet3D } from './Planet3D';
import { CelestialObject } from '../data/solarSystem';
import * as THREE from 'three';

interface ModelViewerProps {
  object: CelestialObject;
}

const MovingStars = () => {
  const starsRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0005;
      starsRef.current.rotation.x += 0.0002;
    }
  });
  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Viewer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-900/10 text-red-400 text-xs font-mono p-4 text-center">
          3D Rendering Failed. Your browser may not support WebGL.
        </div>
      );
    }
    return this.props.children;
  }
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ object }) => {
  const isEHT = object.id === 'eht';
  
  return (
    <div className={`w-full h-[300px] relative overflow-hidden group ${isEHT ? '' : 'bg-black/40 rounded-2xl border border-white/10'}`}>
      {!isEHT && (
        <div className="absolute top-4 left-4 z-10">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 bg-black/60 px-2 py-1 rounded border border-white/5">
            Interactive 3D View
          </span>
        </div>
      )}
      
      <ErrorBoundary>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
          <Suspense fallback={null}>
            <MovingStars />
            <ambientLight intensity={1.2} />
            <pointLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} castShadow />
            
            <Planet3D 
              id={object.id}
              color={object.color} 
              size={object.size} 
              isSun={object.id === 'sun'} 
              type={object.type}
              isArtificial={object.isArtificial}
            />
            
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          </Suspense>
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={3} 
            maxDistance={10}
            autoRotate={false}
          />
        </Canvas>
      </ErrorBoundary>

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] font-mono text-white/30 italic">
          Drag to rotate • Scroll to zoom
        </span>
      </div>
    </div>
  );
};
