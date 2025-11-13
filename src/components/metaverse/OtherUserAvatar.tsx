import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Html } from '@react-three/drei';
import type { UserPresence } from '@/utils/RealtimePresence';
import type { Group } from 'three';

interface OtherUserAvatarProps {
  presence: UserPresence;
}

export const OtherUserAvatar = ({ presence }: OtherUserAvatarProps) => {
  const groupRef = useRef<Group>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  
  // 아바타 모델 로드 (에러 핸들링 포함)
  let scene = null;
  try {
    if (presence.avatarUrl) {
      const gltf = useGLTF(presence.avatarUrl);
      scene = gltf.scene;
      if (!avatarLoaded) setAvatarLoaded(true);
    }
  } catch (error) {
    console.error('Failed to load avatar:', error);
  }

  // 위치와 회전 업데이트
  useEffect(() => {
    if (groupRef.current && presence.position) {
      groupRef.current.position.set(
        presence.position.x,
        presence.position.y,
        presence.position.z
      );
    }
  }, [presence.position]);

  useEffect(() => {
    if (groupRef.current && presence.rotation) {
      groupRef.current.rotation.set(
        presence.rotation.x,
        presence.rotation.y,
        presence.rotation.z
      );
    }
  }, [presence.rotation]);

  return (
    <group ref={groupRef}>
      {/* 아바타 모델 */}
      {scene ? (
        <primitive object={scene.clone()} scale={1} />
      ) : (
        // 폴백: 기본 캡슐 모양
        <group>
          <mesh position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
            <meshStandardMaterial color="#4a90e2" />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ffdbac" />
          </mesh>
        </group>
      )}

      {/* 사용자 이름 태그 */}
      <Html
        position={[0, 2.2, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border border-white/20">
          {presence.userName}
          {presence.isSpeaking && <span className="ml-1">🎤</span>}
          {presence.currentGesture && <span className="ml-1">✨</span>}
        </div>
      </Html>

      {/* 말하는 중 표시 */}
      {presence.isSpeaking && (
        <mesh position={[0, 0.1, 0]} scale={[1.2, 0.05, 1.2]}>
          <cylinderGeometry args={[1, 1, 0.1, 32]} />
          <meshBasicMaterial color="#4ade80" opacity={0.3} transparent />
        </mesh>
      )}

      {/* 감정 표시 (발 밑에 색깔 원) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={
            presence.currentEmotion === 'happy' ? '#4ade80' :
            presence.currentEmotion === 'sad' ? '#3b82f6' :
            presence.currentEmotion === 'angry' ? '#ef4444' :
            presence.currentEmotion === 'surprised' ? '#f59e0b' :
            '#6b7280'
          }
          opacity={0.3}
          transparent
        />
      </mesh>
    </group>
  );
};
