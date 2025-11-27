import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function FloatingParticles({ count = 2000, color = "#8FB9FF" }) {
  const ref = useRef<THREE.Points>(null);
  const [sphere] = useState(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  });

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.075;
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function FloatingShape({ position, color, type = "box" }: { position: [number, number, number], color: string, type?: "box" | "sphere" | "torus" }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.3;
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        {type === "box" && <boxGeometry args={[0.5, 0.5, 0.5]} />}
        {type === "sphere" && <sphereGeometry args={[0.3, 32, 32]} />}
        {type === "torus" && <torusGeometry args={[0.3, 0.1, 16, 100]} />}
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6} 
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

interface AnimatedBackgroundProps {
  particleColor?: string;
  shapeColors?: string[];
  particleCount?: number;
}

export const AnimatedBackground = ({ 
  particleColor = "#8FB9FF", 
  shapeColors = ["#5E8FFF", "#8FB9FF", "#B4C7FF"],
  particleCount = 2000 
}: AnimatedBackgroundProps) => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        <FloatingParticles count={particleCount} color={particleColor} />
        
        <FloatingShape position={[-2, 1, 0]} color={shapeColors[0]} type="box" />
        <FloatingShape position={[2, -1, -1]} color={shapeColors[1]} type="sphere" />
        <FloatingShape position={[0, 2, -2]} color={shapeColors[2]} type="torus" />
        <FloatingShape position={[-1.5, -1.5, 1]} color={shapeColors[0]} type="sphere" />
        <FloatingShape position={[1.5, 1.5, 0.5]} color={shapeColors[1]} type="box" />
      </Canvas>
    </div>
  );
};