import { SpaceType } from '@/types/SpaceTypes';

interface OutdoorSpaceProps {
  spaceType: SpaceType;
}

export const OutdoorSpace = ({ spaceType }: OutdoorSpaceProps) => {
  return (
    <group>
      {/* 잔디 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#7EC850" />
      </mesh>

      {/* 하늘 (원형 돔) */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[50, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#87CEEB" side={2} />
      </mesh>

      {/* 나무들 */}
      {[
        [-8, 1, -8],
        [8, 1, -8],
        [-8, 1, 8],
        [7, 1, 7],
        [-6, 1, 5],
        [5, 1, -6]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* 나무 기둥 */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* 나무 잎 */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[1.2, 2.5, 8]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
        </group>
      ))}

      {/* 꽃들 */}
      {[
        [3, 0.2, 3],
        [-3, 0.2, 3],
        [4, 0.2, -2],
        [-4, 0.2, -3],
        [2, 0.2, -4]
      ].map((pos, i) => (
        <group key={`flower-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color={['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF6347'][i]} />
          </mesh>
        </group>
      ))}

      {/* 벤치 */}
      <group position={[0, 0.5, -6]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[3, 0.1, 0.8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[-1.2, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.6]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[1.2, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.6]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 0.4, -0.3]} castShadow>
          <boxGeometry args={[3, 0.8, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>

      {/* 작은 연못 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.05, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial 
          color="#4169E1" 
          transparent 
          opacity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 태양광 */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* 앰비언트 조명 */}
      <ambientLight intensity={0.6} />
      
      {/* 하늘 조명 */}
      <hemisphereLight 
        args={['#87CEEB', '#7EC850', 0.5]} 
      />
    </group>
  );
};
