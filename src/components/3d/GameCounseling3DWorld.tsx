import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

// ============ 3D 월드 환경 요소들 ============

function FairyTaleForest() {
  return (
    <group>
      {/* 잔디 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#3a7d44" />
      </mesh>

      {/* 길 (자갈길) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 200]} />
        <meshStandardMaterial color="#c4a882" />
      </mesh>

      {/* 좌우 나무들 - 고정 위치 (seeded) */}
      {useMemo(() => {
        const trees: Array<{ x: number; z: number; scale: number }> = [];
        for (let i = 0; i < 30; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const z = -i * 8 + 10;
          const seed = Math.sin(i * 127.1) * 43758.5453;
          const rand = seed - Math.floor(seed);
          const x = side * (4 + rand * 3);
          const scale = 0.8 + ((Math.sin(i * 311.7) * 43758.5453) % 1 + 1) % 1 * 0.6;
          trees.push({ x, z, scale });
        }
        return trees;
      }, []).map((t, i) => (
        <CartoonTree key={`tree-${i}`} position={[t.x, 0, t.z]} scale={t.scale} />
      ))}

      {/* 꽃들 - 고정 위치 */}
      {useMemo(() => {
        const flowers: Array<{ x: number; z: number; colorIdx: number }> = [];
        for (let i = 0; i < 40; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const z = -i * 5 + 15;
          const seed = Math.sin(i * 253.3) * 43758.5453;
          const rand = ((seed % 1) + 1) % 1;
          const x = side * (2 + rand * 6);
          flowers.push({ x, z, colorIdx: i % 5 });
        }
        return flowers;
      }, []).map((f, i) => {
        const colors = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b'];
        return (
          <Float key={`flower-${i}`} speed={0.8} floatIntensity={0.15}>
            <mesh position={[f.x, 0.3, f.z]} castShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={colors[f.colorIdx]} />
            </mesh>
            <mesh position={[f.x, 0.1, f.z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
              <meshStandardMaterial color="#2d5a27" />
            </mesh>
          </Float>
        );
      })}

      {/* 반딧불이 - 고정 위치, 느린 움직임 */}
      {useMemo(() => {
        const flies: Array<{ x: number; y: number; z: number; speed: number }> = [];
        for (let i = 0; i < 20; i++) {
          const s1 = Math.sin(i * 437.1) * 43758.5453;
          const s2 = Math.sin(i * 191.7) * 43758.5453;
          const s3 = Math.sin(i * 317.3) * 43758.5453;
          flies.push({
            x: (((s1 % 1) + 1) % 1 - 0.5) * 15,
            y: 1 + ((s2 % 1) + 1) % 1 * 3,
            z: -((s3 % 1) + 1) % 1 * 100,
            speed: 0.5 + ((Math.sin(i * 571.9) * 43758.5453 % 1 + 1) % 1) * 0.8,
          });
        }
        return flies;
      }, []).map((f, i) => (
        <Float key={`firefly-${i}`} speed={f.speed} floatIntensity={0.5}>
          <mesh position={[f.x, f.y, f.z]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
          </mesh>
        </Float>
      ))}

      {/* 버섯들 - 고정 위치 */}
      {useMemo(() => {
        const mushrooms: Array<{ x: number; z: number }> = [];
        for (let i = 0; i < 15; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const z = -i * 10 + 5;
          const seed = Math.sin(i * 673.1) * 43758.5453;
          const x = side * (3 + ((seed % 1) + 1) % 1 * 2);
          mushrooms.push({ x, z });
        }
        return mushrooms;
      }, []).map((m, i) => (
        <CartoonMushroom key={`mush-${i}`} position={[m.x, 0, m.z]} />
      ))}
    </group>
  );
}

function CartoonTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leafColor = useMemo(() => {
    const colors = ['#2d7d46', '#3a9d5e', '#4fb970', '#1b5e2a'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 3, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
      <mesh position={[0.7, 3, 0.5]} castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
      <mesh position={[-0.5, 3.2, -0.3]} castShadow>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
    </group>
  );
}

function CartoonMushroom({ position }: { position: [number, number, number] }) {
  const colors = ['#ff6b6b', '#ffd93d', '#ff9ff3'];
  const color = useMemo(() => colors[Math.floor(Math.random() * colors.length)], []);
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 6]} />
        <meshStandardMaterial color="#f5e6d3" />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.4, 0.1]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ============ 클릭 목표 표시 ============

function ClickMarker({ position }: { position: THREE.Vector3 | null }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current && position) {
      ref.current.rotation.y = state.clock.elapsedTime * 3;
      ref.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2);
    }
  });

  if (!position) return null;

  return (
    <mesh ref={ref} position={[position.x, 0.1, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 16]} />
      <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1.5} transparent opacity={0.8} />
    </mesh>
  );
}

// ============ 스토리 포인트 오브젝트 ============

function StoryPointMarker({ position, active, visited }: {
  position: [number, number, number];
  active: boolean;
  visited: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current && active) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position}>
      {active && (
        <>
          <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.08, 8, 32]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, 2, 0]} intensity={2} color="#ffd700" distance={8} />
        </>
      )}
      <Float speed={3} floatIntensity={0.5}>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={visited ? '#555555' : active ? '#ffd700' : '#aaaaaa'}
            emissive={active ? '#ffa500' : '#333333'}
            emissiveIntensity={active ? 1 : 0.2}
            transparent
            opacity={visited ? 0.3 : active ? 1 : 0.6}
          />
        </mesh>
      </Float>
    </group>
  );
}

// ============ 플레이어 캐릭터 (직접 이동) ============

interface MovablePlayerProps {
  targetPos: THREE.Vector3 | null;
  storyPoints: THREE.Vector3[];
  currentStoryIndex: number;
  onArrive: (storyIndex: number) => void;
  onPositionUpdate: (pos: THREE.Vector3) => void;
}

function MovablePlayer({ targetPos, storyPoints, currentStoryIndex, onArrive, onPositionUpdate }: MovablePlayerProps) {
  const ref = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(0, 0, 3));
  const moveTarget = useRef<THREE.Vector3 | null>(null);
  const isMoving = useRef(false);
  const arrivedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (targetPos) {
      moveTarget.current = targetPos.clone();
      moveTarget.current.y = 0;
      isMoving.current = true;
    }
  }, [targetPos]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Move toward target
    if (isMoving.current && moveTarget.current) {
      const dir = new THREE.Vector3().subVectors(moveTarget.current, posRef.current);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.2) {
        dir.normalize();
        const speed = 5;
        const step = Math.min(speed * delta, dist);
        posRef.current.add(dir.multiplyScalar(step));

        // Face movement direction
        const angle = Math.atan2(dir.x, dir.z);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, angle, 0.15);
      } else {
        isMoving.current = false;
        moveTarget.current = null;
      }
    }

    // Bob animation
    const bob = isMoving.current ? Math.sin(Date.now() * 0.01) * 0.08 : Math.sin(Date.now() * 0.003) * 0.03;
    ref.current.position.set(posRef.current.x, bob, posRef.current.z);
    onPositionUpdate(posRef.current);

    // Check proximity to current story point
    if (currentStoryIndex < storyPoints.length && !arrivedRef.current.has(currentStoryIndex)) {
      const sp = storyPoints[currentStoryIndex];
      const d = posRef.current.distanceTo(sp);
      if (d < 2.5) {
        arrivedRef.current.add(currentStoryIndex);
        isMoving.current = false;
        moveTarget.current = null;
        onArrive(currentStoryIndex);
      }
    }
  });

  return (
    <group ref={ref}>
      {/* 몸 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.4, 8, 16]} />
        <meshStandardMaterial color="#5b8dee" />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffd5b4" />
      </mesh>
      {/* 눈 */}
      <mesh position={[-0.1, 1.25, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.1, 1.25, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* 모자 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.25, 0.4, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    </group>
  );
}

// ============ NPC 캐릭터 ============

function NPCCharacter({ position, type }: { position: [number, number, number]; type: 'bunny' | 'bear' | 'owl' | 'fox' }) {
  const colors = {
    bunny: { body: '#f5f5f5', accent: '#ffb6c1' },
    bear: { body: '#8B5E3C', accent: '#D2691E' },
    owl: { body: '#9370DB', accent: '#FFD700' },
    fox: { body: '#ff8c42', accent: '#ffffff' }
  };
  const c = colors[type];

  return (
    <Float speed={1.5} floatIntensity={0.2}>
      <group position={position}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.3, 8, 16]} />
          <meshStandardMaterial color={c.body} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color={c.body} />
        </mesh>
        <mesh position={[-0.12, 1.15, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.12, 1.15, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {type === 'bunny' && (
          <>
            <mesh position={[-0.15, 1.6, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.3, 6, 8]} />
              <meshStandardMaterial color={c.accent} />
            </mesh>
            <mesh position={[0.15, 1.6, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.3, 6, 8]} />
              <meshStandardMaterial color={c.accent} />
            </mesh>
          </>
        )}
        <Float speed={3} floatIntensity={0.5}>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1} />
          </mesh>
        </Float>
      </group>
    </Float>
  );
}

// ============ 카메라 추적 (플레이어 따라감) ============

function FollowCamera({ playerPos }: { playerPos: THREE.Vector3 }) {
  const { camera } = useThree();
  const offset = useMemo(() => new THREE.Vector3(0, 4, 6), []);
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const target = playerPos.clone().add(offset);
    // 첫 프레임은 즉시 이동, 이후 부드럽게 추적 (느리게)
    if (!initialized.current) {
      camera.position.copy(target);
      initialized.current = true;
    } else {
      camera.position.lerp(target, delta * 1.5);
    }
    const lookAt = playerPos.clone();
    lookAt.y += 1;
    camera.lookAt(lookAt);
  });

  return null;
}

// ============ 바닥 클릭 감지 ============

function ClickableGround({ onClickPosition }: { onClickPosition: (pos: THREE.Vector3) => void }) {
  const { camera, raycaster } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (planeRef.current) {
      const point = e.point as THREE.Vector3;
      onClickPosition(new THREE.Vector3(point.x, 0, point.z));
    }
  }, [onClickPosition]);

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial />
    </mesh>
  );
}

// ============ 메인 3D 월드 컴포넌트 ============

interface GameCounseling3DWorldProps {
  scene: StoryScene | null;
  sceneIndex: number;
  totalScenes: number;
  onChoice: (choice: StoryChoice) => void;
  isWalking: boolean;
  showChoices: boolean;
  onArrive?: (storyIndex: number) => void;
}

export default function GameCounseling3DWorld({
  scene,
  sceneIndex,
  totalScenes,
  onChoice,
  isWalking,
  showChoices,
  onArrive
}: GameCounseling3DWorldProps) {
  const [clickTarget, setClickTarget] = useState<THREE.Vector3 | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0, 3));
  const [visitedPoints, setVisitedPoints] = useState<Set<number>>(new Set());

  const storyPointPositions = useMemo(() => {
    return Array.from({ length: totalScenes }, (_, i) => new THREE.Vector3(0, 0, -i * 15));
  }, [totalScenes]);

  const npcTypes: Array<'bunny' | 'bear' | 'owl' | 'fox'> = ['bunny', 'bear', 'owl', 'fox'];

  const handleClickPosition = useCallback((pos: THREE.Vector3) => {
    setClickTarget(pos);
  }, []);

  const handleArrive = useCallback((idx: number) => {
    setVisitedPoints(prev => new Set(prev).add(idx));
    onArrive?.(idx);
  }, [onArrive]);

  const handlePositionUpdate = useCallback((pos: THREE.Vector3) => {
    setPlayerPos(pos.clone());
  }, []);

  return (
    <div className="w-full h-[50vh] md:h-[55vh] rounded-xl overflow-hidden relative">
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 500 }}>
        <color attach="background" args={['#1a0533']} />
        <fog attach="fog" args={['#1a0533', 30, 100]} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />

        <ambientLight intensity={0.4} color="#b8a9c9" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.8}
          color="#ffeedd"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 5, playerPos.z]} intensity={1.5} color="#ffd700" distance={20} />

        {/* 카메라가 플레이어를 추적 */}
        <FollowCamera playerPos={playerPos} />

        {/* 바닥 클릭 감지 (투명 레이어) */}
        <ClickableGround onClickPosition={handleClickPosition} />

        {/* 환경 */}
        <FairyTaleForest />

        {/* 클릭 위치 표시 */}
        <ClickMarker position={clickTarget} />

        {/* 스토리 포인트 마커들 */}
        {storyPointPositions.map((sp, i) => (
          <StoryPointMarker
            key={`sp-${i}`}
            position={[sp.x, sp.y, sp.z]}
            active={i === sceneIndex}
            visited={visitedPoints.has(i)}
          />
        ))}

        {/* NPC들 */}
        {storyPointPositions.map((sp, i) => (
          <NPCCharacter
            key={`npc-${i}`}
            position={[i % 2 === 0 ? 2 : -2, 0, sp.z]}
            type={npcTypes[i % npcTypes.length]}
          />
        ))}

        {/* 직접 조작 플레이어 */}
        <MovablePlayer
          targetPos={clickTarget}
          storyPoints={storyPointPositions}
          currentStoryIndex={sceneIndex}
          onArrive={handleArrive}
          onPositionUpdate={handlePositionUpdate}
        />
      </Canvas>

      {/* 안내 메시지 */}
      {!isWalking && showChoices === false && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
          <p className="text-white text-sm animate-pulse">👆 화면을 터치해서 이동하세요!</p>
        </div>
      )}
    </div>
  );
}
