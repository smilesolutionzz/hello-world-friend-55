import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { GestureType } from '@/utils/GestureSystem';
import { getGestureAnimation, GESTURES } from '@/utils/GestureSystem';

interface CounselorNPCProps {
  position: [number, number, number];
  isSpeaking?: boolean;
  name?: string;
  gesture?: GestureType | null;
  message?: string;
  emotion?: 'empathy' | 'encouragement' | 'concern' | 'joy' | 'neutral';
  targetPosition?: { x: number; y: number; z: number };
}

export const CounselorNPC = ({ 
  position, 
  isSpeaking = false,
  name = "AI 상담사",
  gesture = null,
  message = "",
  emotion = 'neutral',
  targetPosition
}: CounselorNPCProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const gestureStartTime = useRef<number>(0);
  const currentGesture = useRef<GestureType | null>(null);
  
  // 랜덤 워킹을 위한 상태
  const walkDirection = useRef(new THREE.Vector3());
  const walkTimer = useRef(0);
  const walkDuration = useRef(3);
  const isWalking = useRef(false);
  const homePosition = useRef(new THREE.Vector3(...position));
  const maxWalkDistance = 2; // 초기 위치에서 최대 이동 거리

  useEffect(() => {
    if (gesture !== currentGesture.current) {
      currentGesture.current = gesture;
      gestureStartTime.current = Date.now();
    }
  }, [gesture]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // targetPosition이 있으면 사용자를 따라가고, 없으면 랜덤 워킹
    if (targetPosition) {
      // 사용자 위치를 향한 방향 계산
      const target = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
      const currentPos = groupRef.current.position;
      const direction = target.clone().sub(currentPos);
      const distance = direction.length();
      
      // 거리가 3 이상일 때만 따라가기 (너무 가까우면 멈춤)
      if (distance > 3 && !isSpeaking) {
        isWalking.current = true;
        // 방향 정규화 및 이동
        direction.normalize();
        const moveSpeed = 0.03; // 이동 속도
        groupRef.current.position.add(direction.multiplyScalar(moveSpeed));
        
        // 사용자를 바라보도록 회전
        const angle = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = angle;
        
        // 걷기 애니메이션 (팔 흔들기)
        if (leftArmRef.current && rightArmRef.current) {
          const walkCycle = Math.sin(state.clock.elapsedTime * 5);
          leftArmRef.current.rotation.x = walkCycle * 0.5;
          rightArmRef.current.rotation.x = -walkCycle * 0.5;
        }
      } else {
        isWalking.current = false;
      }
    } else {
      // 기존 랜덤 워킹 로직
      walkTimer.current += state.clock.getDelta();
      
      if (walkTimer.current >= walkDuration.current) {
        walkTimer.current = 0;
        walkDuration.current = 3 + Math.random() * 4;
        
        if (Math.random() > 0.5 && !isSpeaking) {
          isWalking.current = true;
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 0.5 + 0.2;
          walkDirection.current.set(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
          );
        } else {
          isWalking.current = false;
        }
      }
      
      if (isWalking.current && !isSpeaking) {
        groupRef.current.position.add(walkDirection.current.clone().multiplyScalar(0.01));
        
        const distanceFromHome = groupRef.current.position.distanceTo(homePosition.current);
        if (distanceFromHome > maxWalkDistance) {
          walkDirection.current.copy(homePosition.current).sub(groupRef.current.position).normalize().multiplyScalar(0.5);
        }
        
        const angle = Math.atan2(walkDirection.current.x, walkDirection.current.z);
        groupRef.current.rotation.y = angle;
        
        if (leftArmRef.current && rightArmRef.current) {
          const walkCycle = Math.sin(state.clock.elapsedTime * 5);
          leftArmRef.current.rotation.x = walkCycle * 0.5;
          rightArmRef.current.rotation.x = -walkCycle * 0.5;
        }
      }
    }
    
    // 호흡 및 바운스 애니메이션 (걷지 않을 때)
    if (!isWalking.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      const bounce = Math.abs(Math.sin(state.clock.elapsedTime * 2)) * 0.02;
      groupRef.current.position.y = position[1] + breathe + bounce;

      // 말할 때 더 크게 통통 튀기
      if (isSpeaking) {
        const speak = Math.sin(state.clock.elapsedTime * 10) * 0.08;
        groupRef.current.scale.setScalar(0.9 + speak);
      }
    }

    // 제스처 애니메이션
    if (currentGesture.current && currentGesture.current !== 'idle') {
      const elapsed = Date.now() - gestureStartTime.current;
      const gestureInfo = GESTURES[currentGesture.current];
      const duration = gestureInfo ? gestureInfo.duration : 2000;
      const progress = Math.min(elapsed / duration, 1);
      
      const animation = getGestureAnimation(currentGesture.current, progress);
      
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = Math.PI / 6 + (animation.armRotation || 0);
        rightArmRef.current.rotation.z = -Math.PI / 6 - (animation.armRotation || 0);
        leftArmRef.current.position.y = 0.8 + (animation.armRaise || 0);
        rightArmRef.current.position.y = 0.8 + (animation.armRaise || 0);
      }
      
      if (bodyRef.current && animation.bodyBend) {
        bodyRef.current.rotation.x = animation.bodyBend;
      }
      
      if (animation.spin) {
        groupRef.current.rotation.y += animation.spin * 0.01;
      }
      
      // 제스처 완료 후 초기화
      if (progress >= 1) {
        currentGesture.current = null;
      }
    } else {
      // 기본 자세로 복귀
      if (leftArmRef.current && rightArmRef.current && !isWalking.current) {
        leftArmRef.current.rotation.z = Math.PI / 6;
        rightArmRef.current.rotation.z = -Math.PI / 6;
        leftArmRef.current.position.y = 0.8;
        rightArmRef.current.position.y = 0.8;
      }
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0;
      }
    }

    // 말할 때 빛 강도 변화
    if (lightRef.current && isSpeaking) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
    } else if (lightRef.current) {
      lightRef.current.intensity = 1.5;
    }
  });

  // 감정에 따른 파스텔 색상 설정
  const getEmotionColors = () => {
    switch (emotion) {
      case 'empathy':
        return { head: '#B4E7CE', body: '#98D8C8', light: '#B4E7CE' };
      case 'encouragement':
        return { head: '#FFE4A1', body: '#FFD666', light: '#FFE4A1' };
      case 'concern':
        return { head: '#C5D3F0', body: '#A8B5E0', light: '#C5D3F0' };
      case 'joy':
        return { head: '#FFD6E8', body: '#FFB6D9', light: '#FFD6E8' };
      default:
        return { head: '#E6F3FF', body: '#C1E1FF', light: '#E6F3FF' };
    }
  };

  // 감정에 따른 얼굴 표정
  const getFaceExpression = () => {
    switch (emotion) {
      case 'empathy':
        return { eyeScale: 1.1, eyeY: 0.05, mouthCurve: 0.1, mouthY: -0.05 };
      case 'encouragement':
        return { eyeScale: 1.2, eyeY: 0.08, mouthCurve: 0.15, mouthY: 0 };
      case 'concern':
        return { eyeScale: 0.9, eyeY: 0.02, mouthCurve: -0.05, mouthY: -0.08 };
      case 'joy':
        return { eyeScale: 1.3, eyeY: 0.1, mouthCurve: 0.2, mouthY: 0.02 };
      default:
        return { eyeScale: 1, eyeY: 0, mouthCurve: 0, mouthY: 0 };
    }
  };

  const colors = getEmotionColors();
  const face = getFaceExpression();

  return (
    <group ref={groupRef} position={position} scale={0.9}>
      {/* 머리 (더 크고 둥글게) */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial 
          color={colors.head}
          emissive={colors.head}
          emissiveIntensity={emotion !== 'neutral' ? 0.3 : 0.1}
          roughness={0.3}
        />
      </mesh>

      {/* 귀여운 볼 (왼쪽) */}
      <mesh position={[-0.28, 1.42, 0.25]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>

      {/* 귀여운 볼 (오른쪽) */}
      <mesh position={[0.28, 1.42, 0.25]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>

      {/* 눈 (왼쪽 - 더 크고 반짝임) */}
      <group position={[-0.12, 1.58 + face.eyeY, 0.3]}>
        <mesh scale={[1, face.eyeScale, 1]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* 눈 하이라이트 */}
        <mesh position={[0.03, 0.03, 0.08]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 눈 (오른쪽 - 더 크고 반짝임) */}
      <group position={[0.12, 1.58 + face.eyeY, 0.3]}>
        <mesh scale={[1, face.eyeScale, 1]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* 눈 하이라이트 */}
        <mesh position={[0.03, 0.03, 0.08]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 입 (더 귀엽게) */}
      <mesh position={[0, 1.35 + face.mouthY, 0.35]} rotation={[0, 0, face.mouthCurve]}>
        <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#FF6B9D" />
      </mesh>

      {/* 귀여운 귀 (왼쪽) */}
      <mesh position={[-0.4, 1.7, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={colors.head}
          emissive={colors.head}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 귀여운 귀 (오른쪽) */}
      <mesh position={[0.4, 1.7, 0]} rotation={[0, 0, Math.PI / 6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={colors.head}
          emissive={colors.head}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 머리 장식 (리본) */}
      <group position={[0.25, 1.75, 0.1]}>
        <mesh>
          <boxGeometry args={[0.15, 0.08, 0.03]} />
          <meshStandardMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* 몸 (작고 통통하게) */}
      <mesh ref={bodyRef} position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.6, 16, 16]} />
        <meshStandardMaterial 
          color={colors.body}
          emissive={colors.body}
          emissiveIntensity={emotion !== 'neutral' ? 0.2 : 0.05}
          roughness={0.4}
        />
      </mesh>

      {/* 왼팔 (더 짧고 통통하게) */}
      <mesh ref={leftArmRef} position={[-0.35, 0.9, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.09, 0.35, 12, 12]} />
        <meshStandardMaterial color="#FFE4E1" roughness={0.3} />
      </mesh>

      {/* 오른팔 (더 짧고 통통하게) */}
      <mesh ref={rightArmRef} position={[0.35, 0.9, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.09, 0.35, 12, 12]} />
        <meshStandardMaterial color="#FFE4E1" roughness={0.3} />
      </mesh>

      {/* 왼손 (둥근 손) */}
      <mesh position={[-0.42, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#FFE4E1" roughness={0.3} />
      </mesh>

      {/* 오른손 (둥근 손) */}
      <mesh position={[0.42, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#FFE4E1" roughness={0.3} />
      </mesh>

      {/* 왼다리 (더 짧고 통통하게) */}
      <mesh position={[-0.15, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.4, 12, 12]} />
        <meshStandardMaterial color="#DDA0DD" roughness={0.4} />
      </mesh>

      {/* 오른다리 (더 짧고 통통하게) */}
      <mesh position={[0.15, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.4, 12, 12]} />
        <meshStandardMaterial color="#DDA0DD" roughness={0.4} />
      </mesh>

      {/* 왼발 (둥근 발) */}
      <mesh position={[-0.15, 0.05, 0.08]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#DDA0DD" roughness={0.4} />
      </mesh>

      {/* 오른발 (둥근 발) */}
      <mesh position={[0.15, 0.05, 0.08]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#DDA0DD" roughness={0.4} />
      </mesh>

      {/* 이름 라벨 */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>

      {/* 상담사 빛 효과 */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 0]}
        intensity={1.5}
        distance={3}
        color={isSpeaking ? "#FFD700" : colors.light}
      />

      {/* 말할 때 파티클 효과 */}
      {isSpeaking && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={15}
              array={new Float32Array(Array.from({ length: 45 }, () => (Math.random() - 0.5) * 1.5))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.08}
            color="#FFD700"
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}

      {/* 상담사 오라 */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color={colors.light}
          transparent
          opacity={emotion !== 'neutral' ? 0.15 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
