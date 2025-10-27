import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedSphere({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.15}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Warm colored floating spheres */}
      <AnimatedSphere position={[-3, 0, -5]} color="#FF6B6B" speed={0.5} />
      <AnimatedSphere position={[3, 1, -6]} color="#FFD93D" speed={0.7} />
      <AnimatedSphere position={[0, -1, -4]} color="#6BCB77" speed={0.6} />
      <AnimatedSphere position={[-2, 2, -7]} color="#4D96FF" speed={0.8} />
      <AnimatedSphere position={[2, -2, -5]} color="#FF8FB1" speed={0.4} />
    </>
  );
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-40">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
