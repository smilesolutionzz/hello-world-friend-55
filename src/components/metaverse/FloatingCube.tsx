import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingCubeProps {
  imageUrl: string;
  position: [number, number, number];
  id: string;
}

export const FloatingCube = ({ imageUrl, position, id }: FloatingCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // 텍스처 로드 (base64 이미지 지원)
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (loadedTexture) => {
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Texture loading error:', error);
      }
    );
  }, [imageUrl]);
  
  // 각 큐브마다 다른 움직임 패턴을 위한 랜덤 값
  const movementPattern = useMemo(() => ({
    speedX: Math.random() * 0.5 + 0.2,
    speedY: Math.random() * 0.3 + 0.1,
    speedZ: Math.random() * 0.5 + 0.2,
    radiusX: Math.random() * 3 + 2,
    radiusY: Math.random() * 1 + 0.5,
    radiusZ: Math.random() * 3 + 2,
    rotationSpeed: Math.random() * 0.02 + 0.01,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    phaseZ: Math.random() * Math.PI * 2,
  }), [id]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      
      // 원형/타원형 경로로 떠다니기
      meshRef.current.position.x = position[0] + Math.sin(t * movementPattern.speedX + movementPattern.phaseX) * movementPattern.radiusX;
      meshRef.current.position.y = position[1] + Math.sin(t * movementPattern.speedY + movementPattern.phaseY) * movementPattern.radiusY;
      meshRef.current.position.z = position[2] + Math.cos(t * movementPattern.speedZ + movementPattern.phaseZ) * movementPattern.radiusZ;
      
      // 회전
      meshRef.current.rotation.x += movementPattern.rotationSpeed;
      meshRef.current.rotation.y += movementPattern.rotationSpeed * 1.5;
    }
  });

  if (!texture) {
    return null;
  }

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        map={texture} 
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
};
