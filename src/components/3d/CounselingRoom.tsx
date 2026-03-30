import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ReadyPlayerMeAvatar } from '@/components/metaverse/ReadyPlayerMeAvatar';
import { CharacterController } from '@/components/metaverse/CharacterController';
import { InteractiveObject } from '@/components/metaverse/InteractiveObject';
import { CounselorNPC } from '@/components/metaverse/CounselorNPC';
import { EmotionType } from '@/utils/EmotionDetector';
import { GroupPresence } from '../metaverse/GroupPresence';
import type { AvatarCustomization } from '../metaverse/AvatarCustomization';
import type { GestureType } from '@/utils/GestureSystem';
import type { CounselorEmotion } from '@/utils/CounselorEmotionDetector';
import { CatchBallGame } from '../metaverse/CatchBallGame';
import { useToast } from '@/hooks/use-toast';
import { CounselingCharacter } from './CounselingCharacter';
import type { CharacterType } from '@/utils/CounselingQuestions';
// FloatingCube 제거 - 더 이상 사용하지 않음

// 문 컴포넌트
const Door = ({ position, onInteract }: { position: [number, number, number]; onInteract: () => void }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* 문틀 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 4, 0.3]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* 문짝 */}
      <mesh 
        position={[0, 0, 0.15]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          setHovered(true);
          onInteract();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onInteract();
        }}
      >
        <boxGeometry args={[2, 3.8, 0.1]} />
        <meshLambertMaterial 
          color={hovered ? "#D2691E" : "#A0522D"} 
          emissive={hovered ? "#FF8C00" : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* 손잡이 */}
      <mesh position={[-0.7, 0, 0.25]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      
      {/* 문 위 표시 */}
      {hovered && (
        <mesh position={[0, 2.5, 0.3]}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// Room components with different layouts
const Room = ({ type = 'counseling', isChildMode = false, onDoorClick }: { type?: RoomType; isChildMode?: boolean; onDoorClick?: () => void }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  // 아이 친화적 모드 (금쪽 상담)
  if (isChildMode) {
    return (
      <group>
        <ChildFriendlyRoom groupRef={groupRef} />
        {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
      </group>
    );
  }

  // 공간별 렌더링
  switch (type) {
    case 'office':
      return (
        <group>
          <OfficeRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'home':
      return (
        <group>
          <HomeRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'bedroom':
      return (
        <group>
          <BedroomRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'school':
      return (
        <group>
          <SchoolRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'club':
      return (
        <group>
          <ClubRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'living':
      return (
        <group>
          <LivingRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'outdoor':
      return (
        <group>
          <OutdoorRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 5]} onInteract={onDoorClick} />}
        </group>
      );
    case 'playground':
      return (
        <group>
          <PlaygroundRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'toyroom':
      return (
        <group>
          <ToyroomRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'artroom':
      return (
        <group>
          <ArtroomRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'library':
      return (
        <group>
          <LibraryRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
    case 'garden':
      return (
        <group>
          <GardenRoom groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 5]} onInteract={onDoorClick} />}
        </group>
      );
    default:
      return (
        <group>
          <CounselingRoomDefault groupRef={groupRef} />
          {onDoorClick && <Door position={[-7, 0, 0]} onInteract={onDoorClick} />}
        </group>
      );
  }
};

// 아이 친화적 상담실 (금쪽 상담)
const ChildFriendlyRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 밝은 파스텔 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#FFE4E1" />
      </mesh>
      
      {/* 하늘색 벽 */}
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#E0F4FF" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#E0F4FF" /></mesh>
      
      {/* 천장 (연한 노란색) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshLambertMaterial color="#FFFACD" />
      </mesh>
      
      {/* 구름 장식 */}
      <group position={[-5, 6, -5]}>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
        <mesh position={[0.6, 0, 0]}><sphereGeometry args={[0.4, 16, 16]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
        <mesh position={[-0.6, 0, 0]}><sphereGeometry args={[0.4, 16, 16]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
      </group>
      <group position={[5, 6.5, -6]}>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[0.6, 16, 16]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
        <mesh position={[0.7, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
        <mesh position={[-0.7, 0, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
      </group>
      
      {/* 별 장식 */}
      <mesh position={[-6, 5, -4]}>
        <sphereGeometry args={[0.15, 5, 5]} />
        <meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[6, 6, -5]}>
        <sphereGeometry args={[0.2, 5, 5]} />
        <meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[3, 5.5, -6]}>
        <sphereGeometry args={[0.12, 5, 5]} />
        <meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      
      {/* 둥근 테이블 (파스텔 핑크) */}
      <group position={[0, -1.3, 2]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.15, 32]} />
          <meshLambertMaterial color="#FFB6C1" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
          <meshLambertMaterial color="#FFC0CB" />
        </mesh>
      </group>
      
      {/* 귀여운 쿠션 의자들 */}
      <group position={[-1.5, -1.5, 1]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshLambertMaterial color="#87CEEB" />
        </mesh>
        <mesh position={[0, 0.9, -0.3]}>
          <boxGeometry args={[0.8, 0.8, 0.2]} />
          <meshLambertMaterial color="#87CEEB" />
        </mesh>
      </group>
      <group position={[1.5, -1.5, 1]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshLambertMaterial color="#FFE4B5" />
        </mesh>
        <mesh position={[0, 0.9, -0.3]}>
          <boxGeometry args={[0.8, 0.8, 0.2]} />
          <meshLambertMaterial color="#FFE4B5" />
        </mesh>
      </group>
      
      {/* 장난감 상자 */}
      <group position={[-5, -1.5, 3]}>
        <mesh>
          <boxGeometry args={[1.5, 1, 1.2]} />
          <meshLambertMaterial color="#FF69B4" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
        <mesh position={[0.4, 0.6, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color="#87CEEB" />
        </mesh>
      </group>
      
      {/* 책꽂이 (파스텔 색상) */}
      <group position={[6, -0.5, -2]}>
        <mesh>
          <boxGeometry args={[1.5, 2.5, 0.4]} />
          <meshLambertMaterial color="#B0E0E6" />
        </mesh>
        {/* 책들 */}
        <mesh position={[-0.3, 0.5, 0.25]}><boxGeometry args={[0.15, 0.8, 0.3]} /><meshLambertMaterial color="#FF6B9D" /></mesh>
        <mesh position={[-0.1, 0.5, 0.25]}><boxGeometry args={[0.15, 0.8, 0.3]} /><meshLambertMaterial color="#C3B1E1" /></mesh>
        <mesh position={[0.1, 0.5, 0.25]}><boxGeometry args={[0.15, 0.8, 0.3]} /><meshLambertMaterial color="#FFE66D" /></mesh>
        <mesh position={[0.3, 0.5, 0.25]}><boxGeometry args={[0.15, 0.8, 0.3]} /><meshLambertMaterial color="#95E1D3" /></mesh>
      </group>
      
      {/* 따뜻한 조명 */}
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#FFF8DC" />
      <pointLight position={[-4, 4, 2]} intensity={0.6} color="#FFE4E1" />
      <pointLight position={[4, 4, 2]} intensity={0.6} color="#E0F4FF" />
    </group>
  );
};

// 상담실 (기본)
const CounselingRoomDefault = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#CD853F" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#F5F5DC" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#F5F5DC" /></mesh>
      
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
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#F0F0F0" /></mesh>
      
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
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#D4A574" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#FFF8E7" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#FFFACD" /></mesh>
      
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
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#B8A99A" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#E6D5C3" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#F5E6D3" /></mesh>
      
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
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#F0E68C" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#FFFFF0" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#FFF8DC" /></mesh>
      
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
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#6B7280" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#9CA3AF" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#A8B2C1" /></mesh>
      
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
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#FAF0E6" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#FFF5EE" /></mesh>
      
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
        <planeGeometry args={[60, 60]} />
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

// 놀이터
const PlaygroundRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 모래 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#F4D03F" />
      </mesh>
      
      {/* 하늘 배경 */}
      <mesh position={[0, 8, -25]}>
        <planeGeometry args={[60, 20]} />
        <meshLambertMaterial color="#87CEEB" />
      </mesh>
      
      {/* 미끄럼틀 */}
      <group position={[-5, -0.5, 2]}>
        {/* 계단 */}
        <mesh position={[0, 0, 0]}><boxGeometry args={[1, 0.3, 1]} /><meshLambertMaterial color="#FF6B9D" /></mesh>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[1, 0.3, 0.8]} /><meshLambertMaterial color="#FF6B9D" /></mesh>
        <mesh position={[0, 0.6, 0]}><boxGeometry args={[1, 0.3, 0.6]} /><meshLambertMaterial color="#FF6B9D" /></mesh>
        {/* 미끄럼 부분 */}
        <mesh position={[0, 0.7, 2]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[1, 0.1, 3]} />
          <meshLambertMaterial color="#FFD93D" />
        </mesh>
      </group>
      
      {/* 그네 */}
      <group position={[5, 1, 2]}>
        {/* 지지대 */}
        <mesh position={[-1.5, 1, 0]}><boxGeometry args={[0.2, 4, 0.2]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[1.5, 1, 0]}><boxGeometry args={[0.2, 4, 0.2]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 3, 0]}><boxGeometry args={[3.5, 0.2, 0.2]} /><meshLambertMaterial color="#8B4513" /></mesh>
        {/* 그네 좌석 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.1, 0.5]} />
          <meshLambertMaterial color="#6BCB77" />
        </mesh>
      </group>
      
      {/* 시소 */}
      <group position={[0, -1.5, -3]}>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.3, 0.3, 1, 16]} /><meshLambertMaterial color="#C44569" /></mesh>
        <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 12]}>
          <boxGeometry args={[4, 0.2, 0.5]} />
          <meshLambertMaterial color="#4ECDC4" />
        </mesh>
      </group>
      
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#FFFFCC" />
    </group>
  );
};

// 장난감방
const ToyroomRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 부드러운 카펫 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#FFC0CB" />
      </mesh>
      
      {/* 파스텔 벽 */}
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#E0BBE4" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#FFDFD3" /></mesh>
      
      {/* 레고 블록들 */}
      <group position={[-3, -1.5, 2]}>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.6, 0.4, 0.6]} /><meshLambertMaterial color="#FF0000" /></mesh>
        <mesh position={[0.7, 0.2, 0]}><boxGeometry args={[0.6, 0.4, 0.6]} /><meshLambertMaterial color="#00FF00" /></mesh>
        <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.6, 0.4, 0.6]} /><meshLambertMaterial color="#0000FF" /></mesh>
        <mesh position={[-0.7, 0.2, 0]}><boxGeometry args={[0.6, 0.4, 0.6]} /><meshLambertMaterial color="#FFFF00" /></mesh>
      </group>
      
      {/* 인형의 집 */}
      <group position={[4, -0.5, -2]}>
        <mesh><boxGeometry args={[2, 2.5, 1.5]} /><meshLambertMaterial color="#FFB6C1" /></mesh>
        <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[1.5, 0.8, 4]} />
          <meshLambertMaterial color="#FF69B4" />
        </mesh>
      </group>
      
      {/* 테디베어 */}
      <group position={[-5, -1, 0]}>
        <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.5, 16, 16]} /><meshLambertMaterial color="#D2691E" /></mesh>
        <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.4, 16, 16]} /><meshLambertMaterial color="#8B4513" /></mesh>
      </group>
      
      {/* 공 놀이 풀 */}
      <group position={[5, -1, 3]}>
        <mesh><cylinderGeometry args={[1.2, 1.2, 0.8, 16]} /><meshLambertMaterial color="#87CEEB" transparent opacity={0.3} /></mesh>
        <mesh position={[0.3, 0.5, 0.2]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#FF1493" /></mesh>
        <mesh position={[-0.2, 0.5, -0.3]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#00FF7F" /></mesh>
        <mesh position={[0.1, 0.5, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#FFD700" /></mesh>
      </group>
      
      <pointLight position={[0, 6, 0]} intensity={1.3} color="#FFF8DC" />
    </group>
  );
};

// 미술실
const ArtroomRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 나무 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>
      
      {/* 밝은 벽 */}
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#FFFAF0" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#F0F8FF" /></mesh>
      
      {/* 이젤 */}
      <group position={[-3, -0.5, 1]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.1, 2, 0.1]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 1.5, 0.5]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[1.2, 1.5, 0.05]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* 물감 팔레트 */}
      <group position={[3, -0.8, 2]}>
        <mesh><cylinderGeometry args={[0.6, 0.6, 0.05, 32]} /><meshLambertMaterial color="#F5F5DC" /></mesh>
        <mesh position={[0.2, 0.05, 0.2]}><sphereGeometry args={[0.1, 12, 12]} /><meshLambertMaterial color="#FF0000" /></mesh>
        <mesh position={[-0.2, 0.05, 0.2]}><sphereGeometry args={[0.1, 12, 12]} /><meshLambertMaterial color="#0000FF" /></mesh>
        <mesh position={[0, 0.05, -0.2]}><sphereGeometry args={[0.1, 12, 12]} /><meshLambertMaterial color="#FFFF00" /></mesh>
      </group>
      
      {/* 크레용 상자 */}
      <group position={[-5, -1, 3]}>
        <mesh><boxGeometry args={[1, 0.3, 0.5]} /><meshLambertMaterial color="#FF6347" /></mesh>
        <mesh position={[-0.3, 0.2, 0]}><cylinderGeometry args={[0.05, 0.05, 0.3, 8]} /><meshLambertMaterial color="#FF1493" /></mesh>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.05, 0.05, 0.3, 8]} /><meshLambertMaterial color="#00CED1" /></mesh>
        <mesh position={[0.3, 0.2, 0]}><cylinderGeometry args={[0.05, 0.05, 0.3, 8]} /><meshLambertMaterial color="#32CD32" /></mesh>
      </group>
      
      {/* 작품 전시 */}
      <group position={[5, 1, -5]}>
        <mesh><boxGeometry args={[1.5, 1.2, 0.05]} /><meshLambertMaterial color="#FFD700" /></mesh>
        <mesh position={[2, 0, 0]}><boxGeometry args={[1.2, 1.5, 0.05]} /><meshLambertMaterial color="#FF69B4" /></mesh>
      </group>
      
      <pointLight position={[0, 7, 0]} intensity={1.5} color="#FFFFFF" />
      <pointLight position={[-4, 3, 2]} intensity={0.7} color="#FFF8DC" />
    </group>
  );
};

// 도서관
const LibraryRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 나무 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      
      {/* 벽 */}
      <mesh position={[0, 3, -18]}><planeGeometry args={[40, 10]} /><meshLambertMaterial color="#F5DEB3" /></mesh>
      <mesh position={[-18, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[36, 10]} /><meshLambertMaterial color="#FAEBD7" /></mesh>
      
      {/* 책장 1 */}
      <group position={[-6, 0, -5]}>
        <mesh><boxGeometry args={[2, 4, 0.5]} /><meshLambertMaterial color="#654321" /></mesh>
        <mesh position={[-0.7, 1, 0.3]}><boxGeometry args={[0.15, 1, 0.35]} /><meshLambertMaterial color="#FF6B6B" /></mesh>
        <mesh position={[-0.5, 1, 0.3]}><boxGeometry args={[0.15, 1, 0.35]} /><meshLambertMaterial color="#4ECDC4" /></mesh>
        <mesh position={[-0.3, 1, 0.3]}><boxGeometry args={[0.15, 1, 0.35]} /><meshLambertMaterial color="#FFE66D" /></mesh>
        <mesh position={[0.3, 0, 0.3]}><boxGeometry args={[0.15, 0.8, 0.35]} /><meshLambertMaterial color="#95E1D3" /></mesh>
        <mesh position={[0.5, 0, 0.3]}><boxGeometry args={[0.15, 0.8, 0.35]} /><meshLambertMaterial color="#C7CEEA" /></mesh>
      </group>
      
      {/* 책장 2 */}
      <group position={[6, 0, -5]}>
        <mesh><boxGeometry args={[2, 4, 0.5]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[-0.6, -1, 0.3]}><boxGeometry args={[0.15, 0.9, 0.35]} /><meshLambertMaterial color="#FF69B4" /></mesh>
        <mesh position={[0.6, 1.5, 0.3]}><boxGeometry args={[0.15, 1.2, 0.35]} /><meshLambertMaterial color="#87CEEB" /></mesh>
      </group>
      
      {/* 독서 테이블 */}
      <group position={[0, -1, 2]}>
        <mesh><boxGeometry args={[3, 0.1, 2]} /><meshLambertMaterial color="#A0522D" /></mesh>
        <mesh position={[-1.2, -0.5, -0.8]}><cylinderGeometry args={[0.1, 0.1, 1, 16]} /><meshLambertMaterial color="#654321" /></mesh>
        <mesh position={[1.2, -0.5, -0.8]}><cylinderGeometry args={[0.1, 0.1, 1, 16]} /><meshLambertMaterial color="#654321" /></mesh>
      </group>
      
      {/* 쿠션 의자 */}
      <group position={[-2, -1.3, 3]}>
        <mesh><boxGeometry args={[0.8, 0.3, 0.8]} /><meshLambertMaterial color="#DDA0DD" /></mesh>
        <mesh position={[0, 0.5, -0.3]}><boxGeometry args={[0.8, 0.6, 0.2]} /><meshLambertMaterial color="#DDA0DD" /></mesh>
      </group>
      
      {/* 읽기 램프 */}
      <group position={[0, 0, 2]}>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.05, 0.05, 1, 16]} /><meshLambertMaterial color="#696969" /></mesh>
        <mesh position={[0, 1, 0]}><coneGeometry args={[0.3, 0.5, 16]} /><meshLambertMaterial color="#FFD700" /></mesh>
      </group>
      
      <pointLight position={[0, 6, 0]} intensity={1} color="#FFFACD" />
      <pointLight position={[0, 1.2, 2]} intensity={0.8} color="#FFF8DC" />
    </group>
  );
};

// 정원
const GardenRoom = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={groupRef}>
      {/* 잔디 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#98FB98" />
      </mesh>
      
      {/* 하늘 */}
      <mesh position={[0, 8, -25]}>
        <planeGeometry args={[60, 20]} />
        <meshLambertMaterial color="#B0E0E6" />
      </mesh>
      
      {/* 꽃밭 1 */}
      <group position={[-5, -1.8, 2]}>
        <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /><meshLambertMaterial color="#228B22" /></mesh>
        <mesh position={[0.4, 0.3, 0.2]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0.4, 0, 0.2]}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /><meshLambertMaterial color="#228B22" /></mesh>
        <mesh position={[-0.4, 0.3, -0.2]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.3} /></mesh>
        <mesh position={[-0.4, 0, -0.2]}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /><meshLambertMaterial color="#228B22" /></mesh>
      </group>
      
      {/* 꽃밭 2 */}
      <group position={[5, -1.8, 3]}>
        <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#9370DB" emissive="#9370DB" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /><meshLambertMaterial color="#228B22" /></mesh>
        <mesh position={[0.3, 0.3, 0.3]}><sphereGeometry args={[0.15, 12, 12]} /><meshLambertMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0.3, 0, 0.3]}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /><meshLambertMaterial color="#228B22" /></mesh>
      </group>
      
      {/* 나비 */}
      <group position={[-3, 1, 0]}>
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshLambertMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshLambertMaterial color="#FFB6C1" emissive="#FFB6C1" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* 작은 나무 */}
      <group position={[0, -1, -5]}>
        <mesh><cylinderGeometry args={[0.2, 0.25, 2, 12]} /><meshLambertMaterial color="#8B4513" /></mesh>
        <mesh position={[0, 1.5, 0]}><sphereGeometry args={[1, 12, 12]} /><meshLambertMaterial color="#32CD32" /></mesh>
      </group>
      
      {/* 정원 벤치 */}
      <group position={[-3, -1.5, -2]}>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[1.5, 0.1, 0.6]} /><meshLambertMaterial color="#D2691E" /></mesh>
        <mesh position={[0, 0.5, -0.25]}><boxGeometry args={[1.5, 0.5, 0.1]} /><meshLambertMaterial color="#CD853F" /></mesh>
      </group>
      
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#FFFACD" />
      <pointLight position={[-3, 2, 0]} intensity={0.5} color="#FF69B4" />
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

export type RoomType = 'counseling' | 'office' | 'home' | 'bedroom' | 'school' | 'club' | 'living' | 'outdoor' | 'playground' | 'toyroom' | 'artroom' | 'library' | 'garden';

interface CounselingRoomProps {
  children?: React.ReactNode;
  roomType?: RoomType;
  enableMovement?: boolean;
  avatarUrl?: string;
  emotion?: EmotionType;
  emotionIntensity?: number;
  onObjectInteract?: (id: string, content: string) => void;
  onDoorClick?: () => void;
  isSpeaking?: boolean;
  counselorGesture?: GestureType | null;
  counselorEmotion?: CounselorEmotion;
  avatarCustomization?: AvatarCustomization;
  groupMode?: boolean;
  userName?: string;
  avatarPosition?: { x: number; y: number; z: number };
  showGame?: boolean;
  virtualInput?: { x: number; y: number };
  character?: CharacterType;
  onGroupUsersChange?: (users: any[]) => void;
  userGesture?: GestureType | null;
  onPositionChange?: (position: { x: number; y: number; z: number }) => void;
  decorationItems?: Array<{id: string; type: string; position: [number, number, number]}>;
}

const CounselingRoom = ({
  children, 
  roomType = 'counseling',
  enableMovement = false,
  avatarUrl,
  emotion = 'neutral',
  emotionIntensity = 0.5,
  onObjectInteract,
  onDoorClick,
  isSpeaking = false,
  counselorGesture,
  counselorEmotion = 'neutral',
  avatarCustomization,
  groupMode = false,
  userName = 'User',
  avatarPosition,
  showGame = false,
  virtualInput,
  character,
  onGroupUsersChange,
  userGesture = null,
  onPositionChange,
  decorationItems = []
}: CounselingRoomProps) => {
  const { toast } = useToast();
  // 공간별 설정
  const getRoomSettings = () => {
    switch (roomType) {
      case 'office':
        return { preset: 'city' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#E0E8F0' };
      case 'home':
        return { preset: 'apartment' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#FFF5E6' };
      case 'bedroom':
        return { preset: 'night' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#E6E6FA' };
      case 'school':
        return { preset: 'dawn' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#F0F8FF' };
      case 'club':
        return { preset: 'warehouse' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#FFF0F5' };
      case 'living':
        return { preset: 'sunset' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#FFF8DC' };
      case 'outdoor':
        return { preset: 'park' as const, cameraPos: [0, 4, 14] as [number, number, number], ambientColor: '#E0FFE0' };
      default:
        return { preset: 'sunset' as const, cameraPos: [0, 3, 12] as [number, number, number], ambientColor: '#F0F8FF' };
    }
  };

  const settings = getRoomSettings();

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={settings.cameraPos} fov={65} />
          
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
          <Room type={roomType} isChildMode={!!character} onDoorClick={onDoorClick} />
          
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

          {/* AI 상담사 - 캐릭터가 지정된 경우 해당 캐릭터 표시, 아니면 기본 NPC */}
          {character ? (
            <CounselingCharacter 
              character={character}
              position={[-6, 0, 0]}
              scale={0.9}
            />
          ) : (
            <CounselorNPC 
              position={[-4, -1.5, 2]} 
              isSpeaking={isSpeaking}
              name="메타상담사"
              gesture={counselorGesture}
              emotion={counselorEmotion}
              targetPosition={avatarPosition}
            />
          )}
          
          {/* 아바타와 이동 컨트롤러 */}
          {enableMovement ? (
            <CharacterController 
              speed={0.15} 
              enabled={enableMovement} 
              virtualInput={virtualInput}
              onPositionChange={(pos) => {
                if (onPositionChange) {
                  onPositionChange({ x: pos.x, y: pos.y, z: pos.z });
                }
              }}
            >
              <ReadyPlayerMeAvatar 
                position={[0, 0, 0]} 
                avatarUrl={avatarUrl}
                scale={0.9}
                emotion={emotion}
                emotionIntensity={emotionIntensity}
                customization={avatarCustomization}
                gesture={userGesture}
              />
            </CharacterController>
          ) : (
            <ReadyPlayerMeAvatar 
              position={[2, -1.5, 3]} 
              avatarUrl={avatarUrl}
              scale={0.9}
              emotion={emotion}
              emotionIntensity={emotionIntensity}
              customization={avatarCustomization}
              gesture={userGesture}
            />
          )}

          {/* 사용자가 추가한 데코레이션 아이템들 */}
          {decorationItems.map((item) => {
            const renderItem = (type: string) => {
              switch(type) {
                case 'furniture':
                  return (
                    <group>
                      <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1, 0.5, 1]} />
                        <meshLambertMaterial color="#8B4513" />
                      </mesh>
                      <mesh position={[0, 0.4, 0]}>
                        <boxGeometry args={[0.9, 0.1, 0.9]} />
                        <meshLambertMaterial color="#A0522D" />
                      </mesh>
                    </group>
                  );
                case 'plant':
                  return (
                    <group>
                      {/* 화분 */}
                      <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.3, 0.4, 0.5, 8]} />
                        <meshLambertMaterial color="#8B4513" />
                      </mesh>
                      {/* 식물 */}
                      <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.4, 16, 16]} />
                        <meshLambertMaterial color="#228B22" />
                      </mesh>
                    </group>
                  );
                case 'picture':
                  return (
                    <group>
                      <mesh>
                        <boxGeometry args={[0.8, 0.6, 0.1]} />
                        <meshLambertMaterial color="#FFD700" />
                      </mesh>
                      <mesh position={[0, 0, 0.06]}>
                        <planeGeometry args={[0.7, 0.5]} />
                        <meshLambertMaterial color="#87CEEB" />
                      </mesh>
                    </group>
                  );
                case 'light':
                  return (
                    <group>
                      <mesh>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshLambertMaterial 
                          color="#FFF8DC" 
                          emissive="#FFE4B5"
                          emissiveIntensity={0.8}
                        />
                      </mesh>
                      <pointLight intensity={1} distance={5} color="#FFF8DC" />
                    </group>
                  );
                default:
                  return (
                    <mesh>
                      <boxGeometry args={[0.5, 0.5, 0.5]} />
                      <meshLambertMaterial color="#CCCCCC" />
                    </mesh>
                  );
              }
            };

            return (
              <group key={item.id} position={item.position}>
                {renderItem(item.type)}
              </group>
            );
          })}
          
          {/* 그룹 Presence - 다른 사용자들 */}
          {groupMode && (
            <GroupPresence
              roomId={roomType}
              userName={userName}
              avatarUrl={avatarUrl}
              position={avatarPosition}
              emotion={emotion}
              enabled={groupMode}
              onUsersChange={onGroupUsersChange}
            />
          )}
          
          {/* 캐치볼 게임 */}
          {showGame && (
            <CatchBallGame 
              position={[2, -1, 0]}
              isActive={showGame}
              onCatch={() => {
                toast({
                  title: "🎯 캐치!",
                  description: "잘했어요! 스트레스가 해소됩니다.",
                });
              }}
            />
          )}
          
          {/* 카메라 컨트롤 - 이동 모드가 아닐 때만 활성화 */}
          {!enableMovement && (
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 3}
              target={[0, 0, 0]}
            />
          )}
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