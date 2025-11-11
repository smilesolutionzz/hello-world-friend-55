import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ReadyPlayerMeAvatar } from '@/components/metaverse/ReadyPlayerMeAvatar';
import { CharacterController } from '@/components/metaverse/CharacterController';
import { InteractiveObject } from '@/components/metaverse/InteractiveObject';
import { CounselorNPC } from '@/components/metaverse/CounselorNPC';
import { EmotionType } from '@/utils/EmotionDetector';
import { GroupPresence, UserPresence } from '@/components/metaverse/GroupPresence';

// Room components with different layouts
const Room = ({ type = 'counseling' }: { type?: RoomType }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  // 공간별 렌더링
  switch (type) {
    case 'office':
      return <OfficeRoom groupRef={groupRef} />;
    case 'home':
      return <HomeRoom groupRef={groupRef} />;
    case 'bedroom':
      return <BedroomRoom groupRef={groupRef} />;
    case 'school':
      return <SchoolRoom groupRef={groupRef} />;
    case 'club':
      return <ClubRoom groupRef={groupRef} />;
    case 'living':
      return <LivingRoom groupRef={groupRef} />;
    case 'outdoor':
      return <OutdoorRoom groupRef={groupRef} />;
    default:
      return <CounselingRoomDefault groupRef={groupRef} />;
  }
};

// 상담실 (기본)
const CounselingRoomDefault = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#CD853F" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#F5F5DC" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#F5F5DC" /></mesh>
      
      <group position={[-2, -1, 2]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[3, 1, 1.5]} /><meshLambertMaterial color="#D2B48C" /></mesh>
        <mesh position={[0, 1.2, -0.5]}><boxGeometry args={[3, 1.4, 0.3]} /><meshLambertMaterial color="#D2B48C" /></mesh>
      </group>
      <group position={[2, -1, 1]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.2, 1, 1.2]} /><meshLambertMaterial color="#8B7D6B" /></mesh>
        <mesh position={[0, 1.5, -0.4]}><boxGeometry args={[1.2, 1.5, 0.2]} /><meshLambertMaterial color="#8B7D6B" /></mesh>
      </group>
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFE4B5" />
    </group>
  );
};

// 회사 사무실
const OfficeRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#F0F0F0" /></mesh>
      
      {/* 책상 */}
      <group position={[0, -0.8, 1]}>
        <mesh><boxGeometry args={[4, 0.2, 2]} /><meshLambertMaterial color="#404040" /></mesh>
        <mesh position={[-1.5, -0.8, 0]}><boxGeometry args={[0.1, 1.4, 0.1]} /><meshLambertMaterial color="#303030" /></mesh>
        <mesh position={[1.5, -0.8, 0]}><boxGeometry args={[0.1, 1.4, 0.1]} /><meshLambertMaterial color="#303030" /></mesh>
      </group>
      {/* 모니터 */}
      <group position={[0, 0, 0.5]}>
        <mesh><boxGeometry args={[1.5, 1, 0.1]} /><meshLambertMaterial color="#000000" /></mesh>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[1.3, 0.8, 0.05]} /><meshLambertMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.5} /></mesh>
      </group>
      {/* 의자 */}
      <group position={[0, -0.5, 3]}>
        <mesh><cylinderGeometry args={[0.6, 0.6, 1, 16]} /><meshLambertMaterial color="#2C3E50" /></mesh>
        <mesh position={[0, 1, -0.3]}><boxGeometry args={[1, 1.5, 0.2]} /><meshLambertMaterial color="#34495E" /></mesh>
      </group>
      {/* 서류함 */}
      <group position={[-4, -0.5, -2]}>
        <mesh><boxGeometry args={[1, 2, 1.5]} /><meshLambertMaterial color="#7F8C8D" /></mesh>
      </group>
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#FFFFFF" />
      <pointLight position={[-3, 4, 2]} intensity={0.5} color="#E8F4F8" />
    </group>
  );
};

// 친정 엄마집
const HomeRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#D4A574" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#FFF8E7" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#FFFACD" /></mesh>
      
      {/* 식탁 */}
      <group position={[0, -0.8, 1]}>
        <mesh><cylinderGeometry args={[2, 2, 0.2, 32]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.3, 0.3, 1.6, 16]} /><meshLambertMaterial color="#654321" /></mesh>
      </group>
      {/* 의자들 */}
      <group position={[-1.5, -1, 2.5]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.8, 1, 0.8]} /><meshLambertMaterial color="#A0522D" /></mesh>
        <mesh position={[0, 1.2, -0.3]}><boxGeometry args={[0.8, 1, 0.2]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      <group position={[1.5, -1, 2.5]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.8, 1, 0.8]} /><meshLambertMaterial color="#A0522D" /></mesh>
        <mesh position={[0, 1.2, -0.3]}><boxGeometry args={[0.8, 1, 0.2]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      {/* 화분 */}
      <group position={[-3, -1, -2]}>
        <mesh><cylinderGeometry args={[0.4, 0.5, 0.6, 8]} /><meshLambertMaterial color="#CD853F" /></mesh>
        <mesh position={[0, 0.8, 0]}><sphereGeometry args={[0.5, 8, 6]} /><meshLambertMaterial color="#228B22" /></mesh>
      </group>
      <pointLight position={[0, 5, 0]} intensity={0.9} color="#FFA500" />
      <pointLight position={[-3, 3, 2]} intensity={0.4} color="#FFD700" />
    </group>
  );
};

// 안방
const BedroomRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#B8A99A" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#E6D5C3" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#F5E6D3" /></mesh>
      
      {/* 침대 */}
      <group position={[-2, -1, -2]}>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[4, 0.5, 3]} /><meshLambertMaterial color="#8B7D6B" /></mesh>
        <mesh position={[0, 0.8, 0]}><boxGeometry args={[3.8, 0.4, 2.8]} /><meshLambertMaterial color="#DEB887" /></mesh>
        <mesh position={[0, 1.5, -1.2]}><boxGeometry args={[3.8, 1.5, 0.3]} /><meshLambertMaterial color="#CD853F" /></mesh>
      </group>
      {/* 협탁 */}
      <group position={[2, -1, -2]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[1, 1, 1]} /><meshLambertMaterial color="#8B4513" /></mesh>
        {/* 램프 */}
        <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.2, 0.3, 0.5, 8]} /><meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} /></mesh>
      </group>
      <pointLight position={[2, 1, -2]} intensity={0.6} color="#FFE4B5" />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#FFF5E6" />
    </group>
  );
};

// 학교
const SchoolRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#F0E68C" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#FFFFF0" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#FFF8DC" /></mesh>
      
      {/* 칠판 */}
      <group position={[0, 1, -7]}>
        <mesh><boxGeometry args={[6, 3, 0.1]} /><meshLambertMaterial color="#0F4C3A" /></mesh>
      </group>
      {/* 책상 */}
      <group position={[-1, -1.3, 2]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.5, 0.1, 1]} /><meshLambertMaterial color="#D2691E" /></mesh>
        <mesh position={[-0.5, -0.1, -0.3]}><boxGeometry args={[0.1, 1.2, 0.1]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0.5, -0.1, -0.3]}><boxGeometry args={[0.1, 1.2, 0.1]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      <group position={[1, -1.3, 2]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.5, 0.1, 1]} /><meshLambertMaterial color="#D2691E" /></mesh>
        <mesh position={[-0.5, -0.1, -0.3]}><boxGeometry args={[0.1, 1.2, 0.1]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0.5, -0.1, -0.3]}><boxGeometry args={[0.1, 1.2, 0.1]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      {/* 의자 */}
      <group position={[-1, -1.5, 3.5]}>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.8, 0.6, 0.8]} /><meshLambertMaterial color="#4682B4" /></mesh>
      </group>
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#FFFFFF" />
    </group>
  );
};

// 동아리실
const ClubRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#6B7280" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#9CA3AF" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#A8B2C1" /></mesh>
      
      {/* 소파들 */}
      <group position={[-3, -1, 1]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[2, 0.8, 1.5]} /><meshLambertMaterial color="#8B4789" /></mesh>
        <mesh position={[0, 1.1, -0.5]}><boxGeometry args={[2, 1, 0.3]} /><meshLambertMaterial color="#9B59B6" /></mesh>
      </group>
      <group position={[3, -1, 1]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[2, 0.8, 1.5]} /><meshLambertMaterial color="#2E8B57" /></mesh>
        <mesh position={[0, 1.1, -0.5]}><boxGeometry args={[2, 1, 0.3]} /><meshLambertMaterial color="#3CB371" /></mesh>
      </group>
      {/* 중앙 테이블 */}
      <group position={[0, -1, 2]}>
        <mesh><boxGeometry args={[2, 0.3, 2]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      {/* 기타 케이스 */}
      <group position={[-5, -0.5, -3]}>
        <mesh><boxGeometry args={[0.5, 2, 0.8]} /><meshLambertMaterial color="#654321" /></mesh>
      </group>
      <pointLight position={[0, 5, 0]} intensity={0.7} color="#FF69B4" />
      <pointLight position={[-3, 3, 2]} intensity={0.5} color="#9370DB" />
    </group>
  );
};

// 거실
const LivingRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0, 3, -8]}><planeGeometry args={[20, 10]} /><meshLambertMaterial color="#FAF0E6" /></mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 10]} /><meshLambertMaterial color="#FFF5EE" /></mesh>
      
      {/* TV */}
      <group position={[0, 0, -7]}>
        <mesh><boxGeometry args={[4, 2.5, 0.2]} /><meshLambertMaterial color="#000000" /></mesh>
        <mesh position={[0, 0, 0.1]}><boxGeometry args={[3.8, 2.3, 0.1]} /><meshLambertMaterial color="#1a1a2e" emissive="#4a4a6e" emissiveIntensity={0.3} /></mesh>
      </group>
      {/* TV 받침대 */}
      <group position={[0, -1.5, -6.8]}>
        <mesh><boxGeometry args={[4.5, 0.3, 1.5]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      {/* 소파 */}
      <group position={[0, -1, 3]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[5, 1, 2]} /><meshLambertMaterial color="#B8860B" /></mesh>
        <mesh position={[0, 1.2, -0.8]}><boxGeometry args={[5, 1.5, 0.4]} /><meshLambertMaterial color="#DAA520" /></mesh>
      </group>
      {/* 커피 테이블 */}
      <group position={[0, -1.3, 0]}>
        <mesh><boxGeometry args={[2.5, 0.2, 1.5]} /><meshLambertMaterial color="#654321" /></mesh>
      </group>
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFE4B5" />
      <pointLight position={[0, 1, -7]} intensity={0.3} color="#87CEEB" />
    </group>
  );
};

// 야외 잔디구장
const OutdoorRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 잔디 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial color="#7CFC00" />
      </mesh>
      
      {/* 벤치 */}
      <group position={[-3, -1.2, 2]}>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[2.5, 0.2, 0.8]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 0.5, -0.3]}><boxGeometry args={[2.5, 0.8, 0.2]} /><meshLambertMaterial color="#A0522D" /></mesh>
        <mesh position={[-1, -0.2, 0]}><boxGeometry args={[0.2, 1, 0.2]} /><meshLambertMaterial color="#654321" /></mesh>
        <mesh position={[1, -0.2, 0]}><boxGeometry args={[0.2, 1, 0.2]} /><meshLambertMaterial color="#654321" /></mesh>
      </group>
      
      {/* 나무들 */}
      <group position={[-8, -0.5, -5]}>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.3, 0.4, 3, 8]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 2.5, 0]}><sphereGeometry args={[1.5, 8, 8]} /><meshLambertMaterial color="#228B22" /></mesh>
      </group>
      <group position={[7, -0.5, -4]}>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.3, 0.4, 2.5, 8]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 2.2, 0]}><sphereGeometry args={[1.3, 8, 8]} /><meshLambertMaterial color="#32CD32" /></mesh>
      </group>
      
      {/* 꽃들 */}
      <group position={[2, -1.5, -1]}>
        <mesh><sphereGeometry args={[0.2, 6, 6]} /><meshLambertMaterial color="#FF69B4" /></mesh>
      </group>
      <group position={[2.5, -1.5, -0.5]}>
        <mesh><sphereGeometry args={[0.2, 6, 6]} /><meshLambertMaterial color="#FFB6C1" /></mesh>
      </group>
      <group position={[3, -1.5, -1]}>
        <mesh><sphereGeometry args={[0.2, 6, 6]} /><meshLambertMaterial color="#FF1493" /></mesh>
      </group>
      
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#FFFACD" />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#87CEEB" />
    </group>
  );
};

// 떠다니는 파티클 효과
const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#E6E6FA" 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

export type RoomType = 'counseling' | 'office' | 'home' | 'bedroom' | 'school' | 'club' | 'living' | 'outdoor';

interface CounselingRoomProps {
  children?: React.ReactNode;
  roomType?: RoomType;
  enableMovement?: boolean;
  avatarUrl?: string;
  emotion?: EmotionType;
  emotionIntensity?: number;
  onObjectInteract?: (id: string, content: string) => void;
  isSpeaking?: boolean;
  groupMode?: boolean;
  userName?: string;
  avatarPosition?: { x: number; y: number; z: number };
}

const CounselingRoom = ({
  children, 
  roomType = 'counseling',
  enableMovement = false,
  avatarUrl,
  emotion = 'neutral',
  emotionIntensity = 0.5,
  onObjectInteract,
  isSpeaking = false,
  groupMode = false,
  userName = 'User',
  avatarPosition
}: CounselingRoomProps) => {
  // 공간별 설정
  const getRoomSettings = () => {
    switch (roomType) {
      case 'office':
        return { preset: 'city' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#E0E8F0' };
      case 'home':
        return { preset: 'apartment' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#FFF5E6' };
      case 'bedroom':
        return { preset: 'night' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#E6E6FA' };
      case 'school':
        return { preset: 'dawn' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#F0F8FF' };
      case 'club':
        return { preset: 'warehouse' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#FFF0F5' };
      case 'living':
        return { preset: 'sunset' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#FFF8DC' };
      case 'outdoor':
        return { preset: 'park' as const, cameraPos: [0, 3, 10] as [number, number, number], ambientColor: '#E0FFE0' };
      default:
        return { preset: 'sunset' as const, cameraPos: [0, 2, 8] as [number, number, number], ambientColor: '#F0F8FF' };
    }
  };

  const settings = getRoomSettings();

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={settings.cameraPos} fov={60} />
          
          {/* 조명 설정 */}
          <ambientLight intensity={0.6} color={settings.ambientColor} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            color="#FFE4B5"
            castShadow
          />
          
          {/* 환경 */}
          <Environment preset={settings.preset} />
          
          {/* 3D 상담실 */}
          <Room type={roomType} />
          
          {/* 떠다니는 파티클 */}
          <FloatingParticles />
          
          {/* 인터랙티브 오브젝트들 */}
          {roomType === 'counseling' && (
            <>
              <InteractiveObject
                position={[-3, -0.5, -2]}
                type="document"
                label="📄 상담 가이드"
                content="이 공간은 안전한 상담 공간입니다. 편하게 마음을 열고 이야기해주세요. 모든 대화는 비밀이 보장됩니다."
                onInteract={() => onObjectInteract?.('상담 가이드', '이 공간은 안전한 상담 공간입니다. 편하게 마음을 열고 이야기해주세요. 모든 대화는 비밀이 보장됩니다.')}
              />
              <InteractiveObject
                position={[3, -0.5, -2]}
                type="decoration"
                label="🌿 힐링 플랜트"
                content="자연의 치유력을 느껴보세요. 깊게 숨을 들이쉬고 내쉬세요."
                onInteract={() => onObjectInteract?.('힐링 플랜트', '자연의 치유력을 느껴보세요. 깊게 숨을 들이쉬고 내쉬세요.')}
                color="#228B22"
              />
            </>
          )}
          
          {roomType === 'office' && (
            <>
              <InteractiveObject
                position={[-3, 0, 0]}
                type="document"
                label="📊 업무 자료"
                content="업무 스트레스 관리 가이드: 정기적인 휴식, 우선순위 설정, 건강한 경계 설정이 중요합니다."
                onInteract={() => onObjectInteract?.('업무 자료', '업무 스트레스 관리 가이드: 정기적인 휴식, 우선순위 설정, 건강한 경계 설정이 중요합니다.')}
              />
            </>
          )}
          
          {roomType === 'home' && (
            <>
              <InteractiveObject
                position={[-2, -0.5, 0]}
                type="decoration"
                label="🖼️ 가족 사진"
                content="소중한 추억들이 담긴 공간입니다. 가족과의 좋은 순간들을 떠올려보세요."
                onInteract={() => onObjectInteract?.('가족 사진', '소중한 추억들이 담긴 공간입니다. 가족과의 좋은 순간들을 떠올려보세요.')}
                color="#FFD700"
              />
            </>
          )}

          {/* AI 상담사 NPC - 항상 공간의 왼쪽에 배치 */}
          <CounselorNPC 
            position={[-4, -1.5, 2]} 
            isSpeaking={isSpeaking}
            name="메타상담사"
          />
          
          {/* 아바타와 이동 컨트롤러 */}
          {enableMovement ? (
            <CharacterController speed={0.15} enabled={enableMovement}>
              <ReadyPlayerMeAvatar 
                position={[0, 0, 0]} 
                avatarUrl={avatarUrl}
                scale={2}
                emotion={emotion}
                emotionIntensity={emotionIntensity}
              />
            </CharacterController>
          ) : (
            <ReadyPlayerMeAvatar 
              position={[2, -1.5, 3]} 
              avatarUrl={avatarUrl}
              scale={2}
              emotion={emotion}
              emotionIntensity={emotionIntensity}
            />
          )}
          
          {/* 그룹 Presence - 다른 사용자들 */}
          {groupMode && (
            <GroupPresence
              roomId={roomType}
              userName={userName}
              avatarUrl={avatarUrl}
              position={avatarPosition}
              emotion={emotion}
              enabled={groupMode}
            />
          )}
          
          
          {/* 카메라 컨트롤 */}
          <OrbitControls 
            enablePan={false}
            enableZoom={!enableMovement}
            enableRotate={!enableMovement}
            autoRotate={!enableMovement}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 3}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      {/* 포그라운드 콘텐츠 (클릭 가능) */}
      <div className="relative z-10">
        {children}
      </div>
    </>
  );
};

export default CounselingRoom;