import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

// Room components
const Room = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // 부드러운 회전 애니메이션
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  // 따뜻한 색상 팔레트
  const woodColor = '#8B4513';
  const sofaColor = '#D2B48C';
  const carpetColor = '#CD853F';
  const wallColor = '#F5F5DC';

  return (
    <group ref={groupRef}>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color={carpetColor} />
      </mesh>

      {/* 벽들 */}
      <mesh position={[0, 3, -8]}>
        <planeGeometry args={[20, 10]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 10]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>

      {/* 소파 */}
      <group position={[-2, -1, 2]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3, 1, 1.5]} />
          <meshLambertMaterial color={sofaColor} />
        </mesh>
        <mesh position={[0, 1.2, -0.5]}>
          <boxGeometry args={[3, 1.4, 0.3]} />
          <meshLambertMaterial color={sofaColor} />
        </mesh>
      </group>

      {/* 의자 (상담사용) */}
      <group position={[2, -1, 1]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.2, 1, 1.2]} />
          <meshLambertMaterial color="#8B7D6B" />
        </mesh>
        <mesh position={[0, 1.5, -0.4]}>
          <boxGeometry args={[1.2, 1.5, 0.2]} />
          <meshLambertMaterial color="#8B7D6B" />
        </mesh>
      </group>

      {/* 테이블 */}
      <group position={[0, -0.5, 2]}>
        <mesh>
          <cylinderGeometry args={[1, 1, 0.2, 16]} />
          <meshLambertMaterial color={woodColor} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 8]} />
          <meshLambertMaterial color={woodColor} />
        </mesh>
      </group>

      {/* 책장 */}
      <group position={[-6, 1, -4]}>
        <mesh>
          <boxGeometry args={[1.5, 4, 0.3]} />
          <meshLambertMaterial color={woodColor} />
        </mesh>
        {/* 책들 */}
        <mesh position={[0.1, 1, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.1]} />
          <meshLambertMaterial color="#FF6B6B" />
        </mesh>
        <mesh position={[0.1, 0.5, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.1]} />
          <meshLambertMaterial color="#4ECDC4" />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.1]} />
          <meshLambertMaterial color="#45B7D1" />
        </mesh>
      </group>

      {/* 화분 */}
      <group position={[3, -1, -3]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 8]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshLambertMaterial color="#228B22" />
        </mesh>
      </group>

      {/* 조명 효과 */}
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFE4B5" />
      <pointLight position={[-4, 3, -2]} intensity={0.4} color="#FFE4B5" />
      <pointLight position={[4, 3, -2]} intensity={0.4} color="#FFE4B5" />
    </group>
  );
};

// 떠다니는 파티클 효과
const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#E6E6FA" 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

interface CounselingRoomProps {
  children?: React.ReactNode;
}

const CounselingRoom = ({ children }: CounselingRoomProps) => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.6} color="#F0F8FF" />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          color="#FFE4B5"
          castShadow
        />
        
        {/* 환경 */}
        <Environment preset="sunset" />
        
        {/* 3D 상담실 */}
        <Room />
        
        {/* 떠다니는 파티클 */}
        <FloatingParticles />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {/* 콘텐츠는 3D 배경 위에 오버레이 */}
      <div className="absolute inset-0 bg-black/10">
        {children}
      </div>
    </div>
  );
};

export default CounselingRoom;