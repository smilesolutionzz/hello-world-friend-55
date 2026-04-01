import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

// ============ 마을 건물 ============
function VillageHouse({ position, color, roofColor, scale = 1 }: { 
  position: [number, number, number]; color: string; roofColor: string; scale?: number 
}) {
  return (
    <group position={position} scale={scale}>
      {/* 벽 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.4, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* 지붕 */}
      <mesh position={[0, 3, 0]} castShadow>
        <coneGeometry args={[2.2, 1.8, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} />
      </mesh>
      {/* 문 */}
      <mesh position={[0, 0.7, 1.11]}>
        <boxGeometry args={[0.7, 1.4, 0.1]} />
        <meshStandardMaterial color="#5C3317" roughness={0.8} />
      </mesh>
      {/* 창문 */}
      <mesh position={[0.8, 1.5, 1.11]}>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.8, 1.5, 1.11]}>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

// ============ 빵집 ============
function Bakery({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <VillageHouse position={[0, 0, 0]} color="#FFF0DB" roofColor="#D2691E" scale={1.2} />
      {/* 간판 */}
      <mesh position={[0, 3.2, 1.5]}>
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* 빵 장식 */}
      <mesh position={[1.5, 0.5, 1.5]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#DAA520" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ============ 놀이터 ============
function Playground({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 그네 프레임 */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3, 0.15, 0.15]} />
        <meshStandardMaterial color="#FF6347" />
      </mesh>
      <mesh position={[-1.4, 1, 0]}>
        <boxGeometry args={[0.15, 2, 0.15]} />
        <meshStandardMaterial color="#FF6347" />
      </mesh>
      <mesh position={[1.4, 1, 0]}>
        <boxGeometry args={[0.15, 2, 0.15]} />
        <meshStandardMaterial color="#FF6347" />
      </mesh>
      {/* 미끄럼틀 */}
      <mesh position={[4, 1.2, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.8, 3, 0.05]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[3.2, 2.6, 0]}>
        <boxGeometry args={[0.15, 2.5, 0.15]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      {/* 시소 */}
      <mesh position={[-3, 0.3, 2]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[3, 0.12, 0.4]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      <mesh position={[-3, 0.15, 2]}>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 6]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
    </group>
  );
}

// ============ 시장 가판대 ============
function MarketStall({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* 가판대 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.8, 0.15, 1]} />
        <meshStandardMaterial color="#DEB887" roughness={0.8} />
      </mesh>
      {/* 다리 */}
      {[[-0.7, 0, -0.35], [0.7, 0, -0.35], [-0.7, 0, 0.35], [0.7, 0, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}
      {/* 천막 */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* 천막 기둥 */}
      <mesh position={[-0.9, 1.3, 0]}>
        <boxGeometry args={[0.08, 1.4, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.9, 1.3, 0]}>
        <boxGeometry args={[0.08, 1.4, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

// ============ 해바라기 ============
function Sunflower({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* 줄기 */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      {/* 꽃 */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 12]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.15} />
      </mesh>
      {/* 꽃 중심 */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

// ============ 마을 NPC 캐릭터 (피코툰 스타일) ============
function VillageNPC({ position, type, onClick }: { 
  position: [number, number, number]; 
  type: 'baker' | 'grandma' | 'kid1' | 'kid2' | 'mayor' | 'crying_kid';
  onClick?: () => void;
}) {
  const npcConfig = {
    baker: { body: '#FFFFFF', pants: '#1E3A5F', hair: '#3D2B1F', hat: '#FFFFFF', accent: '#FF6347', skinTone: '#FDBCB4' },
    grandma: { body: '#9370DB', pants: '#4B0082', hair: '#C0C0C0', hat: null, accent: '#FFB6C1', skinTone: '#FDBCB4' },
    kid1: { body: '#FF6B6B', pants: '#4169E1', hair: '#2C1608', hat: '#FFD700', accent: '#32CD32', skinTone: '#F4C2A1' },
    kid2: { body: '#4ECDC4', pants: '#2F4858', hair: '#8B4513', hat: '#FF69B4', accent: '#FF8C00', skinTone: '#D2A679' },
    mayor: { body: '#2F4F4F', pants: '#1C1C1C', hair: '#696969', hat: '#000000', accent: '#FFD700', skinTone: '#FDBCB4' },
    crying_kid: { body: '#87CEEB', pants: '#6B8E23', hair: '#FFD700', hat: null, accent: '#FF1493', skinTone: '#FFE0BD' },
  };
  const c = npcConfig[type];
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // 생동감 있는 idle 애니메이션
  useFrame((state) => {
    if (ref.current) {
      // 부드러운 호흡 효과
      ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.02;
      // 좌우 미세 흔들림
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + position[2] * 5) * 0.08;
    }
  });

  return (
    <group 
      ref={ref} 
      position={position} 
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 다리 */}
      <mesh position={[-0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color={c.pants} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color={c.pants} />
      </mesh>
      {/* 신발 */}
      <mesh position={[-0.15, 0.05, 0.05]}>
        <boxGeometry args={[0.24, 0.12, 0.32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, 0.05, 0.05]}>
        <boxGeometry args={[0.24, 0.12, 0.32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 몸통 */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.45]} />
        <meshStandardMaterial color={c.body} roughness={0.7} />
      </mesh>
      {/* 팔 */}
      <mesh position={[-0.5, 1.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.75, 0.2]} />
        <meshStandardMaterial color={c.body} roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 1.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.75, 0.2]} />
        <meshStandardMaterial color={c.body} roughness={0.7} />
      </mesh>
      {/* 손 */}
      <mesh position={[-0.5, 0.65, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color={c.skinTone} />
      </mesh>
      <mesh position={[0.5, 0.65, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color={c.skinTone} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.6]} />
        <meshStandardMaterial color={c.skinTone} roughness={0.8} />
      </mesh>
      {/* 머리카락 */}
      <mesh position={[0, 2.1, -0.05]}>
        <boxGeometry args={[0.7, 0.35, 0.65]} />
        <meshStandardMaterial color={c.hair} roughness={0.9} />
      </mesh>
      {/* 눈 */}
      <mesh position={[-0.15, 1.88, 0.31]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 1.88, 0.31]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* 입 */}
      <mesh position={[0, 1.72, 0.31]}>
        <boxGeometry args={[type === 'crying_kid' ? 0.15 : 0.2, 0.04, 0.02]} />
        <meshStandardMaterial color={type === 'crying_kid' ? '#FF4444' : '#FF6B6B'} />
      </mesh>
      {/* 모자 (있는 경우) */}
      {c.hat && (
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[0.72, 0.2, 0.68]} />
          <meshStandardMaterial color={c.hat} />
        </mesh>
      )}
      {/* 호버 하이라이트 */}
      {hovered && (
        <mesh position={[0, 1, 0]}>
          <ringGeometry args={[0.8, 1, 16]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* 이름표 느낌표 */}
      {hovered && (
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[0.12, 0.35, 0.12]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}
    </group>
  );
}

// ============ 빛기둥 목적지 표시 ============
function LightBeam({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current && active) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });
  if (!active) return null;
  return (
    <mesh ref={ref} position={[position[0], position[1] + 4, position[2]]}>
      <cylinderGeometry args={[0.3, 0.6, 8, 8]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// PlayerCharacter removed - MovablePlayer includes its own mesh

// ============ 카메라 컨트롤 ============
function CameraController({ target, sceneId }: { target: [number, number, number]; sceneId: string }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...target));
  
  useEffect(() => {
    targetPos.current.set(...target);
  }, [target]);

  useFrame(() => {
    const lookPos = targetPos.current.clone();
    const camPos = lookPos.clone().add(new THREE.Vector3(4, 5, 8));
    camera.position.lerp(camPos, 0.03);
    camera.lookAt(lookPos);
  });

  return null;
}

// ============ 마을 환경 ============
function VillageEnvironment({ sceneId }: { sceneId: string }) {
  const isStorm = sceneId === 'storm_coming';
  const isFestival = sceneId === 'village_festival' || sceneId === 'farewell';
  
  return (
    <>
      {/* 바닥 - 잔디 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={isStorm ? '#3a5f3a' : '#5cb85c'} roughness={0.9} />
      </mesh>
      
      {/* 길 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, -5]} receiveShadow>
        <planeGeometry args={[3, 30]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.95} />
      </mesh>

      {/* 마을 건물들 */}
      <VillageHouse position={[-8, 0, -8]} color="#FFE4C4" roofColor="#CD853F" />
      <VillageHouse position={[-5, 0, -12]} color="#E0F0FF" roofColor="#4682B4" scale={0.9} />
      <VillageHouse position={[8, 0, -8]} color="#FFE0F0" roofColor="#DB7093" />
      <VillageHouse position={[12, 0, -6]} color="#F0FFF0" roofColor="#2E8B57" scale={0.8} />
      <Bakery position={[6, 0, 4]} />

      {/* 놀이터 */}
      <Playground position={[-8, 0, 6]} />

      {/* 시장 가판대 */}
      <MarketStall position={[3, 0, -5]} color="#FF6347" />
      <MarketStall position={[6, 0, -5]} color="#4682B4" />
      <MarketStall position={[9, 0, -5]} color="#32CD32" />

      {/* 해바라기 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Sunflower 
          key={i} 
          position={[
            Math.sin(i * 1.2) * 15 + (i % 3) * 2,
            0,
            Math.cos(i * 0.8) * 12 + (i % 4) * 1.5
          ]} 
        />
      ))}

      {/* NPC 배치 - 씬에 따라 다르게 */}
      <VillageNPC position={[6.5, 0, 5.5]} type="baker" />
      <VillageNPC position={[-7, 0, 7]} type="kid1" />
      <VillageNPC position={[-9, 0, 5.5]} type="kid2" />
      <VillageNPC position={[4, 0, -4.5]} type="grandma" />
      <VillageNPC position={[0, 0, -8]} type="mayor" />
      <VillageNPC position={[-3, 0, 2]} type="crying_kid" />

      {/* 벤치 */}
      <mesh position={[-3, 0.3, 2.8]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-3.6, 0.5, 2.8]}>
        <boxGeometry args={[0.1, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-2.4, 0.5, 2.8]}>
        <boxGeometry args={[0.1, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* 나무 */}
      {[[-12, 0, 2], [14, 0, -3], [-10, 0, -14], [15, 0, 10], [-15, 0, -5], [10, 0, 12]].map((pos, i) => (
        <group key={`tree-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
            <meshStandardMaterial color="#6B4226" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.5, 0]} castShadow>
            <sphereGeometry args={[1.8, 8, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2d8a4e' : '#3db06a'} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 축제 장식 */}
      {isFestival && Array.from({ length: 8 }).map((_, i) => (
        <Float key={`flag-${i}`} speed={2} floatIntensity={0.3}>
          <mesh position={[Math.sin(i * 0.8) * 6, 4, Math.cos(i * 0.8) * 6]}>
            <boxGeometry args={[0.8, 0.5, 0.02]} />
            <meshBasicMaterial color={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8FB1'][i % 5]} />
          </mesh>
        </Float>
      ))}

      {/* 분수대 (광장 중앙) */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.6, 12]} />
        <meshStandardMaterial color="#A0A0A0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
        <meshStandardMaterial color="#808080" roughness={0.5} />
      </mesh>

      {/* 하늘 */}
      <Sky 
        sunPosition={isStorm ? [0, -1, 0] : isFestival ? [5, 2, 3] : [10, 5, 5]} 
        turbidity={isStorm ? 20 : 2}
        rayleigh={isStorm ? 0.5 : 1}
      />

      {/* 조명 */}
      <ambientLight intensity={isStorm ? 0.3 : 0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={isStorm ? 0.3 : 1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {isFestival && <pointLight position={[0, 5, 0]} intensity={1} color="#FFD700" />}
      {isStorm && <pointLight position={[0, 10, 0]} intensity={0.5} color="#8888FF" />}
    </>
  );
}

// ============ 터치로 이동하는 플레이어 ============
function MovablePlayer({ startPos, targetPos, onReachTarget }: {
  startPos: [number, number, number];
  targetPos: [number, number, number];
  onReachTarget: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(...startPos));
  const moveTarget = useRef<THREE.Vector3 | null>(null);
  const arrived = useRef(false);
  const { camera, raycaster, pointer } = useThree();

  // 터치/클릭으로 바닥 위치 계산 후 이동 목표 설정
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent | TouchEvent) => {
      // UI 위의 터치는 무시
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[role="button"]') || target.tagName === 'BUTTON') return;

      // raycaster로 바닥 히트 계산
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(groundPlane, intersection);
      if (intersection) {
        moveTarget.current = intersection.clone();
        moveTarget.current.y = 0;
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      return () => canvas.removeEventListener('pointerdown', handlePointerDown);
    }
  }, [camera, raycaster, pointer]);

  useFrame(() => {
    if (!groupRef.current) return;

    // 이동 목표를 향해 걷기
    if (moveTarget.current) {
      const dir = moveTarget.current.clone().sub(posRef.current);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 0.15) {
        dir.normalize().multiplyScalar(0.08);
        posRef.current.add(dir);
        // 이동 방향 바라보기
        const angle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = angle;
      } else {
        moveTarget.current = null;
      }
      groupRef.current.position.copy(posRef.current);
    }

    // 빛기둥 도착 감지
    if (!arrived.current) {
      const beamPos = new THREE.Vector3(...targetPos);
      beamPos.y = 0;
      const playerXZ = posRef.current.clone();
      playerXZ.y = 0;
      if (playerXZ.distanceTo(beamPos) < 1.5) {
        arrived.current = true;
        onReachTarget();
      }
    }
  });

  return (
    <group ref={groupRef} position={startPos}>
      {/* 다리 */}
      <mesh position={[-0.15, 0.35, 0]}>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0.15, 0.35, 0]}>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[-0.15, 0.05, 0.05]}>
        <boxGeometry args={[0.24, 0.12, 0.32]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>
      <mesh position={[0.15, 0.05, 0.05]}>
        <boxGeometry args={[0.24, 0.12, 0.32]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>
      {/* 몸통 */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.45]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      <mesh position={[-0.5, 1.1, 0]}>
        <boxGeometry args={[0.2, 0.75, 0.2]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      <mesh position={[0.5, 1.1, 0]}>
        <boxGeometry args={[0.2, 0.75, 0.2]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[0.65, 0.65, 0.6]} />
        <meshStandardMaterial color="#FFE0BD" />
      </mesh>
      <mesh position={[0, 2.12, -0.02]}>
        <boxGeometry args={[0.7, 0.4, 0.65]} />
        <meshStandardMaterial color="#2C1608" />
      </mesh>
      <mesh position={[-0.15, 1.88, 0.31]}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 1.88, 0.31]}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 1.72, 0.31]}>
        <boxGeometry args={[0.2, 0.05, 0.02]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
    </group>
  );
}

// ============ 방향 화살표 (빛기둥 가이드) ============
function DirectionArrow({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const dir = useMemo(() => {
    const d = new THREE.Vector3(to[0] - from[0], 0, to[2] - from[2]).normalize();
    return Math.atan2(d.x, d.z);
  }, [from, to]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[2] + to[2]) / 2;

  return (
    <mesh ref={ref} position={[midX, 0.5, midZ]} rotation={[-Math.PI / 2, 0, -dir]}>
      <coneGeometry args={[0.4, 1, 4]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
    </mesh>
  );
}

// ============ 메인 3D 씬 ============
function VillageScene({ sceneId, onArrive }: { sceneId: string; onArrive: () => void }) {
  const sceneTargets: Record<string, [number, number, number]> = {
    village_square: [0, 0, 0],
    playground_conflict: [-8, 0, 6],
    bakery_help: [6, 0, 4],
    crying_child: [-3, 0, 2],
    market_delivery: [6, 0, -5],
    storm_coming: [0, 0, -2],
    village_festival: [0, 0, 0],
    farewell: [0, 0, 3],
    village_ending: [0, 0, 0],
  };
  const target = sceneTargets[sceneId] || [0, 0, 0];
  const startPos: [number, number, number] = [target[0] - 3, 0, target[2] + 5];

  return (
    <>
      <VillageEnvironment sceneId={sceneId} />
      <MovablePlayer startPos={startPos} targetPos={target} onReachTarget={onArrive} />
      <LightBeam position={target} active={true} />
      <DirectionArrow from={startPos} to={target} />
      <CameraController target={target} sceneId={sceneId} />
    </>
  );
}

// ============ 외부 인터페이스 ============
interface VillageAdventure3DWorldProps {
  currentScene: StoryScene | null;
  gameState: 'intro' | 'exploring' | 'narrating' | 'choice' | 'result';
  onArrive: (index: number) => void;
  sceneIndex: number;
  onChoiceSelect: (scene: StoryScene, choice: StoryChoice) => void;
  displayedText: string;
  selectedChoice: string | null;
  showParentNotes: boolean;
}

export default function VillageAdventure3DWorld({
  currentScene,
  gameState,
  onArrive,
  sceneIndex,
  onChoiceSelect,
  displayedText,
  selectedChoice,
  showParentNotes
}: VillageAdventure3DWorldProps) {
  const handleArrive = useCallback(() => {
    onArrive(sceneIndex);
  }, [onArrive, sceneIndex]);

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [5, 8, 12], fov: 55 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F0FF)' }}
      >
        <VillageScene 
          sceneId={currentScene?.id || 'village_square'} 
          onArrive={handleArrive} 
        />
      </Canvas>

      {/* 탐색 중 안내 */}
      {gameState === 'exploring' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-400/30"
        >
          <p className="text-white text-xs text-center">
            👆 화면을 터치해서 <span className="text-amber-400 font-bold">금색 빛기둥</span>으로 이동하세요
          </p>
        </motion.div>
      )}

      {/* 내레이션 오버레이 */}
      <AnimatePresence>
        {(gameState === 'narrating' || gameState === 'choice') && currentScene && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            {/* 내레이션 텍스트 */}
            <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 mb-3 border border-white/10">
              {currentScene.character && (
                <div className="text-amber-400 font-bold text-sm mb-1">{currentScene.character}</div>
              )}
              <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                {displayedText || currentScene.description}
              </p>
            </div>

            {/* 선택지 */}
            {gameState === 'choice' && (
              <div className="space-y-2">
                {currentScene.choices.map((choice) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChoiceSelect(currentScene, choice)}
                    disabled={!!selectedChoice}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedChoice === choice.id
                        ? 'bg-amber-500/40 border-amber-400 scale-[1.02]'
                        : selectedChoice
                        ? 'opacity-40 bg-black/30 border-white/5'
                        : 'bg-black/50 border-white/15 hover:bg-black/60 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{choice.emoji}</span>
                      <span className="text-white text-sm font-medium">{choice.text}</span>
                    </div>
                    {showParentNotes && choice.parentNote && (
                      <p className="text-amber-300/60 text-xs mt-1 ml-8">
                        👁️ {choice.parentNote}
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
