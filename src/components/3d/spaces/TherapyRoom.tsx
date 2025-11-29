import { SpaceType } from '@/types/SpaceTypes';

interface TherapyRoomProps {
  spaceType: SpaceType;
}

export const TherapyRoom = ({ spaceType }: TherapyRoomProps) => {
  return (
    <group>
      {/* Floor - Warm carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d4c5b9" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f5f1ea" />
      </mesh>

      {/* Walls - Warm beige */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#e8dcc9" />
      </mesh>
      <mesh position={[0, 2, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#e8dcc9" />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#e8dcc9" />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#e8dcc9" />
      </mesh>

      {/* Therapist's chair */}
      <mesh position={[-2, 0.4, 2]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[-2, 0.9, 2.3]} castShadow>
        <boxGeometry args={[0.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Client's comfortable armchair */}
      <mesh position={[2, 0.4, 1.5]} castShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color="#b89968" />
      </mesh>
      <mesh position={[2, 0.9, 1.9]} castShadow>
        <boxGeometry args={[1, 0.8, 0.2]} />
        <meshStandardMaterial color="#b89968" />
      </mesh>
      {/* Armrests */}
      <mesh position={[1.5, 0.6, 1.5]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.8]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>
      <mesh position={[2.5, 0.6, 1.5]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.8]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>

      {/* Side table */}
      <mesh position={[0, 0.3, 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Tissue box on table */}
      <mesh position={[0, 0.65, 2]} castShadow>
        <boxGeometry args={[0.25, 0.1, 0.15]} />
        <meshStandardMaterial color="#f0e6d2" />
      </mesh>

      {/* Water bottle */}
      <mesh position={[0.3, 0.7, 1.8]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </mesh>

      {/* Plant in corner */}
      <mesh position={[-4, 0.4, -4]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[-4, 1.2, -4]} castShadow>
        <coneGeometry args={[0.5, 1.5, 8]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      {/* Bookshelf */}
      <mesh position={[4, 1.2, -4]} castShadow>
        <boxGeometry args={[1.5, 2.4, 0.4]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Books on shelf */}
      <mesh position={[4, 0.5, -3.75]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.25]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[4.2, 0.5, -3.75]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.25]} />
        <meshStandardMaterial color="#2c5282" />
      </mesh>
      <mesh position={[4.4, 0.5, -3.75]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.25]} />
        <meshStandardMaterial color="#276749" />
      </mesh>
      <mesh position={[3.8, 0.5, -3.75]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.25]} />
        <meshStandardMaterial color="#744210" />
      </mesh>

      {/* Clock on wall */}
      <mesh position={[0, 3, -9.9]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshStandardMaterial color="#f5f1ea" />
      </mesh>
      <mesh position={[0, 3, -9.85]}>
        <cylinderGeometry args={[0.3, 0.3, 0.01, 32]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      {/* Certificate frames on wall */}
      <mesh position={[-3, 2.5, -9.9]} castShadow>
        <boxGeometry args={[0.8, 1, 0.05]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      <mesh position={[-3, 2.5, -9.87]}>
        <boxGeometry args={[0.7, 0.9, 0.01]} />
        <meshStandardMaterial color="#f5f1ea" />
      </mesh>

      <mesh position={[3, 2.5, -9.9]} castShadow>
        <boxGeometry args={[0.8, 1, 0.05]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      <mesh position={[3, 2.5, -9.87]}>
        <boxGeometry args={[0.7, 0.9, 0.01]} />
        <meshStandardMaterial color="#f5f1ea" />
      </mesh>

      {/* Rug under chairs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#c9a986" />
      </mesh>

      {/* Window with curtains */}
      <mesh position={[9.9, 2, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#e6d5c3" transparent opacity={0.6} />
      </mesh>

      {/* Small lamp on side table */}
      <mesh position={[-0.2, 0.65, 2.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      <mesh position={[-0.2, 0.8, 2.2]} castShadow>
        <coneGeometry args={[0.15, 0.2, 8]} />
        <meshStandardMaterial color="#f5e6d3" emissive="#fff8dc" emissiveIntensity={0.3} />
      </mesh>

      {/* Lighting - Warm and soft */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3.5, 2]} intensity={0.8} color="#fff8dc" castShadow />
      <pointLight position={[-0.2, 0.8, 2.2]} intensity={0.4} color="#ffd699" />
      <pointLight position={[-4, 2, -4]} intensity={0.3} color="#f5deb3" />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.4} 
        color="#fff8dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
};
