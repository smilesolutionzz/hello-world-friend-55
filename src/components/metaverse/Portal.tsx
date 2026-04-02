import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface PortalProps {
  position: [number, number, number];
  rotation: [number, number, number];
  targetSpace: string;
  label: string;
  color: string;
  onEnter: () => void;
  playerPosition?: THREE.Vector3;
}

export const Portal = ({ 
  position, 
  rotation,
  targetSpace, 
  label, 
  color, 
  onEnter,
  playerPosition 
}: PortalProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [isNear, setIsNear] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // 포탈 회전 애니메이션
      meshRef.current.rotation.y += 0.01;
      
      // 빛나는 효과
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }

    if (particlesRef.current) {
      // 파티클 회전
      particlesRef.current.rotation.y -= 0.005;
    }

    // 플레이어 위치 확인
    if (playerPosition && meshRef.current) {
      const distance = playerPosition.distanceTo(
        new THREE.Vector3(...position)
      );
      
      const wasNear = isNear;
      const nowNear = distance < 2;
      
      if (nowNear !== wasNear) {
        setIsNear(nowNear);
      }

      // 자동 진입 (거리 1.5m 이내)
      if (distance < 1.5) {
        onEnter();
      }
    }
  });

  // 파티클 생성
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  return (
    <group position={position} rotation={rotation}>
      {/* 포탈 프레임 */}
      <mesh position={[0, 2, 0]}>
        <torusGeometry args={[2, 0.2, 16, 50]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 포탈 면 */}
      <mesh ref={meshRef} position={[0, 2, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 파티클 효과 */}
      <points ref={particlesRef} position={[0, 2, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={color}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* 라벨 */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.4}
        color={isNear ? "#ffffff" : color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {label}
      </Text>

      {/* 안내 메시지 (가까이 있을 때) */}
      {isNear && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          금색 빛기둥을 클릭하여 이동하세요
        </Text>
      )}

      {/* 바닥 빛 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNear ? 0.5 : 0.3}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};
