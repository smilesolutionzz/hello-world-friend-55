import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpaceType } from '@/types/SpaceTypes';

interface MeditationRoomProps {
  spaceType: SpaceType;
}

export const MeditationRoom = ({ spaceType }: MeditationRoomProps) => {
  const floatingLight1 = useRef<THREE.Mesh>(null);
  const floatingLight2 = useRef<THREE.Mesh>(null);
  const floatingLight3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (floatingLight1.current) {
      floatingLight1.current.position.y = 2 + Math.sin(time) * 0.3;
    }
    if (floatingLight2.current) {
      floatingLight2.current.position.y = 2.5 + Math.sin(time + 2) * 0.3;
    }
    if (floatingLight3.current) {
      floatingLight3.current.position.y = 2 + Math.sin(time + 4) * 0.3;
    }
  });

  return (
    <group>
      {/* 어두운 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a0033" />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a001a" />
      </mesh>

      {/* 벽들 - 더 어두운 보라색 */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>
      <mesh position={[0, 2.5, 10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>
      <mesh position={[-10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>
      <mesh position={[10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>

      {/* 명상 매트 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -3]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#4a148c" />
      </mesh>

      {/* 쿠션 */}
      <mesh position={[0, 0.2, -3]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.4, 16]} />
        <meshStandardMaterial color="#7b1fa2" />
      </mesh>

      {/* 떠다니는 빛 구체들 */}
      <mesh ref={floatingLight1} position={[-4, 2, -4]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#ec4899" 
          emissive="#ec4899"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight position={[-4, 2, -4]} intensity={0.5} color="#ec4899" distance={5} />

      <mesh ref={floatingLight2} position={[4, 2.5, -4]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight position={[4, 2.5, -4]} intensity={0.5} color="#8b5cf6" distance={5} />

      <mesh ref={floatingLight3} position={[0, 2, 2]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#06b6d4"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#06b6d4" distance={5} />

      {/* 촛불들 */}
      {[
        [-2, 0.5, -5],
        [2, 0.5, -5],
        [-3, 0.5, -1],
        [3, 0.5, -1]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
            <meshStandardMaterial color="#f5e6d3" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffa500"
              emissiveIntensity={1}
            />
          </mesh>
          <pointLight position={[0, 0.3, 0]} intensity={0.3} color="#ffa500" distance={2} />
        </group>
      ))}

      {/* 수정구 */}
      <mesh position={[-5, 1, 3]} castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color="#9333ea" 
          transparent
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[5, 1, 3]} castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          transparent
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* 은은한 앰비언트 조명 */}
      <ambientLight intensity={0.1} />
      
      {/* 중앙 스포트라이트 */}
      <spotLight
        position={[0, 4, -3]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        color="#9333ea"
        castShadow
      />
    </group>
  );
};
