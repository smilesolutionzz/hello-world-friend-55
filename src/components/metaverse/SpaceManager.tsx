import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { Portal } from './Portal';
import { SPACES, SpaceType } from '@/types/SpaceTypes';
import { SpaceTransition } from './SpaceTransition';

import { LoungeSpace } from '../3d/spaces/LoungeSpace';
import { OutdoorSpace } from '../3d/spaces/OutdoorSpace';
import { MeditationRoom } from '../3d/spaces/MeditationRoom';
import { ExerciseRoom } from '../3d/spaces/ExerciseRoom';
import { GameRoom } from '../3d/spaces/GameRoom';

interface SpaceManagerProps {
  aiGesture?: string;
  userGesture?: string;
  playerPosition?: THREE.Vector3;
}

export const SpaceManager = ({ aiGesture, userGesture, playerPosition }: SpaceManagerProps) => {
  const [currentSpace, setCurrentSpace] = useState<SpaceType>('counseling1');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetSpaceName, setTargetSpaceName] = useState<string>('');

  const handlePortalEnter = useCallback((targetSpace: SpaceType) => {
    if (isTransitioning) return;
    
    const targetSpaceDef = SPACES[targetSpace];
    setTargetSpaceName(targetSpaceDef.name);
    setIsTransitioning(true);

    // 페이드 인/아웃 시간 (0.5초 페이드 인, 1초 대기, 0.5초 페이드 아웃)
    setTimeout(() => {
      setCurrentSpace(targetSpace);
    }, 600);

    setTimeout(() => {
      setIsTransitioning(false);
      setTargetSpaceName('');
    }, 1200);
  }, [isTransitioning]);

  const renderSpace = () => {
    const spaceConfig = SPACES[currentSpace];

    // 각 공간의 환경 렌더링
    let spaceEnvironment;
    switch (currentSpace) {
      case 'counseling1':
        // 현대적 상담실
        spaceEnvironment = (
          <group>
            {/* 밝은 바닥 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
            {/* 천장 */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            {/* 벽들 */}
            <mesh position={[0, 2.5, -10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial color="#E8E8E8" />
            </mesh>
            <mesh position={[0, 2.5, 10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial color="#E8E8E8" />
            </mesh>
            <mesh position={[-10, 2.5, 0]} receiveShadow>
              <boxGeometry args={[0.2, 5, 20]} />
              <meshStandardMaterial color="#E8E8E8" />
            </mesh>
            <mesh position={[10, 2.5, 0]} receiveShadow>
              <boxGeometry args={[0.2, 5, 20]} />
              <meshStandardMaterial color="#E8E8E8" />
            </mesh>
            {/* 소파 */}
            <mesh position={[-3, 0.5, -5]} castShadow>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color="#4F46E5" />
            </mesh>
            <mesh position={[3, 0.5, -5]} castShadow>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color="#4F46E5" />
            </mesh>
            {/* 테이블 */}
            <mesh position={[0, 0.4, -5]} castShadow>
              <cylinderGeometry args={[0.8, 0.8, 0.8, 16]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* 조명 */}
            <pointLight position={[0, 4, 0]} intensity={1} color="#FFFFFF" castShadow />
            <pointLight position={[-5, 3, -5]} intensity={0.5} color="#FFE4B5" />
            <pointLight position={[5, 3, -5]} intensity={0.5} color="#FFE4B5" />
            <ambientLight intensity={0.5} />
          </group>
        );
        break;
      case 'counseling2':
        // 자연 테마 - 기존 CounselingRoom에 초록색 톤 사용
        spaceEnvironment = (
          <group>
            {/* 숲 분위기 바닥 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#4a7c59" />
            </mesh>
            {/* 나무 느낌의 벽 */}
            <mesh position={[0, 2.5, -10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            <mesh position={[0, 2.5, 10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            <mesh position={[-10, 2.5, 0]} receiveShadow>
              <boxGeometry args={[0.2, 5, 20]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            <mesh position={[10, 2.5, 0]} receiveShadow>
              <boxGeometry args={[0.2, 5, 20]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            {/* 소파 */}
            <mesh position={[-3, 0.5, -5]} castShadow>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            <mesh position={[3, 0.5, -5]} castShadow>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* 테이블 */}
            <mesh position={[0, 0.4, -5]} castShadow>
              <cylinderGeometry args={[0.8, 0.8, 0.8, 16]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* 조명 */}
            <pointLight position={[0, 4, 0]} intensity={0.8} color="#90EE90" castShadow />
            <ambientLight intensity={0.5} />
          </group>
        );
        break;
      case 'counseling3':
        // 미래적 테마
        spaceEnvironment = (
          <group>
            {/* 미래적 바닥 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial 
                color="#0a0a2e" 
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* 빛나는 벽 */}
            <mesh position={[0, 2.5, -10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial 
                color="#1a1a4e" 
                emissive="#4169E1"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, 2.5, 10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial 
                color="#1a1a4e" 
                emissive="#4169E1"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[-10, 2.5, 0]} receiveShadow>
              <boxGeometry args={[0.2, 5, 20]} />
              <meshStandardMaterial 
                color="#1a1a4e" 
                emissive="#4169E1"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[10, 2.5, 0]} receiveShadow>
              <boxGeometry args={[0.2, 5, 20]} />
              <meshStandardMaterial 
                color="#1a1a4e" 
                emissive="#4169E1"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* 홀로그램 소파 */}
            <mesh position={[-3, 0.5, -5]} castShadow>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial 
                color="#00ffff" 
                transparent
                opacity={0.7}
                emissive="#00ffff"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[3, 0.5, -5]} castShadow>
              <boxGeometry args={[2, 1, 1]} />
              <meshStandardMaterial 
                color="#00ffff" 
                transparent
                opacity={0.7}
                emissive="#00ffff"
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* 조명 */}
            <pointLight position={[0, 4, 0]} intensity={0.6} color="#00ffff" castShadow />
            <pointLight position={[-5, 3, -5]} intensity={0.4} color="#ff00ff" />
            <pointLight position={[5, 3, -5]} intensity={0.4} color="#ff00ff" />
            <ambientLight intensity={0.3} />
          </group>
        );
        break;
      case 'lounge':
        spaceEnvironment = <LoungeSpace spaceType={currentSpace} />;
        break;
      case 'outdoor':
        spaceEnvironment = <OutdoorSpace spaceType={currentSpace} />;
        break;
      case 'meditation':
        spaceEnvironment = <MeditationRoom spaceType={currentSpace} />;
        break;
      case 'exercise':
        spaceEnvironment = <ExerciseRoom spaceType={currentSpace} />;
        break;
      case 'game':
        spaceEnvironment = <GameRoom spaceType={currentSpace} />;
        break;
      default:
        spaceEnvironment = (
          <group>
            {/* 기본 상담실 환경 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
            <mesh position={[0, 2.5, -10]} receiveShadow>
              <boxGeometry args={[20, 5, 0.2]} />
              <meshStandardMaterial color="#E8E8E8" />
            </mesh>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 4, 0]} intensity={1} castShadow />
          </group>
        );
    }

    return (
      <group>
        {spaceEnvironment}
        
        {/* 포탈들 */}
        {spaceConfig.portals.map((portal) => (
          <Portal
            key={portal.id}
            position={portal.position}
            rotation={portal.rotation}
            targetSpace={portal.targetSpace}
            label={portal.label}
            color={portal.color}
            onEnter={() => handlePortalEnter(portal.targetSpace)}
            playerPosition={playerPosition}
          />
        ))}
      </group>
    );
  };

  return (
    <>
      {renderSpace()}
      <SpaceTransition 
        isTransitioning={isTransitioning} 
        targetSpaceName={targetSpaceName}
      />
    </>
  );
};
