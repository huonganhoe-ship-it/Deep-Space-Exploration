import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Planet3DProps {
  id?: string;
  color: string;
  size: number;
  isSun?: boolean;
  type?: 'planet' | 'satellite' | 'star';
  isArtificial?: boolean;
}

export const Planet3D: React.FC<Planet3DProps> = ({ id, color, size, isSun, type = 'planet', isArtificial }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const spacecraftRef = useRef<THREE.Group>(null);

  const scale = size * 0.15;

  // Procedural texture generation for more "real" look
  const surfaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Base color
    context.fillStyle = color;
    context.fillRect(0, 0, 512, 512);
    
    // Add noise/details
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 2;
      context.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    // Add some highlights
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 1.5;
      context.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [color]);

  // Procedural ring texture for Saturn
  const ringTexture = useMemo(() => {
    if (id !== 'saturn') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    
    // Create concentric ring patterns
    for (let i = 0; i < 1024; i++) {
      const opacity = 0.1 + Math.random() * 0.5;
      const colorIntensity = 0.6 + Math.random() * 0.4;
      
      // Saturn ring colors: beige, brown, grey
      const r = Math.floor(200 * colorIntensity);
      const g = Math.floor(180 * colorIntensity);
      const b = Math.floor(150 * colorIntensity);
      
      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      context.fillRect(i, 0, 1, 64);
      
      // Add some gaps (Cassini Division etc)
      if (i > 400 && i < 450) {
        context.clearRect(i, 0, 1, 64);
      }
      if (Math.random() > 0.98) {
        context.clearRect(i, 0, 1, 64);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [id]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      if (isSun) meshRef.current.rotation.x += 0.005;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.01;
      atmosphereRef.current.rotation.x += 0.005;
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.01;
      // Subtle tilt animation
      ringsRef.current.rotation.x = (Math.PI / 2.5) + Math.sin(time * 0.2) * 0.05;
    }

    if (spacecraftRef.current) {
      spacecraftRef.current.rotation.y += 0.02;
      spacecraftRef.current.rotation.z += 0.01;
    }
  });

  if (isArtificial) {
    // Specific models for famous spacecraft
    if (id === 'jwst') {
      return (
        <group ref={spacecraftRef}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            {/* Sunshield (Large flat base) */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[2.2, 1.2, 0.05]} />
              <meshStandardMaterial color="#E5E4E2" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Layered sunshield effect */}
            <mesh castShadow position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[2.1, 1.1, 0.02]} />
              <meshStandardMaterial color="#D3D3D3" transparent opacity={0.6} />
            </mesh>

            {/* Primary Mirror (Hexagonal structure) */}
            <group position={[0, 0.5, -0.2]} rotation={[-Math.PI / 6, 0, 0]}>
              {/* Central Hexagon */}
              <mesh castShadow>
                <cylinderGeometry args={[0.4, 0.4, 0.1, 6]} />
                <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} emissive="#443300" />
              </mesh>
              {/* Surrounding Hexagons (simplified as one larger hex for performance/clarity) */}
              <mesh castShadow position={[0, 0, -0.05]}>
                <cylinderGeometry args={[0.6, 0.6, 0.05, 6]} />
                <meshStandardMaterial color="#B8860B" metalness={0.9} />
              </mesh>
            </group>

            {/* Secondary Mirror Support (Tripod) */}
            <group position={[0, 0.5, -0.2]} rotation={[-Math.PI / 6, 0, 0]}>
              {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
                <mesh key={i} rotation={[0, 0, angle]} position={[0, 0, 0.4]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.8]} />
                  <meshStandardMaterial color="#333333" />
                </mesh>
              ))}
              {/* Secondary Mirror */}
              <mesh position={[0, 0, 0.8]}>
                <cylinderGeometry args={[0.08, 0.08, 0.05, 6]} />
                <meshStandardMaterial color="#FFD700" metalness={1} />
              </mesh>
            </group>

            {/* Spacecraft Bus (Bottom part) */}
            <mesh castShadow position={[0, -0.2, 0.1]}>
              <boxGeometry args={[0.4, 0.3, 0.4]} />
              <meshStandardMaterial color="#CD7F32" metalness={0.7} />
            </mesh>
            
            {/* Solar Panel */}
            <mesh position={[0, -0.4, 0.4]} rotation={[Math.PI / 4, 0, 0]}>
              <boxGeometry args={[0.6, 0.02, 0.3]} />
              <meshStandardMaterial color="#2F4F4F" emissive="#001111" />
            </mesh>
          </Float>
        </group>
      );
    }


    if (id === 'artemis2') return null;

    if (id === 'hubble') {
      return (
        <group ref={spacecraftRef}>
          <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
            {/* Main Body (Cylinder) */}
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 1.2, 32]} />
              <meshStandardMaterial color="#E5E4E2" metalness={1} roughness={0.1} />
            </mesh>
            
            {/* Front Aperture (Slightly wider) */}
            <mesh castShadow position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.28, 0.25, 0.2, 32]} />
              <meshStandardMaterial color="#C0C0C0" metalness={1} />
            </mesh>

            {/* Aperture Door (Open) */}
            <mesh position={[0.7, 0.25, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.02, 0.5]} />
              <meshStandardMaterial color="#E5E4E2" metalness={1} />
            </mesh>

            {/* Solar Panels */}
            {[1, -1].map((side) => (
              <group key={side} position={[0, 0, side * 0.4]}>
                {/* Support Arm */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.3]} />
                  <meshStandardMaterial color="#333333" />
                </mesh>
                {/* Panel */}
                <mesh position={[0, 0, side * 0.3]} rotation={[0, 0, 0]}>
                  <boxGeometry args={[0.8, 0.02, 0.4]} />
                  <meshStandardMaterial color="#2F4F4F" emissive="#001111" />
                </mesh>
              </group>
            ))}

            {/* Rear Section (Equipment Bay) */}
            <mesh castShadow position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.3, 8]} />
              <meshStandardMaterial color="#BCC6CC" metalness={0.8} />
            </mesh>

            {/* Antennas */}
            <mesh position={[-0.4, 0.3, 0.2]} rotation={[0.5, 0, 0.5]}>
              <cylinderGeometry args={[0.01, 0.01, 0.4]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[-0.4, 0.3, -0.2]} rotation={[-0.5, 0, 0.5]}>
              <cylinderGeometry args={[0.01, 0.01, 0.4]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </Float>
        </group>
      );
    }

    if (size === 3) { // Apollo 11 (based on size in data)
      return (
        <group ref={spacecraftRef}>
          <Float speed={3} rotationIntensity={1} floatIntensity={1}>
            {/* Command & Service Module */}
            <mesh castShadow position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
              <meshStandardMaterial color="#E5E4E2" metalness={0.9} roughness={0.1} emissive="#222222" />
            </mesh>
            <mesh castShadow position={[0, 0.9, 0]}>
              <coneGeometry args={[0.3, 0.3, 32]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.9} emissive="#111111" />
            </mesh>
            {/* Lunar Module (simplified) */}
            <mesh castShadow position={[0, -0.2, 0]}>
              <boxGeometry args={[0.5, 0.4, 0.5]} />
              <meshStandardMaterial color="#CD7F32" metalness={0.6} roughness={0.4} emissive="#221100" />
            </mesh>
            {/* Legs */}
            {[[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map((pos, i) => (
              <group key={i} position={[pos[0], -0.3, pos[1]]}>
                {/* Leg Strut - angled out */}
                <mesh rotation={[pos[0] > 0 ? -0.5 : 0.5, 0, pos[1] > 0 ? 0.5 : -0.5]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.6]} />
                  <meshStandardMaterial color="#8B4513" metalness={0.8} />
                </mesh>
                {/* Footpad - at the end of the strut */}
                <mesh position={[pos[0] > 0 ? 0.15 : -0.15, -0.25, pos[1] > 0 ? -0.15 : 0.15]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
                  <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.2} emissive="#110800" />
                </mesh>
              </group>
            ))}
          </Float>
        </group>
      );
    }

    if (size === 2.5) { // ISS
      return (
        <group ref={spacecraftRef}>
          <Float speed={4} rotationIntensity={1} floatIntensity={1}>
            {/* Main Modules */}
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
              <meshStandardMaterial color="#E5E4E2" metalness={0.8} />
            </mesh>
            {/* Solar Arrays */}
            {[[-0.4, 0.3], [-0.4, -0.3], [0.4, 0.3], [0.4, -0.3]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0, pos[1]]}>
                <boxGeometry args={[0.1, 0.02, 0.6]} />
                <meshStandardMaterial color="#2F4F4F" emissive="#001111" />
              </mesh>
            ))}
            {/* Central Truss */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.2, 0.05, 0.05]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
          </Float>
        </group>
      );
    }

    if (size === 2) { // Sputnik 1
      return (
        <group ref={spacecraftRef}>
          <Float speed={4} rotationIntensity={2} floatIntensity={1}>
            {/* Main Sphere */}
            <mesh castShadow>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="#BCC6CC" metalness={1} roughness={0.05} />
            </mesh>
            {/* Antennas */}
            {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map((dir, i) => (
              <mesh key={i} position={[dir[0] * 0.2, dir[1] * 0.2, 0]} rotation={[0, 0, Math.PI / 4 * dir[0] * dir[1]]}>
                <cylinderGeometry args={[0.01, 0.01, 1.5]} />
                <meshStandardMaterial color="#BCC6CC" metalness={1} />
              </mesh>
            ))}
          </Float>
        </group>
      );
    }

    if (id === 'eht') {
      return (
        <group ref={spacecraftRef}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            {/* Ground-based Array Representation */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <circleGeometry args={[1.5, 32]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Telescope Dishes */}
            {[
              [0.5, 0.5], [-0.5, 0.5], [0.8, -0.3], [-0.7, -0.4], [0, 0]
            ].map((pos, i) => (
              <group key={i} position={[pos[0], -0.4, pos[1]]}>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                  <meshStandardMaterial color="#444444" />
                </mesh>
                <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 4, 0, 0]}>
                  <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color="#cccccc" side={THREE.DoubleSide} />
                </mesh>
              </group>
            ))}
            {/* Image Overlay (The one user sent) */}
            <mesh position={[0, 0.5, -0.5]} rotation={[0, 0, 0]}>
              <planeGeometry args={[2.5, 1.5]} />
              <meshBasicMaterial 
                map={new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/ESO_ALMA_Antennas_under_the_Milky_Way.jpg/640px-ESO_ALMA_Antennas_under_the_Milky_Way.jpg')} 
                transparent 
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Float>
        </group>
      );
    }

    // Default Spacecraft model (Voyager, etc.)
    return (
      <group ref={spacecraftRef}>
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
          {/* Main Body */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Antenna/Dish */}
          <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.4, 0.2, 32]} />
            <meshStandardMaterial color="#E5E4E2" metalness={0.8} />
          </mesh>
          {/* Solar Panels or Booms */}
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.8, 0.1, 0.3]} />
            <meshStandardMaterial color="#2F4F4F" emissive="#001111" />
          </mesh>
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.8, 0.1, 0.3]} />
            <meshStandardMaterial color="#2F4F4F" emissive="#001111" />
          </mesh>
        </Float>
      </group>
    );
  }

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      {/* Main Planet Body */}
      <Sphere ref={meshRef} args={[scale, 64, 64]} castShadow receiveShadow>
        {isSun ? (
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.4}
            radius={1}
            emissive={color}
            emissiveIntensity={2}
          />
        ) : (
          <meshStandardMaterial 
            map={surfaceTexture}
            roughness={0.8}
            metalness={0.1}
            bumpScale={0.05}
          />
        )}
      </Sphere>

      {/* Saturn's Rings */}
      {id === 'saturn' && ringTexture && (
        <group ref={ringsRef} rotation={[Math.PI / 2.5, 0, 0]}>
          {/* Main Ring Disk */}
          <mesh receiveShadow castShadow>
            <ringGeometry args={[scale * 1.4, scale * 2.4, 128]} />
            <meshStandardMaterial 
              map={ringTexture} 
              transparent 
              opacity={0.8} 
              side={THREE.DoubleSide}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          {/* Subtle Outer Ring */}
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[scale * 2.45, scale * 2.6, 128]} />
            <meshStandardMaterial 
              color="#C5AB6E" 
              transparent 
              opacity={0.2} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </group>
      )}

      {/* Atmosphere/Cloud Layer (only for planets) */}
      {!isSun && type === 'planet' && (
        <Sphere ref={atmosphereRef} args={[scale * 1.02, 64, 64]}>
          <meshStandardMaterial 
            color="white" 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </Sphere>
      )}

      {/* Glow effect */}
      <Sphere args={[scale * 1.1, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </Float>
  );
};
