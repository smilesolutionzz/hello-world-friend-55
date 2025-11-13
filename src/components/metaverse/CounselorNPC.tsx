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
}

export const CounselorNPC = ({ 
  position, 
  isSpeaking = false,
  name = "AI 상담사",
  gesture = null,
  message = "",
  emotion = 'neutral'
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

    // 랜덤 워킹 로직
    walkTimer.current += state.clock.getDelta();
    
    if (walkTimer.current >= walkDuration.current) {
      // 새로운 방향 결정
      walkTimer.current = 0;
      walkDuration.current = 3 + Math.random() * 4; // 3-7초 간격
      
      // 50% 확률로 걷기 시작 (말하지 않을 때만)
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
    
    // 워킹 애니메이션
    if (isWalking.current && !isSpeaking) {
      groupRef.current.position.add(walkDirection.current.clone().multiplyScalar(0.01));
      
      // 초기 위치에서 너무 멀어지지 않도록
      const distanceFromHome = groupRef.current.position.distanceTo(homePosition.current);
      if (distanceFromHome > maxWalkDistance) {
        // 집으로 돌아가는 방향으로
        walkDirection.current.copy(homePosition.current).sub(groupRef.current.position).normalize().multiplyScalar(0.5);
      }
      
      // 걷는 방향으로 회전
      const angle = Math.atan2(walkDirection.current.x, walkDirection.current.z);
      groupRef.current.rotation.y = angle;
      
      // 걷기 애니메이션 (팔 흔들기)
      if (leftArmRef.current && rightArmRef.current) {
        const walkCycle = Math.sin(state.clock.elapsedTime * 5);
        leftArmRef.current.rotation.x = walkCycle * 0.5;
        rightArmRef.current.rotation.x = -walkCycle * 0.5;
      }
    } else {
      // 부드러운 호흡 애니메이션
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      groupRef.current.position.y = position[1] + breathe;

      // 말할 때 더 크게 움직임
      if (isSpeaking) {
        const speak = Math.sin(state.clock.elapsedTime * 8) * 0.05;
        groupRef.current.scale.setScalar(1.8 + speak);
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

  // 감정에 따른 색상 설정
  const getEmotionColors = () => {
    switch (emotion) {
      case 'empathy':
        return { head: '#98D8C8', body: '#6FB3A0', light: '#98D8C8' };
      case 'encouragement':
        return { head: '#FFD93D', body: '#FFC107', light: '#FFD93D' };
      case 'concern':
        return { head: '#A8B5E0', body: '#7B89C4', light: '#A8B5E0' };
      case 'joy':
        return { head: '#FFB6C1', body: '#FF69B4', light: '#FFB6C1' };
      default:
        return { head: '#87CEEB', body: '#4682B4', light: '#87CEEB' };
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
    <group ref={groupRef} position={position}>
      {/* 머리 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={colors.head}
          emissive={colors.head}
          emissiveIntensity={emotion !== 'neutral' ? 0.2 : 0}
        />
      </mesh>

      {/* 눈 (왼쪽) */}
      <mesh position={[-0.1, 1.55 + face.eyeY, 0.25]} scale={[1, face.eyeScale, 1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 눈 (오른쪽) */}
      <mesh position={[0.1, 1.55 + face.eyeY, 0.25]} scale={[1, face.eyeScale, 1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 입 */}
      <mesh position={[0, 1.4 + face.mouthY, 0.25]} rotation={[0, 0, face.mouthCurve]}>
        <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 몸 */}
      <mesh ref={bodyRef} position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.8, 8, 8]} />
        <meshStandardMaterial 
          color={colors.body}
          emissive={colors.body}
          emissiveIntensity={emotion !== 'neutral' ? 0.15 : 0}
        />
      </mesh>

      {/* 왼팔 */}
      <mesh ref={leftArmRef} position={[-0.35, 0.8, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 6, 6]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* 오른팔 */}
      <mesh ref={rightArmRef} position={[0.35, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 6, 6]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* 왼다리 */}
      <mesh position={[-0.15, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 6, 6]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* 오른다리 */}
      <mesh position={[0.15, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 6, 6]} />
        <meshStandardMaterial color="#2C3E50" />
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
