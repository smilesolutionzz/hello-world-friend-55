import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

const FloatingShape = ({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) => {
  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.5, 0.5]}
    >
      <mesh position={position}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
};

const ParticleRing = () => {
  const count = 100;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 8 + Math.random() * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

const Scene = () => {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      
      {/* Floating shapes */}
      <FloatingShape position={[-3, 2, -5]} color="#8b5cf6" speed={1.5} />
      <FloatingShape position={[3, -2, -5]} color="#3b82f6" speed={1.2} />
      <FloatingShape position={[0, 0, -8]} color="#6366f1" speed={1} />
      
      {/* Central sphere with distortion */}
      <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <Sphere args={[2, 64, 64]} position={[0, 0, -5]}>
          <MeshDistortMaterial
            color="#7c3aed"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.3}
          />
        </Sphere>
      </Float>
      
      {/* Particle ring */}
      <ParticleRing />
      
      {/* Stars */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      {/* Orbit controls for subtle movement */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export const MetaverseBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};
