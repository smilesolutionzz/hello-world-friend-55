import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoundEffects } from '@/utils/SoundEffects';

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
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const mouseDownTime = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cameraOffset = useRef(new THREE.Vector3(0, 3, 5));
  const targetCameraPos = useRef(new THREE.Vector3());
  const soundEffects = useRef(getSoundEffects());
  const wasMoving = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownTime.current = Date.now();
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setIsMouseDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDownTime.current > 0) {
        const dx = Math.abs(e.clientX - lastMousePos.current.x);
        const dy = Math.abs(e.clientY - lastMousePos.current.y);
        if (dx > 5 || dy > 5) {
          setIsMouseDragging(true);
          
          // 마우스 드래그로 카메라 회전
          const deltaX = (e.clientX - lastMousePos.current.x) * 0.01;
          const deltaY = (e.clientY - lastMousePos.current.y) * 0.01;
          
          // 카메라 오프셋 회전
          const rotationMatrix = new THREE.Matrix4();
          rotationMatrix.makeRotationY(-deltaX);
          cameraOffset.current.applyMatrix4(rotationMatrix);
          
          lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
      }
    };

    const handleMouseUp = () => {
      mouseDownTime.current = 0;
      setTimeout(() => setIsMouseDragging(false), 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
    const isCurrentlyMoving = velocity.length() > 0;
    
    if (isCurrentlyMoving) {
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
      
      // 발자국 소리 시작
      if (!wasMoving.current) {
        soundEffects.current.startFootsteps();
        wasMoving.current = true;
      }
    } else {
      // 발자국 소리 중지
      if (wasMoving.current) {
        soundEffects.current.stopFootsteps();
        wasMoving.current = false;
      }
    }

    // 스무스 카메라 추적 (마우스 드래그 중이 아닐 때 자동 복귀)
    if (!isMouseDragging) {
      // 카메라 오프셋을 캐릭터 뒤쪽으로 서서히 복귀
      const targetOffset = new THREE.Vector3(0, 3, 5);
      cameraOffset.current.lerp(targetOffset, 0.05);
    }

    // 목표 카메라 위치 계산
    targetCameraPos.current.copy(groupRef.current.position).add(cameraOffset.current);
    
    // 카메라 부드럽게 이동
    camera.position.lerp(targetCameraPos.current, 0.1);
    
    // 카메라가 캐릭터를 바라보도록
    const lookAtPos = groupRef.current.position.clone();
    lookAtPos.y += 1; // 캐릭터 중앙 높이
    camera.lookAt(lookAtPos);
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 3]}>
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
        <div className="font-semibold text-center mb-2">🎮 조작법</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div><kbd className="px-2 py-1 bg-white/20 rounded">W</kbd> / <kbd className="px-2 py-1 bg-white/20 rounded">↑</kbd> 앞으로</div>
          <div><kbd className="px-2 py-1 bg-white/20 rounded">S</kbd> / <kbd className="px-2 py-1 bg-white/20 rounded">↓</kbd> 뒤로</div>
          <div><kbd className="px-2 py-1 bg-white/20 rounded">A</kbd> / <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd> 왼쪽</div>
          <div><kbd className="px-2 py-1 bg-white/20 rounded">D</kbd> / <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd> 오른쪽</div>
        </div>
        <div className="text-center pt-2 text-xs opacity-80">
          🖱️ 마우스 드래그로 카메라 회전
        </div>
      </div>
    </div>
  );
};
