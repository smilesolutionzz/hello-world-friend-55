import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Text3D, useHelper } from '@react-three/drei';
import * as THREE from 'three';

// Floating particles component
function HerbalParticles() {
  const ref = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#d4af37"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

// Floating herbal elements
function FloatingHerb({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshLambertMaterial color="#8b5a2b" transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

// Traditional medicine bottles/jars
function MedicineJar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.2 + position[0]) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.4, 0.5, 1.2, 8]} />
          <meshLambertMaterial color="#654321" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
          <meshLambertMaterial color="#8b4513" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

// Floating leaves
function FloatingLeaf({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.8;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <Float speed={1} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshLambertMaterial 
          color="#228b22" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

// Main 3D scene
function HerbalClinicScene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} color="#f0e68c" />
      
      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color="#fff8dc"
        castShadow
      />
      
      {/* Secondary warm light */}
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#daa520" />
      
      {/* Floating particles */}
      <HerbalParticles />
      
      {/* Herbal elements */}
      <FloatingHerb position={[-8, 2, -5]} />
      <FloatingHerb position={[6, -3, -8]} />
      <FloatingHerb position={[-4, -2, -10]} />
      <FloatingHerb position={[8, 4, -6]} />
      
      {/* Medicine jars */}
      <MedicineJar position={[-12, 1, -8]} />
      <MedicineJar position={[10, -1, -12]} />
      <MedicineJar position={[2, 3, -15]} />
      
      {/* Floating leaves */}
      <FloatingLeaf position={[-6, 5, -4]} />
      <FloatingLeaf position={[4, -5, -6]} />
      <FloatingLeaf position={[-10, -4, -7]} />
      <FloatingLeaf position={[12, 2, -9]} />
      <FloatingLeaf position={[-2, 6, -11]} />
      <FloatingLeaf position={[7, -2, -13]} />
    </>
  );
}

// Main component
export default function HerbalClinic3DBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        performance={{ min: 0.8 }}
      >
        <HerbalClinicScene />
      </Canvas>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-green-50/50 to-blue-50/60" />
      
      {/* Traditional pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}