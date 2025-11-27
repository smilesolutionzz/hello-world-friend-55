import { SpaceType } from '@/types/SpaceTypes';

interface LoungeSpaceProps {
  spaceType: SpaceType;
}

export const LoungeSpace = ({ spaceType }: LoungeSpaceProps) => {
  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* 벽들 */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
      <mesh position={[0, 2.5, 10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
      <mesh position={[-10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
      <mesh position={[10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>

      {/* 소파 */}
      <mesh position={[-4, 0.5, -5]} castShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[4, 0.5, -5]} castShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* 테이블 */}
      <mesh position={[0, 0.4, -4]} castShadow>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* 화분 */}
      <mesh position={[-6, 0.5, 3]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-6, 1.2, 3]} castShadow>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 조명 */}
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#FFE4B5" castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#FFD700" />
      <pointLight position={[5, 3, -5]} intensity={0.5} color="#FFD700" />
      
      {/* 앰비언트 조명 */}
      <ambientLight intensity={0.4} />
    </group>
  );
};
