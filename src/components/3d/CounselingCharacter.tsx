import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Box, Cylinder, Cone } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterType } from '@/utils/CounselingQuestions';

interface CounselingCharacterProps {
  character: CharacterType;
  position?: [number, number, number];
  scale?: number;
}

export const CounselingCharacter = ({ 
  character, 
  position = [0, 1, -3],
  scale = 1 
}: CounselingCharacterProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // 부드러운 떠다니는 애니메이션
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const renderCharacter = () => {
    switch (character) {
      case 'elephant':
        return (
          <group scale={scale}>
            {/* 몸통 */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#A8DADC" />
            </Sphere>
            {/* 코 */}
            <Cylinder args={[0.15, 0.2, 1.2, 16]} position={[0, -0.3, 0.8]} rotation={[Math.PI / 6, 0, 0]}>
              <meshStandardMaterial color="#8AC4C8" />
            </Cylinder>
            {/* 귀 */}
            <Sphere args={[0.4, 16, 16]} position={[-0.7, 0.4, 0]}>
              <meshStandardMaterial color="#A8DADC" />
            </Sphere>
            <Sphere args={[0.4, 16, 16]} position={[0.7, 0.4, 0]}>
              <meshStandardMaterial color="#A8DADC" />
            </Sphere>
            {/* 눈 */}
            <Sphere args={[0.1, 16, 16]} position={[-0.3, 0.3, 0.7]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            <Sphere args={[0.1, 16, 16]} position={[0.3, 0.3, 0.7]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
          </group>
        );

      case 'bear':
        return (
          <group scale={scale}>
            {/* 몸통 */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Sphere>
            {/* 얼굴 */}
            <Sphere args={[0.4, 16, 16]} position={[0, 0, 0.7]}>
              <meshStandardMaterial color="#A0714F" />
            </Sphere>
            {/* 귀 */}
            <Sphere args={[0.25, 16, 16]} position={[-0.5, 0.6, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Sphere>
            <Sphere args={[0.25, 16, 16]} position={[0.5, 0.6, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Sphere>
            {/* 눈 */}
            <Sphere args={[0.08, 16, 16]} position={[-0.15, 0.15, 0.95]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            <Sphere args={[0.08, 16, 16]} position={[0.15, 0.15, 0.95]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            {/* 코 */}
            <Sphere args={[0.08, 16, 16]} position={[0, 0, 1.05]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
          </group>
        );

      case 'rabbit':
        return (
          <group scale={scale}>
            {/* 몸통 */}
            <Sphere args={[0.7, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#FFB6C1" />
            </Sphere>
            {/* 얼굴 */}
            <Sphere args={[0.5, 16, 16]} position={[0, 0.1, 0.6]}>
              <meshStandardMaterial color="#FFC9D3" />
            </Sphere>
            {/* 긴 귀 */}
            <Cylinder args={[0.1, 0.15, 1, 16]} position={[-0.3, 1, 0]} rotation={[0.3, 0, -0.2]}>
              <meshStandardMaterial color="#FFB6C1" />
            </Cylinder>
            <Cylinder args={[0.1, 0.15, 1, 16]} position={[0.3, 1, 0]} rotation={[0.3, 0, 0.2]}>
              <meshStandardMaterial color="#FFB6C1" />
            </Cylinder>
            {/* 눈 */}
            <Sphere args={[0.08, 16, 16]} position={[-0.2, 0.2, 0.95]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            <Sphere args={[0.08, 16, 16]} position={[0.2, 0.2, 0.95]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            {/* 코 */}
            <Sphere args={[0.06, 16, 16]} position={[0, 0.05, 1.05]}>
              <meshStandardMaterial color="#FF69B4" />
            </Sphere>
          </group>
        );

      case 'fox':
        return (
          <group scale={scale}>
            {/* 몸통 */}
            <Sphere args={[0.7, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#FF6347" />
            </Sphere>
            {/* 얼굴 (뾰족한 형태) */}
            <Cone args={[0.5, 0.8, 4]} position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#FF7F5C" />
            </Cone>
            {/* 귀 (삼각형) */}
            <Cone args={[0.2, 0.5, 3]} position={[-0.4, 0.7, 0]} rotation={[0, 0, -0.3]}>
              <meshStandardMaterial color="#FF6347" />
            </Cone>
            <Cone args={[0.2, 0.5, 3]} position={[0.4, 0.7, 0]} rotation={[0, 0, 0.3]}>
              <meshStandardMaterial color="#FF6347" />
            </Cone>
            {/* 눈 */}
            <Sphere args={[0.08, 16, 16]} position={[-0.2, 0.2, 1]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            <Sphere args={[0.08, 16, 16]} position={[0.2, 0.2, 1]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
          </group>
        );

      case 'owl':
        return (
          <group scale={scale}>
            {/* 몸통 */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]} scale={[1, 1.2, 1]}>
              <meshStandardMaterial color="#6B4423" />
            </Sphere>
            {/* 배 (밝은 색) */}
            <Sphere args={[0.5, 16, 16]} position={[0, -0.2, 0.7]}>
              <meshStandardMaterial color="#8B6F47" />
            </Sphere>
            {/* 큰 눈 */}
            <Sphere args={[0.25, 16, 16]} position={[-0.25, 0.3, 0.75]}>
              <meshStandardMaterial color="#FFFFFF" />
            </Sphere>
            <Sphere args={[0.25, 16, 16]} position={[0.25, 0.3, 0.75]}>
              <meshStandardMaterial color="#FFFFFF" />
            </Sphere>
            {/* 눈동자 */}
            <Sphere args={[0.12, 16, 16]} position={[-0.25, 0.3, 0.95]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            <Sphere args={[0.12, 16, 16]} position={[0.25, 0.3, 0.95]}>
              <meshStandardMaterial color="#000000" />
            </Sphere>
            {/* 부리 */}
            <Cone args={[0.15, 0.3, 4]} position={[0, 0.1, 1]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#FFA500" />
            </Cone>
            {/* 귀 깃털 */}
            <Cone args={[0.1, 0.4, 3]} position={[-0.5, 0.8, 0]} rotation={[0, 0, -0.5]}>
              <meshStandardMaterial color="#6B4423" />
            </Cone>
            <Cone args={[0.1, 0.4, 3]} position={[0.5, 0.8, 0]} rotation={[0, 0, 0.5]}>
              <meshStandardMaterial color="#6B4423" />
            </Cone>
          </group>
        );

      default:
        return null;
    }
  };

  const getCharacterName = () => {
    const names = {
      elephant: '코끼리 선생님',
      bear: '곰돌이 선생님',
      rabbit: '토끼 선생님',
      fox: '여우 선생님',
      owl: '올빼미 선생님'
    };
    return names[character];
  };

  return (
    <group ref={groupRef} position={position}>
      {renderCharacter()}
      
      {/* 캐릭터 이름 표시 */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {getCharacterName()}
      </Text>
      
      {/* 부드러운 빛 효과 */}
      <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffffff" />
    </group>
  );
};
