import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export type InteractionType = 'document' | 'furniture' | 'decoration' | 'tool';

interface InteractiveObjectProps {
  position: [number, number, number];
  type: InteractionType;
  label: string;
  content?: string;
  onInteract?: () => void;
  color?: string;
  size?: [number, number, number];
}

export const InteractiveObject = ({
  position,
  type,
  label,
  content,
  onInteract,
  color = '#8B7D6B',
  size = [0.5, 0.5, 0.5]
}: InteractiveObjectProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      // 호버 시 부드러운 떠오르기 효과
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setClicked(!clicked);
    if (onInteract) {
      onInteract();
    }
    
    // 클릭 효과 표시
    if (meshRef.current) {
      meshRef.current.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => {
        if (meshRef.current) {
          meshRef.current.scale.set(1, 1, 1);
        }
      }, 200);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // 타입별 다른 형태
  const renderGeometry = () => {
    switch (type) {
      case 'document':
        return <boxGeometry args={[0.3, 0.4, 0.05]} />;
      case 'furniture':
        return <boxGeometry args={size} />;
      case 'decoration':
        return <sphereGeometry args={[0.2, 16, 16]} />;
      case 'tool':
        return <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />;
      default:
        return <boxGeometry args={size} />;
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={hovered ? '#FFD700' : color}
          emissive={hovered ? '#FFD700' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* 라벨 (호버 시에만 표시) */}
      {hovered && (
        <Text
          position={[0, size[1] + 0.3, 0]}
          fontSize={0.15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}

      {/* 클릭 시 빛나는 효과 */}
      {clicked && (
        <pointLight
          position={[0, 0, 0]}
          intensity={1}
          distance={2}
          color="#FFD700"
        />
      )}
    </group>
  );
};

// 인터랙티브 오브젝트 관리 훅
export const useInteractiveObjects = () => {
  const [activeObject, setActiveObject] = useState<string | null>(null);
  const [objectContent, setObjectContent] = useState<string>('');

  const handleObjectInteraction = (objectId: string, content: string) => {
    setActiveObject(objectId);
    setObjectContent(content);
  };

  const closeInteraction = () => {
    setActiveObject(null);
    setObjectContent('');
  };

  return {
    activeObject,
    objectContent,
    handleObjectInteraction,
    closeInteraction
  };
};
