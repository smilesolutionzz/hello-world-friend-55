import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 홀로그램 구체 컴포넌트
function HologramSphere({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // 부드러운 떠다니는 애니메이션
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
    
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = meshRef.current?.rotation.x || 0;
      wireframeRef.current.rotation.y = meshRef.current?.rotation.y || 0;
      wireframeRef.current.position.copy(meshRef.current?.position || new THREE.Vector3());
    }
  });

  return (
    <group>
      {/* 반투명 홀로그램 구체 */}
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0}
          metalness={0.9}
          transparent
          opacity={0.4}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* 와이어프레임 오버레이 */}
      <lineSegments ref={wireframeRef}>
        <edgesGeometry args={[new THREE.SphereGeometry(1, 32, 32)]} />
        <lineBasicMaterial color={color} transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

// 홀로그램 그리드
function HologramGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = -2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      gridRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[20, 20, '#00ffff', '#0088ff']}
      position={[0, -2, 0]}
    />
  );
}

// 홀로그램 파티클 필드
function HologramParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particlesCount = 2000;
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      
      // 청록색/보라색 홀로그램 색상
      const color = new THREE.Color();
      color.setHSL(Math.random() > 0.5 ? 0.5 : 0.75, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
      
      // 파티클 깜박임 효과
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 홀로그램 링
function HologramRing({ radius, color }: { radius: number, color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      ringRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.05, 16, 100]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.5}
        emissive={color}
        emissiveIntensity={0.8}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        {/* 홀로그램 배경색 */}
        <color attach="background" args={['#000508']} />
        <fog attach="fog" args={['#000508', 8, 25]} />
        
        {/* 홀로그램 조명 */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#0088ff" />
        <pointLight position={[0, -5, 5]} intensity={0.8} color="#ff00ff" />
        <spotLight position={[0, 15, 0]} intensity={1.2} color="#00ffff" angle={0.5} />
        
        {/* 홀로그램 구체들 */}
        <HologramSphere position={[-4, 0, -3]} color="#00ffff" speed={0.4} />
        <HologramSphere position={[4, -1, -4]} color="#0088ff" speed={0.6} />
        <HologramSphere position={[0, 3, -5]} color="#ff00ff" speed={0.5} />
        
        {/* 홀로그램 링들 */}
        <HologramRing radius={2} color="#00ffff" />
        <HologramRing radius={3} color="#0088ff" />
        
        {/* 홀로그램 파티클 */}
        <HologramParticles />
        
        {/* 홀로그램 그리드 */}
        <HologramGrid />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* 홀로그램 스캔라인 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #00ffff 0px, transparent 1px, transparent 2px, #00ffff 3px)',
            animation: 'scan 8s linear infinite'
          }}
        />
      </div>
      
      {/* 홀로그램 글로우 효과 */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
