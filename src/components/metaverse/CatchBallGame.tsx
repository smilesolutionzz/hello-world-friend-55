import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CatchBallGameProps {
  position: [number, number, number];
  onCatch?: () => void;
  isActive?: boolean;
}

export const CatchBallGame = ({ position, onCatch, isActive = false }: CatchBallGameProps) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const [ballPosition, setBallPosition] = useState<THREE.Vector3>(new THREE.Vector3(...position));
  const [velocity, setVelocity] = useState<THREE.Vector3>(
    new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 3 + 2,
      (Math.random() - 0.5) * 2
    )
  );
  const [score, setScore] = useState(0);

  useFrame((state, delta) => {
    if (!isActive || !ballRef.current) return;

    // 중력 적용
    const newVelocity = velocity.clone();
    newVelocity.y -= 9.8 * delta;

    // 새 위치 계산
    const newPosition = ballPosition.clone().add(newVelocity.clone().multiplyScalar(delta));

    // 바닥 충돌
    if (newPosition.y < position[1]) {
      newPosition.y = position[1];
      newVelocity.y = Math.abs(newVelocity.y) * 0.8; // 반동
      
      // 속도가 너무 낮으면 새로운 공 던지기
      if (Math.abs(newVelocity.y) < 0.5) {
        newVelocity.set(
          (Math.random() - 0.5) * 2,
          Math.random() * 3 + 2,
          (Math.random() - 0.5) * 2
        );
      }
    }

    // 벽 충돌
    const boundX = 3;
    const boundZ = 3;
    if (Math.abs(newPosition.x - position[0]) > boundX) {
      newVelocity.x *= -0.8;
      newPosition.x = position[0] + Math.sign(newPosition.x - position[0]) * boundX;
    }
    if (Math.abs(newPosition.z - position[2]) > boundZ) {
      newVelocity.z *= -0.8;
      newPosition.z = position[2] + Math.sign(newPosition.z - position[2]) * boundZ;
    }

    setBallPosition(newPosition);
    setVelocity(newVelocity);
    ballRef.current.position.copy(newPosition);

    // 회전 애니메이션
    ballRef.current.rotation.x += newVelocity.length() * delta;
    ballRef.current.rotation.z += newVelocity.length() * delta;
  });

  const handleClick = () => {
    if (!isActive) return;
    
    setScore(prev => prev + 1);
    onCatch?.();
    
    // 새로운 공 던지기
    setVelocity(new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      Math.random() * 4 + 3,
      (Math.random() - 0.5) * 3
    ));
  };

  if (!isActive) return null;

  return (
    <group>
      {/* 공 */}
      <mesh
        ref={ballRef}
        position={ballPosition.toArray()}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#FF6B6B" 
          emissive="#FF6B6B"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* 그림자 */}
      <mesh position={[ballPosition.x, position[1] + 0.01, ballPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      {/* 점수 표시 */}
      <Text
        position={[position[0], position[1] + 3, position[2]]}
        fontSize={0.3}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`🎯 캐치: ${score}회`}
      </Text>

      {/* 게임 영역 표시 */}
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3, 32]} />
        <meshBasicMaterial color="#4ECDC4" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
