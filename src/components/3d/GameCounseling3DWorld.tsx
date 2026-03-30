import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryScene, StoryChoice } from '@/data/storyScenarios';

// ============ 로블록스풍 블록 나무 ============

function BlockyTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leafColor = useMemo(() => {
    const colors = ['#2d8a4e', '#3db06a', '#45c96e', '#26753f'];
    const seed = Math.sin(position[0] * 127.1 + position[2] * 311.7) * 43758.5453;
    return colors[Math.floor(((seed % 1) + 1) % 1 * colors.length)];
  }, [position]);

  return (
    <group position={position} scale={scale}>
      {/* 나무 기둥 (블록형) */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.6, 3, 0.6]} />
        <meshStandardMaterial color="#6B4226" roughness={0.9} />
      </mesh>
      {/* 나뭇잎 블록 (큰 블록 조합) */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[2.5, 2, 2.5]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[1.8, 1.4, 1.8]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.7, 0]} castShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ============ 로블록스풍 캐릭터 ============

function RobloxCharacter({ position, type }: { position: [number, number, number]; type: 'bunny' | 'bear' | 'owl' | 'fox' }) {
  const colors = {
    bunny: { body: '#f0f0f0', head: '#f0f0f0', accent: '#ffb6c1', hat: '#ff69b4' },
    bear: { body: '#8B5E3C', head: '#A0724F', accent: '#D2691E', hat: '#654321' },
    owl: { body: '#7B68EE', head: '#9370DB', accent: '#FFD700', hat: '#4B0082' },
    fox: { body: '#ff7733', head: '#ff8844', accent: '#ffffff', hat: '#cc4400' },
  };
  const c = colors[type];

  return (
    <Float speed={1} floatIntensity={0.15}>
      <group position={position}>
        {/* 몸통 (블록) */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.7, 1, 0.5]} />
          <meshStandardMaterial color={c.body} roughness={0.8} />
        </mesh>
        {/* 머리 (블록) */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshStandardMaterial color={c.head} roughness={0.7} />
        </mesh>
        {/* 눈 */}
        <mesh position={[-0.15, 1.65, 0.33]}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0.15, 1.65, 0.33]}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* 팔 */}
        <mesh position={[-0.5, 0.7, 0]} castShadow>
          <boxGeometry args={[0.25, 0.8, 0.25]} />
          <meshStandardMaterial color={c.body} roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.7, 0]} castShadow>
          <boxGeometry args={[0.25, 0.8, 0.25]} />
          <meshStandardMaterial color={c.body} roughness={0.8} />
        </mesh>
        {/* 다리 */}
        <mesh position={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.5, 0.3]} />
          <meshStandardMaterial color={c.accent} roughness={0.8} />
        </mesh>
        <mesh position={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.5, 0.3]} />
          <meshStandardMaterial color={c.accent} roughness={0.8} />
        </mesh>
        {/* 모자/귀 */}
        {type === 'bunny' && (
          <>
            <mesh position={[-0.15, 2.2, 0]} castShadow>
              <boxGeometry args={[0.12, 0.5, 0.1]} />
              <meshStandardMaterial color={c.accent} />
            </mesh>
            <mesh position={[0.15, 2.2, 0]} castShadow>
              <boxGeometry args={[0.12, 0.5, 0.1]} />
              <meshStandardMaterial color={c.accent} />
            </mesh>
          </>
        )}
        {type === 'fox' && (
          <>
            <mesh position={[-0.2, 2.05, 0]} castShadow rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.12, 0.3, 4]} />
              <meshStandardMaterial color={c.body} />
            </mesh>
            <mesh position={[0.2, 2.05, 0]} castShadow rotation={[0, 0, -0.2]}>
              <coneGeometry args={[0.12, 0.3, 4]} />
              <meshStandardMaterial color={c.body} />
            </mesh>
          </>
        )}
        {/* 이름표 (빛나는 구슬) */}
        <Float speed={3} floatIntensity={0.4}>
          <mesh position={[0, 2.4, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1.5} />
          </mesh>
        </Float>
      </group>
    </Float>
  );
}

// ============ 로블록스풍 환경 ============

function RobloxWorld() {
  return (
    <group>
      {/* 잔디 바닥 (청크 느낌) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4CAF50" roughness={1} />
      </mesh>

      {/* 길 (블록형 돌길) */}
      {useMemo(() => {
        const stones: Array<{ x: number; z: number; w: number; d: number }> = [];
        for (let i = 0; i < 100; i++) {
          const z = -i * 2;
          const seed1 = Math.sin(i * 127.1) * 43758.5453;
          const seed2 = Math.sin(i * 311.7) * 43758.5453;
          const x = (((seed1 % 1) + 1) % 1 - 0.5) * 1.5;
          const w = 0.8 + ((seed2 % 1) + 1) % 1 * 1.2;
          stones.push({ x, z, w, d: 0.6 + ((Math.sin(i * 437.3) * 43758.5453 % 1 + 1) % 1) * 0.8 });
        }
        return stones;
      }, []).map((s, i) => (
        <mesh key={`stone-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[s.x, 0.01, s.z]} receiveShadow>
          <planeGeometry args={[s.w, s.d]} />
          <meshStandardMaterial color="#b8a88a" roughness={0.95} />
        </mesh>
      ))}

      {/* 나무들 */}
      {useMemo(() => {
        const trees: Array<{ x: number; z: number; scale: number }> = [];
        for (let i = 0; i < 40; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const z = -i * 7 + 15;
          const seed = Math.sin(i * 127.1) * 43758.5453;
          const rand = ((seed % 1) + 1) % 1;
          const x = side * (5 + rand * 4);
          const scale = 0.7 + ((Math.sin(i * 311.7) * 43758.5453 % 1 + 1) % 1) * 0.8;
          trees.push({ x, z, scale });
        }
        return trees;
      }, []).map((t, i) => (
        <BlockyTree key={`tree-${i}`} position={[t.x, 0, t.z]} scale={t.scale} />
      ))}

      {/* 꽃들 (작은 블록 꽃) */}
      {useMemo(() => {
        const flowers: Array<{ x: number; z: number; colorIdx: number }> = [];
        for (let i = 0; i < 50; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const z = -i * 4 + 20;
          const seed = Math.sin(i * 253.3) * 43758.5453;
          const rand = ((seed % 1) + 1) % 1;
          const x = side * (2.5 + rand * 7);
          flowers.push({ x, z, colorIdx: i % 5 });
        }
        return flowers;
      }, []).map((f, i) => {
        const colors = ['#ff4081', '#ffeb3b', '#e040fb', '#00e5ff', '#ff6e40'];
        return (
          <group key={`flower-${i}`} position={[f.x, 0, f.z]}>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.08, 0.3, 0.08]} />
              <meshStandardMaterial color="#388E3C" />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.25, 0.15, 0.25]} />
              <meshStandardMaterial color={colors[f.colorIdx]} emissive={colors[f.colorIdx]} emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* 버섯 (큰 블록 버섯) */}
      {useMemo(() => {
        const mushrooms: Array<{ x: number; z: number }> = [];
        for (let i = 0; i < 20; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const z = -i * 10 + 5;
          const seed = Math.sin(i * 673.1) * 43758.5453;
          const x = side * (3.5 + ((seed % 1) + 1) % 1 * 3);
          mushrooms.push({ x, z });
        }
        return mushrooms;
      }, []).map((m, i) => {
        const capColors = ['#ff1744', '#ff9100', '#aa00ff'];
        const capColor = capColors[i % capColors.length];
        return (
          <group key={`mush-${i}`} position={[m.x, 0, m.z]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#f5e6d3" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[0.6, 0.3, 0.6]} />
              <meshStandardMaterial color={capColor} roughness={0.7} />
            </mesh>
            {/* 흰 점 */}
            <mesh position={[0.15, 0.86, 0.15]}>
              <boxGeometry args={[0.1, 0.02, 0.1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}

      {/* 구름 (블록형) */}
      {useMemo(() => {
        const clouds: Array<{ x: number; y: number; z: number; scale: number }> = [];
        for (let i = 0; i < 15; i++) {
          const s1 = Math.sin(i * 437.1) * 43758.5453;
          const s2 = Math.sin(i * 191.7) * 43758.5453;
          clouds.push({
            x: (((s1 % 1) + 1) % 1 - 0.5) * 40,
            y: 15 + ((s2 % 1) + 1) % 1 * 10,
            z: -i * 15 + 10,
            scale: 1 + ((Math.sin(i * 571.9) * 43758.5453 % 1 + 1) % 1) * 2,
          });
        }
        return clouds;
      }, []).map((c, i) => (
        <Float key={`cloud-${i}`} speed={0.3} floatIntensity={0.3}>
          <group position={[c.x, c.y, c.z]} scale={c.scale}>
            <mesh>
              <boxGeometry args={[3, 0.8, 2]} />
              <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.9} />
            </mesh>
            <mesh position={[1.5, 0.1, 0.3]}>
              <boxGeometry args={[2, 0.6, 1.5]} />
              <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.9} />
            </mesh>
            <mesh position={[-1, 0.2, -0.2]}>
              <boxGeometry args={[1.5, 0.7, 1.8]} />
              <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.9} />
            </mesh>
          </group>
        </Float>
      ))}

      {/* 반딧불이 */}
      {useMemo(() => {
        const flies: Array<{ x: number; y: number; z: number; speed: number }> = [];
        for (let i = 0; i < 25; i++) {
          const s1 = Math.sin(i * 437.1) * 43758.5453;
          const s2 = Math.sin(i * 191.7) * 43758.5453;
          const s3 = Math.sin(i * 317.3) * 43758.5453;
          flies.push({
            x: (((s1 % 1) + 1) % 1 - 0.5) * 20,
            y: 0.5 + ((s2 % 1) + 1) % 1 * 4,
            z: -((s3 % 1) + 1) % 1 * 120,
            speed: 0.3 + ((Math.sin(i * 571.9) * 43758.5453 % 1 + 1) % 1) * 0.5,
          });
        }
        return flies;
      }, []).map((f, i) => (
        <Float key={`firefly-${i}`} speed={f.speed} floatIntensity={0.6}>
          <mesh position={[f.x, f.y, f.z]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#ffff44" emissive="#ffff00" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[f.x, f.y, f.z]} intensity={0.3} color="#ffff00" distance={3} />
        </Float>
      ))}
    </group>
  );
}

// ============ 빛나는 스토리포인트 (훨씬 크고 눈에 띄게) ============

function StoryPointMarker({ position, active, visited }: {
  position: [number, number, number];
  active: boolean;
  visited: boolean;
}) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current && active) {
      outerRef.current.rotation.y = t * 1.5;
      outerRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
    if (innerRef.current && active) {
      innerRef.current.rotation.y = -t * 2;
      const pulse = 1 + Math.sin(t * 3) * 0.2;
      innerRef.current.scale.setScalar(pulse);
    }
    if (beamRef.current && active) {
      beamRef.current.scale.y = 1 + Math.sin(t * 2) * 0.3;
    }
    if (pulseRef.current && active) {
      const scale = 1 + Math.sin(t * 1.5) * 0.5;
      pulseRef.current.scale.set(scale, 1, scale);
      (pulseRef.current.material as THREE.MeshStandardMaterial).opacity = 0.3 - Math.sin(t * 1.5) * 0.15;
    }
  });

  if (visited) return null;

  return (
    <group position={position}>
      {active && (
        <>
          {/* 거대한 빛기둥 - 멀리서도 보이게 */}
          <mesh ref={beamRef} position={[0, 10, 0]}>
            <cylinderGeometry args={[0.5, 2.5, 20, 8]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffd700" 
              emissiveIntensity={1} 
              transparent 
              opacity={0.25} 
            />
          </mesh>
          {/* 바닥 펄스 링 */}
          <mesh ref={pulseRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2, 4, 32]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} transparent opacity={0.3} />
          </mesh>
          {/* 외부 회전 링 */}
          <mesh ref={outerRef} position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3, 0.15, 8, 32]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={3} />
          </mesh>
          {/* 내부 회전 링 */}
          <mesh ref={innerRef} position={[0, 1, 0]} rotation={[-Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.2, 0.1, 8, 24]} />
            <meshStandardMaterial color="#ff8c00" emissive="#ff8c00" emissiveIntensity={3} />
          </mesh>
          {/* 중앙 빛나는 구 - 크게 */}
          <Float speed={2} floatIntensity={0.8}>
            <mesh position={[0, 3, 0]}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial 
                color="#ffd700" 
                emissive="#ffaa00" 
                emissiveIntensity={4} 
                transparent 
                opacity={0.9}
              />
            </mesh>
          </Float>
          {/* 강력한 포인트 조명 */}
          <pointLight position={[0, 5, 0]} intensity={8} color="#ffd700" distance={25} />
          <pointLight position={[0, 1, 0]} intensity={4} color="#ff8c00" distance={15} />
          {/* 바닥 빛 원 */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[5, 32]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} transparent opacity={0.15} />
          </mesh>
        </>
      )}
      {!active && (
        <Float speed={1.5} floatIntensity={0.3}>
          <mesh position={[0, 1.5, 0]}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color="#aaaaaa"
              emissive="#555555"
              emissiveIntensity={0.3}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
}

// ============ 방향 화살표 (다음 스토리포인트를 가리킴) ============

function DirectionArrow({ playerPos, targetPos, visible }: { playerPos: THREE.Vector3; targetPos: THREE.Vector3 | null; visible: boolean }) {
  const arrowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!arrowRef.current || !targetPos || !visible) return;
    const dir = new THREE.Vector3().subVectors(targetPos, playerPos);
    dir.y = 0;
    const angle = Math.atan2(dir.x, dir.z);
    arrowRef.current.rotation.y = angle;
    arrowRef.current.position.set(playerPos.x, 0.3, playerPos.z);
    // 부드러운 위아래 움직임
    arrowRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
  });

  if (!visible || !targetPos) return null;

  return (
    <group ref={arrowRef}>
      {/* 화살표 몸체 */}
      <mesh position={[0, 0, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 1.5, 4]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      {/* 화살표 꼬리 */}
      <mesh position={[0, 0, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.15]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ============ 클릭 마커 ============

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
      <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} transparent opacity={0.8} />
    </mesh>
  );
}

// ============ 로블록스풍 플레이어 캐릭터 ============

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
  const legAngle = useRef(0);

  useEffect(() => {
    if (targetPos) {
      moveTarget.current = targetPos.clone();
      moveTarget.current.y = 0;
      isMoving.current = true;
    }
  }, [targetPos]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    if (isMoving.current && moveTarget.current) {
      const dir = new THREE.Vector3().subVectors(moveTarget.current, posRef.current);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.2) {
        dir.normalize();
        const speed = 4;
        const step = Math.min(speed * delta, dist);
        posRef.current.add(dir.multiplyScalar(step));
        const angle = Math.atan2(dir.x, dir.z);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, angle, 0.15);
        legAngle.current += delta * 12;
      } else {
        isMoving.current = false;
        moveTarget.current = null;
        legAngle.current = 0;
      }
    }

    const bob = isMoving.current ? Math.sin(Date.now() * 0.012) * 0.06 : 0;
    ref.current.position.set(posRef.current.x, bob, posRef.current.z);
    onPositionUpdate(posRef.current);

    if (currentStoryIndex < storyPoints.length && !arrivedRef.current.has(currentStoryIndex)) {
      const sp = storyPoints[currentStoryIndex];
      if (posRef.current.distanceTo(sp) < 3) {
        arrivedRef.current.add(currentStoryIndex);
        isMoving.current = false;
        moveTarget.current = null;
        onArrive(currentStoryIndex);
      }
    }
  });

  const legSwing = isMoving.current ? Math.sin(legAngle.current) * 0.4 : 0;

  return (
    <group ref={ref}>
      {/* 몸통 */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.5]} />
        <meshStandardMaterial color="#4FC3F7" roughness={0.7} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.65]} />
        <meshStandardMaterial color="#FFD5B4" roughness={0.6} />
      </mesh>
      {/* 눈 */}
      <mesh position={[-0.15, 1.85, 0.33]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.15, 1.85, 0.33]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* 입 */}
      <mesh position={[0, 1.7, 0.33]}>
        <boxGeometry args={[0.15, 0.05, 0.02]} />
        <meshStandardMaterial color="#e57373" />
      </mesh>
      {/* 팔 */}
      <mesh position={[-0.55, 0.9, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#4FC3F7" roughness={0.7} />
      </mesh>
      <mesh position={[0.55, 0.9, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#4FC3F7" roughness={0.7} />
      </mesh>
      {/* 다리 (걸을 때 움직임) */}
      <group position={[-0.2, 0.2, 0]} rotation={[legSwing, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.5, 0.3]} />
          <meshStandardMaterial color="#1565C0" roughness={0.8} />
        </mesh>
      </group>
      <group position={[0.2, 0.2, 0]} rotation={[-legSwing, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.5, 0.3]} />
          <meshStandardMaterial color="#1565C0" roughness={0.8} />
        </mesh>
      </group>
      {/* 모자 */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
        <meshStandardMaterial color="#FF5722" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#FF5722" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ============ 카메라 추적 ============

function FollowCamera({ playerPos }: { playerPos: THREE.Vector3 }) {
  const { camera } = useThree();
  const offset = useMemo(() => new THREE.Vector3(0, 5, 8), []);
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const target = playerPos.clone().add(offset);
    if (!initialized.current) {
      camera.position.copy(target);
      initialized.current = true;
    } else {
      camera.position.lerp(target, delta * 2);
    }
    const lookAt = playerPos.clone();
    lookAt.y += 1;
    camera.lookAt(lookAt);
  });

  return null;
}

// ============ 바닥 클릭 감지 ============

function ClickableGround({ onClickPosition }: { onClickPosition: (pos: THREE.Vector3) => void }) {
  const planeRef = useRef<THREE.Mesh>(null);
  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onClickPosition(new THREE.Vector3(e.point.x, 0, e.point.z));
  }, [onClickPosition]);

  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onClick={handleClick} visible={false}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial />
    </mesh>
  );
}

// ============ 메인 컴포넌트 ============

interface GameCounseling3DWorldProps {
  scene: StoryScene | null;
  sceneIndex: number;
  totalScenes: number;
  onChoice: (choice: StoryChoice) => void;
  isWalking: boolean;
  showChoices: boolean;
  onArrive?: (storyIndex: number) => void;
  narrationText?: string;
  gameState?: string;
  selectedChoice?: string | null;
  isSpeaking?: boolean;
}

export default function GameCounseling3DWorld({
  scene,
  sceneIndex,
  totalScenes,
  onChoice,
  showChoices,
  onArrive,
  narrationText,
  gameState,
  selectedChoice,
  isSpeaking,
}: GameCounseling3DWorldProps) {
  const [clickTarget, setClickTarget] = useState<THREE.Vector3 | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0, 3));
  const [autoMoved, setAutoMoved] = useState(false);

  // 게임 시작 시 자동으로 첫 스토리포인트로 이동
  useEffect(() => {
    if (gameState === 'exploring' && !autoMoved && storyPointPositions.length > 0) {
      const timer = setTimeout(() => {
        setClickTarget(storyPointPositions[sceneIndex].clone());
        setAutoMoved(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, autoMoved, storyPointPositions, sceneIndex]);

  // sceneIndex 변경 시 자동이동 리셋
  useEffect(() => {
    setAutoMoved(false);
  }, [sceneIndex]);
    // 첫 포인트는 앞쪽에, 간격은 10유닛으로 (기존 18에서 줄임)
    return Array.from({ length: totalScenes }, (_, i) => new THREE.Vector3(0, 0, -8 - i * 10));
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
    <div className="w-full h-[60vh] md:h-[65vh] rounded-xl overflow-hidden relative">
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 500 }}>
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#87CEEB', 50, 150]} />

        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight
          position={[15, 20, 10]}
          intensity={1.2}
          color="#fff5e6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <hemisphereLight args={['#87CEEB', '#4CAF50', 0.4]} />
        <pointLight position={[0, 8, playerPos.z]} intensity={1} color="#ffd700" distance={25} />

        <FollowCamera playerPos={playerPos} />
        <ClickableGround onClickPosition={handleClickPosition} />
        <RobloxWorld />

        <ClickMarker position={clickTarget} />

        {storyPointPositions.map((sp, i) => (
          <StoryPointMarker
            key={`sp-${i}`}
            position={[sp.x, sp.y, sp.z]}
            active={i === sceneIndex}
            visited={visitedPoints.has(i)}
          />
        ))}

        {storyPointPositions.map((sp, i) => (
          <RobloxCharacter
            key={`npc-${i}`}
            position={[i % 2 === 0 ? 3 : -3, 0, sp.z]}
            type={npcTypes[i % npcTypes.length]}
          />
        ))}

        <MovablePlayer
          targetPos={clickTarget}
          storyPoints={storyPointPositions}
          currentStoryIndex={sceneIndex}
          onArrive={handleArrive}
          onPositionUpdate={handlePositionUpdate}
        />
      </Canvas>

      {/* === 3D 화면 위 오버레이 UI === */}
      <AnimatePresence mode="wait">
        {(gameState === 'narrating' || gameState === 'choice') && scene && (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-4 right-4 space-y-2 pointer-events-auto"
          >
            {/* 대화창 */}
            <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
              {isSpeaking && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-t-2xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{scene.illustration}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm">{scene.title}</h3>
                    {scene.character && (
                      <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded-full">
                        🎭 {scene.character}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {narrationText || scene.description}
                    {gameState === 'narrating' && (
                      <motion.span
                        className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 선택지 (3D 화면 안에 표시) */}
            {gameState === 'choice' && (
              <div className="space-y-1.5">
                {scene.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.12 }}
                    onClick={() => !selectedChoice && onChoice(choice)}
                    className={`w-full text-left p-3 rounded-xl transition-all border pointer-events-auto
                      ${selectedChoice === choice.id
                        ? 'bg-amber-500/40 border-amber-400 scale-[0.98]'
                        : 'bg-black/60 backdrop-blur-md border-white/15 hover:border-amber-400/50 hover:bg-black/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{choice.emoji}</span>
                      <p className="font-medium text-sm text-white">{choice.text}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 탐험 안내 */}
      {gameState === 'exploring' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-amber-400/30">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              ✨
            </motion.span>
            <span className="text-white text-sm font-medium">빛나는 곳을 터치해서 이동하세요!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
