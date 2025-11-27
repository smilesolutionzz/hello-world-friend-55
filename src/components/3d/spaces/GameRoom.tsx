import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpaceType } from '@/types/SpaceTypes';

interface GameRoomProps {
  spaceType: SpaceType;
}

export const GameRoom = ({ spaceType }: GameRoomProps) => {
  const screen1 = useRef<THREE.Mesh>(null);
  const screen2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // 화면 깜빡임 효과
    if (screen1.current) {
      const material = screen1.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + Math.sin(time * 3) * 0.2;
    }
    if (screen2.current) {
      const material = screen2.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + Math.sin(time * 4 + 1) * 0.2;
    }
  });

  return (
    <group>
      {/* 카펫 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a0033" />
      </mesh>

      {/* 벽들 - 어두운 */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      <mesh position={[0, 2.5, 10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      <mesh position={[-10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>
      <mesh position={[10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>

      {/* 대형 게임 화면 1 */}
      <group position={[-5, 2, -9]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[4, 2.5, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh ref={screen1} position={[0, 0, 0.2]} castShadow>
          <planeGeometry args={[3.5, 2]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* 대형 게임 화면 2 */}
      <group position={[5, 2, -9]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[4, 2.5, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh ref={screen2} position={[0, 0, 0.2]} castShadow>
          <planeGeometry args={[3.5, 2]} />
          <meshStandardMaterial 
            color="#ff00ff" 
            emissive="#ff00ff"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* 게임 콘솔 */}
      <group position={[-5, 0.8, -7]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.3]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.2]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <group position={[5, 0.8, -7]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.3]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.3, 0.05, 0.2]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* 게이밍 체어 */}
      {[
        [-5, 0, -6],
        [5, 0, -6]
      ].map((pos, i) => (
        <group key={`chair-${i}`} position={pos as [number, number, number]}>
          {/* 의자 받침 */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.5, 0.6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* 의자 */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.8]} />
            <meshStandardMaterial color={i === 0 ? '#00ffff' : '#ff00ff'} />
          </mesh>
          {/* 등받이 */}
          <mesh position={[0, 1.3, -0.3]} castShadow>
            <boxGeometry args={[0.8, 1, 0.2]} />
            <meshStandardMaterial color={i === 0 ? '#00ffff' : '#ff00ff'} />
          </mesh>
        </group>
      ))}

      {/* VR 헤드셋 스탠드 */}
      <group position={[0, 1, 5]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#00ff00" 
            emissive="#00ff00"
            emissiveIntensity={1}
          />
        </mesh>
      </group>

      {/* 게임 포스터들 (벽에 부착) */}
      {[
        [-7, 2.5, -9.8, '#ff6b6b'],
        [0, 2.5, -9.8, '#4ecdc4'],
        [7, 2.5, -9.8, '#ffe66d']
      ].map((data, i) => {
        const [x, y, z, color] = data;
        return (
          <mesh 
            key={`poster-${i}`} 
            position={[x as number, y as number, z as number]}
            rotation={[0, 0, 0]}
          >
            <planeGeometry args={[1.5, 2]} />
            <meshStandardMaterial color={color as string} />
          </mesh>
        );
      })}

      {/* 네온 조명 */}
      <pointLight position={[-5, 3, -8]} intensity={1} color="#00ffff" />
      <pointLight position={[5, 3, -8]} intensity={1} color="#ff00ff" />
      <pointLight position={[0, 3, 5]} intensity={0.8} color="#ffff00" />
      
      {/* RGB 스트립 조명 (천장) */}
      <mesh position={[0, 4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff"
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* 어두운 앰비언트 */}
      <ambientLight intensity={0.2} />
    </group>
  );
};
