import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EmotionType, getEmotionEffect } from '@/utils/EmotionDetector';

interface ReadyPlayerMeAvatarProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  avatarUrl?: string;
  scale?: number;
  emotion?: EmotionType;
  emotionIntensity?: number;
}

export const ReadyPlayerMeAvatar = ({ 
  position, 
  rotation = [0, 0, 0], 
  avatarUrl,
  scale = 1,
  emotion = 'neutral',
  emotionIntensity = 0.5
}: ReadyPlayerMeAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetScale, setTargetScale] = useState(scale);

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
      console.log('🎭 Loading Ready Player Me avatar from:', avatarUrl);
      const loader = new GLTFLoader();
      loader.load(
        avatarUrl,
        (gltf) => {
          console.log('✅ Avatar loaded successfully');
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
        (progress) => {
          console.log('📥 Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        (error) => {
          console.error('❌ Error loading Ready Player Me avatar:', error);
          console.log('🔄 Using default avatar instead');
          // 로드 실패시 기본 아바타 사용
          setIsLoading(false);
        }
      );
    }
  }, [avatarUrl]);

  // 감정 변화 처리
  useEffect(() => {
    const effect = getEmotionEffect(emotion);
    setTargetScale(scale * effect.scale);

    // 감정에 따른 라이트 색상 변경
    if (lightRef.current) {
      lightRef.current.color.set(effect.color);
      lightRef.current.intensity = effect.brightness * emotionIntensity;
    }
  }, [emotion, emotionIntensity, scale]);

  useFrame((state) => {
    if (groupRef.current && !isLoading) {
      // 부드러운 호흡 애니메이션
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.y = targetScale + breathe;
      
      // 감정에 따른 부드러운 스케일 전환
      const currentScale = groupRef.current.scale.x;
      groupRef.current.scale.x = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    }

    // 파티클 회전
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  // 감정 파티클 생성
  const emotionEffect = getEmotionEffect(emotion);
  const shouldShowParticles = emotionEffect.particles && emotionIntensity > 0.5;

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {isLoading && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      )}
      {model && <primitive object={model} />}
      
      {/* 감정 표현 라이트 */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 0]}
        intensity={emotionIntensity * 2}
        distance={3}
        decay={2}
      />

      {/* 감정 파티클 효과 */}
      {shouldShowParticles && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={20}
              array={new Float32Array(Array.from({ length: 60 }, () => (Math.random() - 0.5) * 2))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color={emotionEffect.color}
            transparent
            opacity={emotionIntensity * 0.6}
            sizeAttenuation
          />
        </points>
      )}

      {/* 감정 오라 효과 */}
      {emotionIntensity > 0.3 && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color={emotionEffect.color}
            transparent
            opacity={emotionIntensity * 0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

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

    const handleMessage = (event: MessageEvent) => {
      const json = parse(event);
      if (json?.source === 'readyplayerme') {
        if (json.eventName === 'v1.avatar.exported') {
          setAvatarUrl(json.data.url);
          document.body.removeChild(frame);
          setIsCreating(false);
          window.removeEventListener('message', handleMessage);
        }
      }
    };

    window.addEventListener('message', handleMessage);

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
