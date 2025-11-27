import { SpaceType } from '@/types/SpaceTypes';

interface ExerciseRoomProps {
  spaceType: SpaceType;
}

export const ExerciseRoom = ({ spaceType }: ExerciseRoomProps) => {
  return (
    <group>
      {/* 체육관 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#c41e3a" />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 벽들 */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[0, 2.5, 10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[-10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* 거울 (왼쪽 벽) */}
      <mesh position={[-9.8, 2.5, 0]} receiveShadow>
        <planeGeometry args={[0.1, 4, 18]} />
        <meshStandardMaterial 
          color="#b0c4de" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* 런닝머신들 */}
      {[
        [-5, 0.5, -5],
        [-2, 0.5, -5],
        [1, 0.5, -5]
      ].map((pos, i) => (
        <group key={`treadmill-${i}`} position={pos as [number, number, number]}>
          {/* 베이스 */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1.5, 0.3, 2]} />
            <meshStandardMaterial color="#2f2f2f" />
          </mesh>
          {/* 디스플레이 */}
          <mesh position={[0, 1, -0.8]} castShadow>
            <boxGeometry args={[1, 0.8, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* 화면 */}
          <mesh position={[0, 1, -0.75]} castShadow>
            <boxGeometry args={[0.8, 0.5, 0.05]} />
            <meshStandardMaterial 
              color="#00ff00" 
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* 손잡이 */}
          <mesh position={[-0.5, 0.8, -0.5]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshStandardMaterial color="#808080" />
          </mesh>
          <mesh position={[0.5, 0.8, -0.5]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshStandardMaterial color="#808080" />
          </mesh>
        </group>
      ))}

      {/* 웨이트 벤치 */}
      <group position={[5, 0, -3]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 0.3, 2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.4, 0.2, -0.8]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[0.4, 0.2, -0.8]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[-0.4, 0.2, 0.8]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[0.4, 0.2, 0.8]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
      </group>

      {/* 덤벨 랙 */}
      <group position={[7, 1, 3]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2, 2, 0.5]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        {/* 덤벨들 */}
        {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
          <group key={i} position={[x, 0.5, 0.3]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#c0c0c0" />
            </mesh>
            <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 요가 매트 */}
      {[
        [-6, 0.01, 4],
        [-3, 0.01, 4],
        [0, 0.01, 4]
      ].map((pos, i) => (
        <mesh 
          key={`mat-${i}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={pos as [number, number, number]} 
          receiveShadow
        >
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial color={['#ff6b6b', '#4ecdc4', '#ffe66d'][i]} />
        </mesh>
      ))}

      {/* 밝은 조명 */}
      <pointLight position={[0, 4.5, 0]} intensity={1} color="#ffffff" castShadow />
      <pointLight position={[-5, 4, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[5, 4, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, 4, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[5, 4, 5]} intensity={0.8} color="#ffffff" />
      
      {/* 앰비언트 조명 */}
      <ambientLight intensity={0.6} />
    </group>
  );
};
