import { useRef, useState, useEffect, useMemo } from 'react';
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

      {/* 좌우 나무들 */}
      {Array.from({ length: 30 }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -i * 8 + 10;
        const x = side * (4 + Math.random() * 3);
        const scale = 0.8 + Math.random() * 0.6;
        return <CartoonTree key={`tree-${i}`} position={[x, 0, z]} scale={scale} />;
      })}

      {/* 꽃들 */}
      {Array.from({ length: 40 }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -i * 5 + 15;
        const x = side * (2 + Math.random() * 6);
        const colors = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b'];
        return (
          <Float key={`flower-${i}`} speed={2} floatIntensity={0.3}>
            <mesh position={[x, 0.3, z]} castShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={colors[i % colors.length]} />
            </mesh>
            <mesh position={[x, 0.1, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
              <meshStandardMaterial color="#2d5a27" />
            </mesh>
          </Float>
        );
      })}

      {/* 반딧불이 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={`firefly-${i}`} speed={1 + Math.random() * 2} floatIntensity={1}>
          <mesh position={[
            (Math.random() - 0.5) * 15,
            1 + Math.random() * 3,
            -Math.random() * 100
          ]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={2}
            />
          </mesh>
        </Float>
      ))}

      {/* 버섯들 */}
      {Array.from({ length: 15 }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -i * 10 + 5;
        const x = side * (3 + Math.random() * 2);
        return <CartoonMushroom key={`mush-${i}`} position={[x, 0, z]} />;
      })}
    </group>
  );
}

function CartoonTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const treeRef = useRef<THREE.Group>(null);
  const leafColor = useMemo(() => {
    const colors = ['#2d7d46', '#3a9d5e', '#4fb970', '#1b5e2a'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* 나무 줄기 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 3, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* 나뭇잎 (둥근 형태) */}
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
      {/* 점들 */}
      <mesh position={[0.1, 0.4, 0.1]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ============ 스토리 포인트 오브젝트 ============

function StoryPointMarker({ position, active, emoji }: {
  position: [number, number, number];
  active: boolean;
  emoji: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current && active) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position}>
      {/* 빛나는 원형 마커 */}
      {active && (
        <>
          <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.08, 8, 32]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={1.5}
            />
          </mesh>
          <pointLight position={[0, 2, 0]} intensity={2} color="#ffd700" distance={8} />
        </>
      )}
      {/* 중앙 플로팅 구체 */}
      <Float speed={3} floatIntensity={0.5}>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={active ? '#ffd700' : '#888888'}
            emissive={active ? '#ffa500' : '#333333'}
            emissiveIntensity={active ? 1 : 0.2}
            transparent
            opacity={active ? 1 : 0.4}
          />
        </mesh>
      </Float>
    </group>
  );
}

// ============ 캐릭터 (간단한 귀여운 캐릭터) ============

function PlayerCharacter({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null);
  const bobOffset = useRef(0);

  useFrame((state) => {
    if (ref.current) {
      bobOffset.current = Math.sin(state.clock.elapsedTime * 4) * 0.05;
      ref.current.position.y = position.y + bobOffset.current;
      ref.current.position.x = position.x;
      ref.current.position.z = position.z;
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
        {/* 몸 */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.3, 8, 16]} />
          <meshStandardMaterial color={c.body} />
        </mesh>
        {/* 머리 */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color={c.body} />
        </mesh>
        {/* 눈 */}
        <mesh position={[-0.12, 1.15, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.12, 1.15, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* 귀 */}
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
        {/* 느낌표 (도움 요청) */}
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

// ============ 자동 이동 카메라 시스템 ============

interface CameraControllerProps {
  targetZ: number;
  isMoving: boolean;
  speed?: number;
}

function CameraController({ targetZ, isMoving, speed = 4 }: CameraControllerProps) {
  const { camera } = useThree();
  const currentZ = useRef(5);

  useEffect(() => {
    camera.position.set(0, 2.5, 5);
    camera.lookAt(0, 1, 0);
  }, []);

  useFrame((_, delta) => {
    if (isMoving) {
      currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ + 5, delta * speed * 0.3);
    } else {
      currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ + 4, delta * 2);
    }
    camera.position.set(0, 2.5, currentZ.current);
    camera.lookAt(0, 1, targetZ);
  });

  return null;
}

// ============ 메인 3D 월드 컴포넌트 ============

interface GameCounseling3DWorldProps {
  scene: StoryScene | null;
  sceneIndex: number;
  totalScenes: number;
  onChoice: (choice: StoryChoice) => void;
  isWalking: boolean;
  showChoices: boolean;
}

export default function GameCounseling3DWorld({
  scene,
  sceneIndex,
  totalScenes,
  onChoice,
  isWalking,
  showChoices
}: GameCounseling3DWorldProps) {
  const storyPointZ = useMemo(() => {
    return Array.from({ length: totalScenes }, (_, i) => -i * 15);
  }, [totalScenes]);

  const currentTargetZ = storyPointZ[sceneIndex] || 0;
  const playerPos = useMemo(() => new THREE.Vector3(0, 0, currentTargetZ), [currentTargetZ]);

  const npcTypes: Array<'bunny' | 'bear' | 'owl' | 'fox'> = ['bunny', 'bear', 'owl', 'fox'];

  return (
    <div className="w-full h-[50vh] md:h-[55vh] rounded-xl overflow-hidden relative">
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 500 }}>
        {/* 하늘 */}
        <color attach="background" args={['#1a0533']} />
        <fog attach="fog" args={['#1a0533', 30, 100]} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />

        {/* 조명 */}
        <ambientLight intensity={0.4} color="#b8a9c9" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.8}
          color="#ffeedd"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 5, currentTargetZ]} intensity={1.5} color="#ffd700" distance={20} />

        {/* 카메라 컨트롤 */}
        <CameraController targetZ={currentTargetZ} isMoving={isWalking} />

        {/* 환경 */}
        <FairyTaleForest />

        {/* 스토리 포인트 마커들 */}
        {storyPointZ.map((z, i) => (
          <StoryPointMarker
            key={`sp-${i}`}
            position={[0, 0, z]}
            active={i === sceneIndex}
            emoji="⭐"
          />
        ))}

        {/* NPC들 (각 스토리 포인트에) */}
        {storyPointZ.map((z, i) => (
          <NPCCharacter
            key={`npc-${i}`}
            position={[i % 2 === 0 ? 2 : -2, 0, z]}
            type={npcTypes[i % npcTypes.length]}
          />
        ))}

        {/* 플레이어 캐릭터 */}
        <PlayerCharacter position={playerPos} />
      </Canvas>

      {/* 이동 중 표시 */}
      {isWalking && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
          <p className="text-white text-sm animate-pulse">🚶 이동 중...</p>
        </div>
      )}
    </div>
  );
}
