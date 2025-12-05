import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EmotionType, getEmotionEffect } from '@/utils/EmotionDetector';
import { GestureType, getGestureAnimation } from '@/utils/GestureSystem';

export interface ReadyPlayerMeAvatarProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  avatarUrl?: string;
  scale?: number;
  emotion?: EmotionType;
  emotionIntensity?: number;
  gesture?: GestureType | null;
  customization?: {
    skinTone: number;
    hairColor: number;
    shirtColor: number;
    pantsColor: number;
    hasGlasses: boolean;
    glassesStyle: number;
  };
}

export const ReadyPlayerMeAvatar = ({ 
  position, 
  rotation = [0, 0, 0], 
  avatarUrl,
  scale = 1,
  emotion = 'neutral',
  emotionIntensity = 0.5,
  gesture = null
}: ReadyPlayerMeAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetScale, setTargetScale] = useState(scale);
  const gestureStartTime = useRef<number>(0);
  const bodyPartsRef = useRef<{
    head?: THREE.Mesh;
    body?: THREE.Mesh;
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
  }>({});

  useEffect(() => {
    if (!avatarUrl) {
      // 귀여운 치비 스타일 아바타
      const defaultAvatar = new THREE.Group();
      
      // 머리 (더 크고 둥글게)
      const headGeo = new THREE.SphereGeometry(0.45, 32, 32);
      const headMat = new THREE.MeshStandardMaterial({ 
        color: '#FFE4D6', 
        roughness: 0.7,
        metalness: 0.1
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.5;
      head.scale.set(1, 0.95, 1); // 약간 납작하게
      defaultAvatar.add(head);
      
      // 귀여운 눈 (왼쪽)
      const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const eyeMat = new THREE.MeshStandardMaterial({ color: '#2C3E50' });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.15, 1.6, 0.38);
      defaultAvatar.add(leftEye);
      
      // 눈 하이라이트 (왼쪽)
      const highlightGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const highlightMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      const leftHighlight = new THREE.Mesh(highlightGeo, highlightMat);
      leftHighlight.position.set(-0.13, 1.63, 0.43);
      defaultAvatar.add(leftHighlight);
      
      // 눈 (오른쪽)
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.15, 1.6, 0.38);
      defaultAvatar.add(rightEye);
      
      // 눈 하이라이트 (오른쪽)
      const rightHighlight = new THREE.Mesh(highlightGeo, highlightMat);
      rightHighlight.position.set(0.17, 1.63, 0.43);
      defaultAvatar.add(rightHighlight);
      
      // 귀여운 입
      const mouthShape = new THREE.Shape();
      mouthShape.absarc(0, 0, 0.12, 0, Math.PI, false);
      const mouthGeo = new THREE.ShapeGeometry(mouthShape);
      const mouthMat = new THREE.MeshBasicMaterial({ color: '#E57373' });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, 1.35, 0.42);
      mouth.rotation.x = Math.PI;
      defaultAvatar.add(mouth);
      
      // 볼 블러시 (왼쪽)
      const blushGeo = new THREE.CircleGeometry(0.1, 16);
      const blushMat = new THREE.MeshBasicMaterial({ 
        color: '#FFB4B4', 
        transparent: true, 
        opacity: 0.6 
      });
      const leftBlush = new THREE.Mesh(blushGeo, blushMat);
      leftBlush.position.set(-0.32, 1.45, 0.35);
      defaultAvatar.add(leftBlush);
      
      // 볼 블러시 (오른쪽)
      const rightBlush = new THREE.Mesh(blushGeo, blushMat);
      rightBlush.position.set(0.32, 1.45, 0.35);
      defaultAvatar.add(rightBlush);
      
      // 작고 귀여운 몸
      const bodyGeo = new THREE.SphereGeometry(0.35, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color: '#A8D8EA',
        roughness: 0.6,
        metalness: 0.1
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.75;
      body.scale.set(1, 1.2, 0.9);
      defaultAvatar.add(body);
      
      // 귀여운 팔 (더 둥글게)
      const armGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const armMat = new THREE.MeshStandardMaterial({ color: '#FFE4D6' });
      
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.45, 0.9, 0);
      leftArm.scale.set(1, 1.8, 1);
      defaultAvatar.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.45, 0.9, 0);
      rightArm.scale.set(1, 1.8, 1);
      defaultAvatar.add(rightArm);
      
      // 작은 손
      const handGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const leftHand = new THREE.Mesh(handGeo, armMat);
      leftHand.position.set(-0.45, 0.6, 0);
      defaultAvatar.add(leftHand);
      
      const rightHand = new THREE.Mesh(handGeo, armMat);
      rightHand.position.set(0.45, 0.6, 0);
      defaultAvatar.add(rightHand);
      
      // 짧고 귀여운 다리
      const legGeo = new THREE.CapsuleGeometry(0.12, 0.35, 16, 16);
      const legMat = new THREE.MeshStandardMaterial({ color: '#FFE4D6' });
      
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.15, 0.25, 0);
      defaultAvatar.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.15, 0.25, 0);
      defaultAvatar.add(rightLeg);
      
      // 귀여운 신발
      const shoeGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const shoeMat = new THREE.MeshStandardMaterial({ color: '#FF6B9D' });
      
      const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
      leftShoe.position.set(-0.15, 0.08, 0.08);
      leftShoe.scale.set(1, 0.7, 1.3);
      defaultAvatar.add(leftShoe);
      
      const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
      rightShoe.position.set(0.15, 0.08, 0.08);
      rightShoe.scale.set(1, 0.7, 1.3);
      defaultAvatar.add(rightShoe);
      
      // 애니메이션을 위한 body parts 참조 저장
      bodyPartsRef.current = {
        head,
        body,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg
      };
      
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

  // 제스처 시작 시간 추적
  useEffect(() => {
    if (gesture) {
      gestureStartTime.current = Date.now();
    }
  }, [gesture]);

  useFrame((state) => {
    if (groupRef.current && !isLoading) {
      // 부드러운 호흡 애니메이션
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.y = targetScale + breathe;
      
      // 감정에 따른 부드러운 스케일 전환
      const currentScale = groupRef.current.scale.x;
      groupRef.current.scale.x = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      
      // 제스처 애니메이션 적용
      if (gesture && gesture !== 'idle') {
        const elapsed = Date.now() - gestureStartTime.current;
        const duration = 2000; // 기본 제스처 지속시간
        const progress = Math.min(elapsed / duration, 1);
        
        const animation = getGestureAnimation(gesture, progress);
        const bodyParts = bodyPartsRef.current;
        
        // 팔 애니메이션
        if (bodyParts.leftArm) {
          bodyParts.leftArm.rotation.z = animation.armRotation;
          bodyParts.leftArm.position.y = 0.9 + animation.armRaise * 0.3;
        }
        if (bodyParts.rightArm) {
          bodyParts.rightArm.rotation.z = -animation.armRotation;
          bodyParts.rightArm.position.y = 0.9 + animation.armRaise * 0.3;
        }
        
        // 몸통 애니메이션
        if (bodyParts.body) {
          bodyParts.body.rotation.x = animation.bodyBend;
        }
        
        // 다리 애니메이션
        if (bodyParts.leftLeg) {
          bodyParts.leftLeg.rotation.x = animation.legKick;
        }
        if (bodyParts.rightLeg) {
          bodyParts.rightLeg.rotation.x = -animation.legKick;
        }
        
        // 전체 회전 (춤, 축하 등)
        if (animation.spin !== 0) {
          groupRef.current.rotation.y = animation.spin;
        }
      } else {
        // 제스처가 없을 때는 원래 위치로 복귀
        const bodyParts = bodyPartsRef.current;
        if (bodyParts.leftArm) {
          bodyParts.leftArm.rotation.z = THREE.MathUtils.lerp(bodyParts.leftArm.rotation.z, 0, 0.1);
          bodyParts.leftArm.position.y = THREE.MathUtils.lerp(bodyParts.leftArm.position.y, 0.9, 0.1);
        }
        if (bodyParts.rightArm) {
          bodyParts.rightArm.rotation.z = THREE.MathUtils.lerp(bodyParts.rightArm.rotation.z, 0, 0.1);
          bodyParts.rightArm.position.y = THREE.MathUtils.lerp(bodyParts.rightArm.position.y, 0.9, 0.1);
        }
        if (bodyParts.body) {
          bodyParts.body.rotation.x = THREE.MathUtils.lerp(bodyParts.body.rotation.x, 0, 0.1);
        }
        if (bodyParts.leftLeg) {
          bodyParts.leftLeg.rotation.x = THREE.MathUtils.lerp(bodyParts.leftLeg.rotation.x, 0, 0.1);
        }
        if (bodyParts.rightLeg) {
          bodyParts.rightLeg.rotation.x = THREE.MathUtils.lerp(bodyParts.rightLeg.rotation.x, 0, 0.1);
        }
        if (groupRef.current.rotation.y !== 0) {
          groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        }
      }
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
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      )}
      {model && <primitive object={model} castShadow receiveShadow />}
      
      {/* 강화된 그림자를 위한 바닥 평면 */}
      <mesh 
        position={[0, 0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <circleGeometry args={[1.5, 32]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
      
      {/* 감정 표현 라이트 - 강화된 조명 */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 0]}
        intensity={emotionIntensity * 3}
        distance={4}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* 추가 림 라이트 (입체감 강화) */}
      <pointLight
        position={[1.5, 1, -1]}
        intensity={0.8}
        distance={3}
        color="#87CEEB"
      />
      <pointLight
        position={[-1.5, 1, -1]}
        intensity={0.8}
        distance={3}
        color="#FFB6C1"
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
    console.log('🎭 Opening Ready Player Me avatar creator...');
    
    // Ready Player Me iframe을 열기
    const frame = document.createElement('iframe');
    frame.id = 'rpm-frame';
    frame.src = `https://demo.readyplayer.me/avatar?frameApi&clearCache`;
    frame.allow = 'camera *; microphone *; clipboard-write';
    frame.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 9999;
    `;
    
    // 닫기 버튼 추가
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕ 닫기';
    closeBtn.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 10000;
      padding: 12px 24px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: 2px solid white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    `;
    closeBtn.onmouseover = () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      closeBtn.style.transform = 'scale(1.05)';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
      closeBtn.style.transform = 'scale(1)';
    };
    closeBtn.onclick = () => {
      document.body.removeChild(frame);
      document.body.removeChild(closeBtn);
      setIsCreating(false);
      window.removeEventListener('message', handleMessage);
    };
    
    document.body.appendChild(frame);
    document.body.appendChild(closeBtn);
    
    // iframe 로드 후 이벤트 구독
    frame.onload = () => {
      console.log('🎭 RPM iframe loaded, subscribing to events...');
      frame.contentWindow?.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**'
        }),
        '*'
      );
    };

    const handleMessage = (event: MessageEvent) => {
      const json = parse(event);
      
      if (!json) return;
      
      console.log('🎭 Ready Player Me Event received:', json);
      console.log('🎭 Event data:', JSON.stringify(json, null, 2));
      
      if (json?.source === 'readyplayerme') {
        console.log('✅ RPM Event Name:', json.eventName);
        console.log('✅ RPM Event Data:', json.data);
        
        // frame ready 이벤트 처리 - 이벤트 구독
        if (json.eventName === 'v1.frame.ready') {
          console.log('🎭 Frame ready, subscribing to events...');
          frame.contentWindow?.postMessage(
            JSON.stringify({
              target: 'readyplayerme',
              type: 'subscribe',
              eventName: 'v1.**'
            }),
            '*'
          );
          return;
        }
        
        // 다양한 이벤트 이름 처리 (RPM API 버전에 따라 다름)
        const exportEvents = [
          'v1.avatar.exported',
          'v1.user.set', 
          'v2.avatar.exported',
          'avatar.exported',
          'avatar_exported'
        ];
        
        if (exportEvents.includes(json.eventName)) {
          // URL 추출 - 여러 가능한 경로 시도
          let avatarUrlFromEvent = 
            json.data?.url || 
            json.data?.avatarUrl ||
            json.data?.avatarId ||
            json.data?.avatar?.url ||
            json.data;
          
          // avatarId만 있는 경우 전체 URL 구성
          if (avatarUrlFromEvent && !avatarUrlFromEvent.includes('http') && !avatarUrlFromEvent.includes('.glb')) {
            avatarUrlFromEvent = `https://models.readyplayer.me/${avatarUrlFromEvent}.glb`;
          }
          
          console.log('🎉 Avatar URL from event:', avatarUrlFromEvent);
          
          if (!avatarUrlFromEvent) {
            console.error('❌ No avatar URL in event data:', json.data);
            return;
          }
          
          setAvatarUrl(avatarUrlFromEvent);
          document.body.removeChild(frame);
          document.body.removeChild(closeBtn);
          setIsCreating(false);
          window.removeEventListener('message', handleMessage);
          
          // 성공 알림 및 URL 복사 UI
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          `;
          
          const successMsg = document.createElement('div');
          successMsg.style.cssText = `
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
            color: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.3s ease-out;
          `;
          
          successMsg.innerHTML = `
            <style>
              @keyframes slideIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            </style>
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
              <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">캐릭터 생성 완료!</h3>
              <p style="font-size: 14px; opacity: 0.9;">URL이 자동으로 입력되었습니다. 아래에서 복사할 수도 있습니다.</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 16px; margin-bottom: 20px; backdrop-filter: blur(10px);">
              <input 
                id="avatar-url-input" 
                type="text" 
                readonly 
                value="${avatarUrlFromEvent}"
                style="
                  width: 100%;
                  background: transparent;
                  border: none;
                  color: white;
                  font-size: 12px;
                  font-family: monospace;
                  outline: none;
                  cursor: text;
                  padding: 8px;
                  word-break: break-all;
                "
              />
            </div>
            
            <div style="display: flex; gap: 12px;">
              <button 
                id="copy-url-btn"
                style="
                  flex: 1;
                  padding: 14px 24px;
                  background: white;
                  color: #15803d;
                  border: none;
                  border-radius: 10px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                "
                onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';"
              >
                📋 URL 복사
              </button>
              <button 
                id="close-success-btn"
                style="
                  padding: 14px 24px;
                  background: rgba(255, 255, 255, 0.2);
                  color: white;
                  border: 2px solid white;
                  border-radius: 10px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.2s;
                "
                onmouseover="this.style.background='rgba(255, 255, 255, 0.3)';"
                onmouseout="this.style.background='rgba(255, 255, 255, 0.2)';"
              >
                닫기
              </button>
            </div>
          `;
          
          overlay.appendChild(successMsg);
          document.body.appendChild(overlay);
          
          // URL 복사 버튼 이벤트
          const copyBtn = document.getElementById('copy-url-btn');
          const urlInput = document.getElementById('avatar-url-input') as HTMLInputElement;
          
          copyBtn?.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(avatarUrlFromEvent);
              copyBtn.innerHTML = '✅ 복사 완료!';
              copyBtn.style.background = '#15803d';
              copyBtn.style.color = 'white';
              setTimeout(() => {
                copyBtn.innerHTML = '📋 URL 복사';
                copyBtn.style.background = 'white';
                copyBtn.style.color = '#15803d';
              }, 2000);
            } catch (err) {
              // 클립보드 API가 실패하면 input select 사용
              urlInput.select();
              document.execCommand('copy');
              copyBtn.innerHTML = '✅ 복사 완료!';
              setTimeout(() => {
                copyBtn.innerHTML = '📋 URL 복사';
              }, 2000);
            }
          });
          
          // 닫기 버튼 이벤트
          const closeBtnModal = document.getElementById('close-success-btn');
          closeBtnModal?.addEventListener('click', () => {
            document.body.removeChild(overlay);
          });
          
          // URL 입력창 클릭 시 전체 선택
          urlInput?.addEventListener('click', () => {
            urlInput.select();
          });
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
