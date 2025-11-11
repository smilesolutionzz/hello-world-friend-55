import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CounselorNPCProps {
  position: [number, number, number];
  isSpeaking?: boolean;
  name?: string;
}

export const CounselorNPC = ({ 
  position, 
  isSpeaking = false,
  name = "AI 상담사"
}: CounselorNPCProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // 부드러운 호흡 애니메이션
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      groupRef.current.position.y = position[1] + breathe;

      // 말할 때 더 크게 움직임
      if (isSpeaking) {
        const speak = Math.sin(state.clock.elapsedTime * 8) * 0.05;
        groupRef.current.scale.setScalar(1.8 + speak);
      }
    }

    // 말할 때 빛 강도 변화
    if (lightRef.current && isSpeaking) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
    } else if (lightRef.current) {
      lightRef.current.intensity = 1.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 머리 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* 몸 */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.8, 8, 8]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>

      {/* 왼팔 */}
      <mesh position={[-0.35, 0.8, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 6, 6]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* 오른팔 */}
      <mesh position={[0.35, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 6, 6]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* 왼다리 */}
      <mesh position={[-0.15, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 6, 6]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* 오른다리 */}
      <mesh position={[0.15, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 6, 6]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* 이름 라벨 */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>

      {/* 상담사 빛 효과 */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 0]}
        intensity={1.5}
        distance={3}
        color={isSpeaking ? "#FFD700" : "#87CEEB"}
      />

      {/* 말할 때 파티클 효과 */}
      {isSpeaking && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={15}
              array={new Float32Array(Array.from({ length: 45 }, () => (Math.random() - 0.5) * 1.5))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.08}
            color="#FFD700"
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}

      {/* 상담사 오라 */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color="#87CEEB"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
