import { SpaceType } from '@/types/SpaceTypes';

interface InterviewRoomProps {
  spaceType: SpaceType;
}

export const InterviewRoom = ({ spaceType }: InterviewRoomProps) => {
  return (
    <group>
      {/* Floor - Professional carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#bdc3c7" />
      </mesh>
      <mesh position={[0, 2, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#bdc3c7" />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#bdc3c7" />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#bdc3c7" />
      </mesh>

      {/* Interview desk */}
      <mesh position={[0, 0.4, 2]} castShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Desk legs */}
      <mesh position={[-1.3, 0.2, 1.5]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[1.3, 0.2, 1.5]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[-1.3, 0.2, 2.5]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[1.3, 0.2, 2.5]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Interviewer chair (behind desk) */}
      <mesh position={[0, 0.3, 3]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0, 0.6, 3.2]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Interviewee chair (in front of desk) */}
      <mesh position={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      <mesh position={[0, 0.6, 0.7]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* Laptop on desk */}
      <mesh position={[0.5, 0.5, 2]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.3]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.5, 0.65, 2.1]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.02]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.3} />
      </mesh>

      {/* Document holder */}
      <mesh position={[-0.8, 0.46, 2]} castShadow>
        <boxGeometry args={[0.3, 0.02, 0.4]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>

      {/* Coffee mug */}
      <mesh position={[-0.5, 0.55, 1.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      {/* Bookshelf */}
      <mesh position={[-4, 1, 4]} castShadow>
        <boxGeometry args={[1.5, 2, 0.4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Books on shelf */}
      <mesh position={[-4, 0.5, 4.15]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.2]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[-3.8, 0.5, 4.15]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.2]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      <mesh position={[-3.6, 0.5, 4.15]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.2]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Wall clock */}
      <mesh position={[0, 3, -9.9]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      <mesh position={[0, 3, -9.85]}>
        <cylinderGeometry args={[0.25, 0.25, 0.01, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Company logo frame */}
      <mesh position={[0, 2.5, -9.9]} castShadow>
        <boxGeometry args={[1, 0.8, 0.05]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0, 2.5, -9.87]}>
        <boxGeometry args={[0.9, 0.7, 0.01]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>

      {/* Window with blinds */}
      <mesh position={[9.9, 2, 0]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#95a5a6" transparent opacity={0.7} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3.5, 2]} intensity={1} castShadow />
      <pointLight position={[-4, 2, 4]} intensity={0.5} color="#f39c12" />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.6} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
};
