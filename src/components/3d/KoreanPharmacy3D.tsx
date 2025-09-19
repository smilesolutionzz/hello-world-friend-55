import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

// 한약방 컴포넌트
const KoreanPharmacy = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // 부드러운 회전 애니메이션
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.03;
    }
  });

  // 한약방 색상 팔레트
  const woodColor = '#8B4513';
  const darkWoodColor = '#654321';
  const herbColor = '#228B22';
  const jarColor = '#CD853F';
  const wallColor = '#F5DEB3';
  const shelfColor = '#DEB887';

  return (
    <group ref={groupRef}>
      {/* 바닥 (한옥 마루) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshLambertMaterial color={woodColor} />
      </mesh>

      {/* 뒷벽 */}
      <mesh position={[0, 4, -10]}>
        <planeGeometry args={[25, 14]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      
      {/* 좌측벽 */}
      <mesh position={[-10, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 14]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>

      {/* 한약장 (메인) */}
      <group position={[0, 0, -7]}>
        {/* 기본 프레임 */}
        <mesh>
          <boxGeometry args={[8, 6, 1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        
        {/* 서랍들 - 6x4 격자 */}
        {Array.from({ length: 6 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => (
            <group key={`${row}-${col}`} position={[-2.8 + col * 1.4, 2.2 - row * 0.8, 0.3]}>
              <mesh>
                <boxGeometry args={[1.2, 0.7, 0.4]} />
                <meshLambertMaterial color={shelfColor} />
              </mesh>
              {/* 손잡이 */}
              <mesh position={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                <meshLambertMaterial color={darkWoodColor} />
              </mesh>
              {/* 한자 라벨 */}
              <Text
                position={[0, 0, 0.21]}
                fontSize={0.15}
                color="#8B4513"
                anchorX="center"
                anchorY="middle"
              >
                {['人蔘', '當歸', '川芎', '白芍', '熟地', '甘草', '陳皮', '半夏', '白朮', '茯苓', '桂枝', '乾薑', '附子', '黃芪', '防風', '荊芥', '薄荷', '連翹', '金銀花', '板藍根', '黃連', '黃柏', '知母', '石膏'][row * 4 + col] || '藥材'}
              </Text>
            </group>
          ))
        )}
      </group>

      {/* 좌측 한약장 */}
      <group position={[-6, 0, -4]}>
        <mesh>
          <boxGeometry args={[2, 8, 1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        {/* 약재병들 */}
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i} position={[0, 3.5 - i * 0.9, 0.8]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 0.7, 8]} />
              <meshLambertMaterial color={jarColor} />
            </mesh>
            {/* 약재 내용물 */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.25, 0.35, 0.5, 8]} />
              <meshLambertMaterial color={herbColor} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 우측 한약장 */}
      <group position={[6, 0, -4]}>
        <mesh>
          <boxGeometry args={[2, 8, 1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        {/* 약재병들 */}
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i} position={[0, 3.5 - i * 0.9, 0.8]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 0.7, 8]} />
              <meshLambertMaterial color={jarColor} />
            </mesh>
            {/* 약재 내용물 (다른 색상) */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.25, 0.35, 0.5, 8]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 작업대 */}
      <group position={[0, -1, 2]}>
        <mesh>
          <boxGeometry args={[4, 0.2, 2]} />
          <meshLambertMaterial color={woodColor} />
        </mesh>
        {/* 다리들 */}
        <mesh position={[-1.8, -0.8, 0.8]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        <mesh position={[1.8, -0.8, 0.8]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        <mesh position={[-1.8, -0.8, -0.8]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        <mesh position={[1.8, -0.8, -0.8]}>
          <boxGeometry args={[0.1, 1.4, 0.1]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
      </group>

      {/* 저울 */}
      <group position={[-1, -0.7, 2]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshLambertMaterial color="#8B7D6B" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.1]} />
          <meshLambertMaterial color="#8B7D6B" />
        </mesh>
        {/* 저울접시 */}
        <mesh position={[-0.3, 0.25, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.05, 16]} />
          <meshLambertMaterial color="#CD853F" />
        </mesh>
        <mesh position={[0.3, 0.25, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.05, 16]} />
          <meshLambertMaterial color="#CD853F" />
        </mesh>
      </group>

      {/* 약연 (절구) */}
      <group position={[1.5, -0.7, 1.5]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.2, 0.3, 16]} />
          <meshLambertMaterial color="#2F4F4F" />
        </mesh>
        {/* 약연 막대 */}
        <mesh position={[0.1, 0.3, 0.1]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
      </group>

      {/* 한약 포장지들 */}
      <group position={[0.5, -0.6, 1]}>
        <mesh>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshLambertMaterial color="#F5DEB3" />
        </mesh>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshLambertMaterial color="#F5DEB3" />
        </mesh>
        <mesh position={[0.2, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshLambertMaterial color="#F5DEB3" />
        </mesh>
      </group>

      {/* 전통 의자 */}
      <group position={[-3, -1.5, 4]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshLambertMaterial color={woodColor} />
        </mesh>
        <mesh position={[0, 1.2, -0.4]}>
          <boxGeometry args={[1, 1.2, 0.1]} />
          <meshLambertMaterial color={woodColor} />
        </mesh>
        {/* 다리들 */}
        <mesh position={[-0.4, 0, 0.4]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        <mesh position={[0.4, 0, 0.4]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        <mesh position={[-0.4, 0, -0.4]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
        <mesh position={[0.4, 0, -0.4]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshLambertMaterial color={darkWoodColor} />
        </mesh>
      </group>

      {/* 조명 효과 */}
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#FFE4B5" />
      <pointLight position={[-5, 4, -3]} intensity={0.5} color="#F0E68C" />
      <pointLight position={[5, 4, -3]} intensity={0.5} color="#F0E68C" />
      <spotLight 
        position={[0, 8, 5]} 
        intensity={0.6} 
        angle={0.3} 
        penumbra={0.5}
        color="#FFEAA7"
      />
    </group>
  );
};

// 떠다니는 약재 파티클
const HerbParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(80 * 3);
    for (let i = 0; i < 80; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 12 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.005;
        // 약재 향기처럼 위로 올라가는 효과
        if (positions[i + 1] > 12) {
          positions[i + 1] = 1;
        }
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
        size={0.08} 
        color="#9ACD32" 
        transparent 
        opacity={0.7}
        sizeAttenuation={true}
      />
    </points>
  );
};

interface KoreanPharmacy3DProps {
  children?: React.ReactNode;
}

const KoreanPharmacy3D = ({ children }: KoreanPharmacy3DProps) => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 3, 12]} fov={65} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.4} color="#F5E6D3" />
        <directionalLight 
          position={[15, 15, 10]} 
          intensity={1.2} 
          color="#FFE4B5"
          castShadow
        />
        
        {/* 환경 - 따뜻한 한약방 느낌 */}
        <Environment preset="warehouse" />
        
        {/* 3D 한약방 */}
        <KoreanPharmacy />
        
        {/* 떠다니는 약재 파티클 */}
        <HerbParticles />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          target={[0, 1, 0]}
        />
      </Canvas>
      
      {/* 콘텐츠는 3D 배경 위에 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10">
        {children}
      </div>
    </div>
  );
};

export default KoreanPharmacy3D;