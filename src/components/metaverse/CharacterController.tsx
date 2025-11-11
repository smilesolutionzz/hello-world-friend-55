import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterControllerProps {
  children: React.ReactNode;
  onPositionChange?: (position: THREE.Vector3) => void;
  speed?: number;
  enabled?: boolean;
}

export const CharacterController = ({ 
  children, 
  onPositionChange,
  speed = 0.1,
  enabled = true 
}: CharacterControllerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const keysPressed = useRef<Set<string>>(new Set());
  const { camera } = useThree();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  useFrame(() => {
    if (!groupRef.current || !enabled) return;

    const velocity = new THREE.Vector3();
    const keys = keysPressed.current;

    // 카메라 방향 기준으로 이동
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // WASD 키 입력 처리
    if (keys.has('w') || keys.has('arrowup')) {
      velocity.add(forward.multiplyScalar(speed));
    }
    if (keys.has('s') || keys.has('arrowdown')) {
      velocity.add(forward.multiplyScalar(-speed));
    }
    if (keys.has('a') || keys.has('arrowleft')) {
      velocity.add(right.multiplyScalar(-speed));
    }
    if (keys.has('d') || keys.has('arrowright')) {
      velocity.add(right.multiplyScalar(speed));
    }

    // 위치 업데이트
    if (velocity.length() > 0) {
      groupRef.current.position.add(velocity);
      
      // 캐릭터가 이동 방향을 바라보도록 회전
      const angle = Math.atan2(velocity.x, velocity.z);
      groupRef.current.rotation.y = angle;

      // 경계 제한 (방 안에만 있도록)
      groupRef.current.position.x = Math.max(-8, Math.min(8, groupRef.current.position.x));
      groupRef.current.position.z = Math.max(-6, Math.min(6, groupRef.current.position.z));

      // 위치 변경 콜백
      if (onPositionChange) {
        onPositionChange(groupRef.current.position);
      }

      // 카메라가 캐릭터를 따라가도록
      const cameraOffset = new THREE.Vector3(0, 3, 5);
      const targetCameraPos = groupRef.current.position.clone().add(cameraOffset);
      camera.position.lerp(targetCameraPos, 0.1);
      camera.lookAt(groupRef.current.position);
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, 4]}>
      {children}
    </group>
  );
};

// 이동 안내 UI
export const MovementGuide = ({ visible = true }: { visible?: boolean }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20 animate-fade-in">
      <div className="text-white text-sm space-y-1">
        <div className="font-semibold text-center mb-2">🎮 이동 조작법</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div><kbd className="px-2 py-1 bg-white/20 rounded">W</kbd> 또는 <kbd className="px-2 py-1 bg-white/20 rounded">↑</kbd> 앞으로</div>
          <div><kbd className="px-2 py-1 bg-white/20 rounded">S</kbd> 또는 <kbd className="px-2 py-1 bg-white/20 rounded">↓</kbd> 뒤로</div>
          <div><kbd className="px-2 py-1 bg-white/20 rounded">A</kbd> 또는 <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd> 왼쪽</div>
          <div><kbd className="px-2 py-1 bg-white/20 rounded">D</kbd> 또는 <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd> 오른쪽</div>
        </div>
      </div>
    </div>
  );
};
