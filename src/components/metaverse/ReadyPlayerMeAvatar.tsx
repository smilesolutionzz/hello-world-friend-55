import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ReadyPlayerMeAvatarProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  avatarUrl?: string;
  scale?: number;
}

export const ReadyPlayerMeAvatar = ({ 
  position, 
  rotation = [0, 0, 0], 
  avatarUrl,
  scale = 1 
}: ReadyPlayerMeAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!avatarUrl) {
      // 기본 아바타 (간단한 형태)
      const defaultAvatar = new THREE.Group();
      
      // 머리
      const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: '#FFD7BA' });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.5;
      defaultAvatar.add(head);
      
      // 몸
      const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.8, 8, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: '#6B7280' });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.8;
      defaultAvatar.add(body);
      
      // 팔
      const armGeo = new THREE.CapsuleGeometry(0.08, 0.5, 6, 6);
      const armMat = new THREE.MeshStandardMaterial({ color: '#FFD7BA' });
      
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.35, 0.8, 0);
      leftArm.rotation.z = Math.PI / 6;
      defaultAvatar.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.35, 0.8, 0);
      rightArm.rotation.z = -Math.PI / 6;
      defaultAvatar.add(rightArm);
      
      // 다리
      const legGeo = new THREE.CapsuleGeometry(0.1, 0.6, 6, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: '#3B4252' });
      
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.15, 0.1, 0);
      defaultAvatar.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.15, 0.1, 0);
      defaultAvatar.add(rightLeg);
      
      setModel(defaultAvatar);
      setIsLoading(false);
    } else {
      // Ready Player Me 모델 로드
      const loader = new GLTFLoader();
      loader.load(
        avatarUrl,
        (gltf) => {
          const avatar = gltf.scene;
          avatar.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          setModel(avatar);
          setIsLoading(false);
        },
        undefined,
        (error) => {
          console.error('Error loading Ready Player Me avatar:', error);
          // 로드 실패시 기본 아바타 사용
          setIsLoading(false);
        }
      );
    }
  }, [avatarUrl]);

  useFrame((state) => {
    if (groupRef.current && !isLoading) {
      // 부드러운 호흡 애니메이션
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.y = scale + breathe;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {model && <primitive object={model} />}
    </group>
  );
};

// Ready Player Me 아바타 선택기 UI
interface AvatarSelectorProps {
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export const useReadyPlayerMe = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const openAvatarCreator = () => {
    setIsCreating(true);
    
    // Ready Player Me iframe을 열기
    const frame = document.createElement('iframe');
    frame.src = 'https://demo.readyplayer.me/avatar?frameApi';
    frame.allow = 'camera *; microphone *';
    frame.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(frame);

    window.addEventListener('message', (event) => {
      const json = parse(event);
      if (json?.source === 'readyplayerme') {
        if (json.eventName === 'v1.avatar.exported') {
          setAvatarUrl(json.data.url);
          document.body.removeChild(frame);
          setIsCreating(false);
        }
      }
    });

    const parse = (event: MessageEvent) => {
      try {
        return JSON.parse(event.data);
      } catch (error) {
        return null;
      }
    };
  };

  return {
    avatarUrl,
    setAvatarUrl,
    openAvatarCreator,
    isCreating
  };
};
