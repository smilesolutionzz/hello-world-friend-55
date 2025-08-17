import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Text, 
  Stars, 
  Cloud,
  useGLTF,
  Html,
  PerspectiveCamera,
  Sky
} from '@react-three/drei';
import * as THREE from 'three';

interface TherapyEnvironmentProps {
  environmentType: string;
  config?: any;
  lighting?: any;
  onUserInteraction?: (interaction: any) => void;
  children?: React.ReactNode;
}

// Forest Environment
const ForestEnvironment: React.FC<{ config: any }> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  const trees = [];
  for (let i = 0; i < (config.trees || 20); i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    trees.push(
      <mesh key={i} position={[x, 0, z]}>
        <cylinderGeometry args={[0.3, 0.5, 3, 8]} />
        <meshLambertMaterial color="#8B4513" />
        <mesh position={[0, 3, 0]}>
          <coneGeometry args={[2, 4, 8]} />
          <meshLambertMaterial color="#228B22" />
        </mesh>
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#90EE90" />
      </mesh>
      
      {/* Trees */}
      {trees}
      
      {/* Floating particles */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 5, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      </Float>
    </group>
  );
};

// Beach Environment
const BeachEnvironment: React.FC<{ config: any }> = ({ config }) => {
  const waveRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waveRef.current) {
      waveRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      waveRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <group>
      {/* Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#F4A460" />
      </mesh>
      
      {/* Water */}
      <mesh ref={waveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -20]}>
        <planeGeometry args={[100, 50]} />
        <meshLambertMaterial color="#4169E1" transparent opacity={0.7} />
      </mesh>
      
      {/* Palm trees */}
      <mesh position={[-10, 0, 5]}>
        <cylinderGeometry args={[0.2, 0.3, 8, 8]} />
        <meshLambertMaterial color="#8B4513" />
        <mesh position={[0, 8, 0]}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshLambertMaterial color="#228B22" />
        </mesh>
      </mesh>
      
      <Sky sunPosition={[100, 20, 100]} />
    </group>
  );
};

// Space Environment
const SpaceEnvironment: React.FC<{ config: any }> = ({ config }) => {
  return (
    <group>
      <Stars 
        radius={300} 
        depth={60} 
        count={config.stars || 5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* Planets */}
      <mesh position={[50, 10, -30]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshLambertMaterial color="#FF6347" />
      </mesh>
      
      <mesh position={[-40, -5, -60]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshLambertMaterial color="#4169E1" />
      </mesh>
      
      {/* Nebula effect */}
      {config.nebula && (
        <Cloud
          opacity={0.5}
          speed={0.4}
          segments={20}
          position={[0, 0, -50]}
        />
      )}
    </group>
  );
};

// Library Environment
const LibraryEnvironment: React.FC<{ config: any }> = ({ config }) => {
  const bookshelves = [];
  for (let i = 0; i < (config.bookshelves || 10); i++) {
    const x = (i % 5) * 8 - 16;
    const z = Math.floor(i / 5) * 8 - 8;
    bookshelves.push(
      <group key={i} position={[x, 0, z]}>
        {/* Shelf structure */}
        <mesh>
          <boxGeometry args={[6, 8, 1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        {/* Books */}
        <mesh position={[0, 0, 0.6]}>
          <boxGeometry args={[5.5, 7, 0.8]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Bookshelves */}
      {bookshelves}
      
      {/* Fireplace */}
      {config.fireplace && (
        <group position={[0, 0, -15]}>
          <mesh>
            <boxGeometry args={[4, 3, 1]} />
            <meshLambertMaterial color="#696969" />
          </mesh>
          <pointLight
            position={[0, 1, 1]}
            color="#FF4500"
            intensity={1}
            distance={10}
          />
        </group>
      )}
      
      {/* Reading nooks */}
      {Array.from({ length: config.reading_nooks || 2 }).map((_, i) => (
        <group key={i} position={[15 + i * 10, 0, 10]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1, 2]} />
            <meshLambertMaterial color="#8B0000" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Garden Environment
const GardenEnvironment: React.FC<{ config: any }> = ({ config }) => {
  const butterflyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (butterflyRef.current) {
      butterflyRef.current.position.x = Math.sin(state.clock.elapsedTime) * 5;
      butterflyRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 2) * 1;
      butterflyRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 3;
    }
  });

  const flowers = [];
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    flowers.push(
      <mesh key={i} position={[x, 0, z]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshLambertMaterial color="#228B22" />
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshLambertMaterial color={['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB'][Math.floor(Math.random() * 4)]} />
        </mesh>
      </mesh>
    );
  }

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#90EE90" />
      </mesh>
      
      {/* Flowers */}
      {config.flowers && flowers}
      
      {/* Fountain */}
      {config.fountain && (
        <group position={[0, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[3, 3, 1, 16]} />
            <meshLambertMaterial color="#87CEEB" />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
            <meshLambertMaterial color="#4682B4" />
          </mesh>
        </group>
      )}
      
      {/* Butterflies */}
      {config.butterflies && (
        <group ref={butterflyRef}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshLambertMaterial color="#FFD700" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Mountain Environment
const MountainEnvironment: React.FC<{ config: any }> = ({ config }) => {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#8FBC8F" />
      </mesh>
      
      {/* Mountains */}
      <mesh position={[0, 5, -30]}>
        <coneGeometry args={[15, 20, 8]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
      
      <mesh position={[-20, 3, -40]}>
        <coneGeometry args={[10, 15, 8]} />
        <meshLambertMaterial color="#708090" />
      </mesh>
      
      <mesh position={[25, 4, -35]}>
        <coneGeometry args={[12, 18, 8]} />
        <meshLambertMaterial color="#778899" />
      </mesh>
      
      {/* Temple */}
      {config.temple && (
        <group position={[0, 0, 0]}>
          <mesh>
            <boxGeometry args={[6, 4, 6]} />
            <meshLambertMaterial color="#DDD" />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[4, 2, 4]} />
            <meshLambertMaterial color="#B8860B" />
          </mesh>
        </group>
      )}
      
      {/* Meditation spots */}
      {Array.from({ length: config.meditation_spots || 3 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 2) * 8, 0.1, Math.cos(i * 2) * 8]}>
          <cylinderGeometry args={[1, 1, 0.2, 16]} />
          <meshLambertMaterial color="#F5DEB3" />
        </mesh>
      ))}
    </group>
  );
};

// Floating component for animations
const Float: React.FC<{
  speed?: number;
  rotationIntensity?: number;
  floatIntensity?: number;
  children: React.ReactNode;
}> = ({ speed = 1, rotationIntensity = 1, floatIntensity = 1, children }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.rotation.x = Math.cos(t) * rotationIntensity * 0.1;
      ref.current.rotation.y = Math.sin(t) * rotationIntensity * 0.1;
      ref.current.position.y += Math.sin(t) * floatIntensity * 0.01;
    }
  });
  
  return <group ref={ref}>{children}</group>;
};

// Avatar component
export const UserAvatar: React.FC<{
  position: [number, number, number];
  config: any;
  isCurrentUser?: boolean;
}> = ({ position, config, isCurrentUser = false }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current && isCurrentUser) {
      ref.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Avatar body */}
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.3, 1]} />
        <meshLambertMaterial color={config.bodyColor || "#FFB6C1"} />
      </mesh>
      
      {/* Avatar head */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshLambertMaterial color={config.skinColor || "#FDBCB4"} />
      </mesh>
      
      {/* Name tag */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-sm">
          {config.name || "사용자"}
        </div>
      </Html>
      
      {/* Selection indicator for current user */}
      {isCurrentUser && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.8, 1, 16]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

// Main 3D Therapy Environment component
export const TherapyEnvironment3D: React.FC<TherapyEnvironmentProps> = ({
  environmentType,
  config = {},
  lighting = {},
  onUserInteraction,
  children
}) => {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 5, 10]);

  const renderEnvironment = () => {
    switch (environmentType) {
      case 'forest':
        return <ForestEnvironment config={config} />;
      case 'beach':
        return <BeachEnvironment config={config} />;
      case 'space':
        return <SpaceEnvironment config={config} />;
      case 'library':
        return <LibraryEnvironment config={config} />;
      case 'garden':
        return <GardenEnvironment config={config} />;
      case 'mountain':
        return <MountainEnvironment config={config} />;
      default:
        return <ForestEnvironment config={config} />;
    }
  };

  const getLighting = () => {
    const lightType = lighting.type || 'natural';
    const warmth = lighting.warmth || 0.7;
    
    switch (lightType) {
      case 'sunset':
        return (
          <>
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.8}
              color="#FFA500"
              castShadow
            />
          </>
        );
      case 'cosmic':
        return (
          <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={0.5} color="#4169E1" />
            <pointLight position={[20, 20, 20]} intensity={0.3} color="#8A2BE2" />
          </>
        );
      case 'warm':
        return (
          <>
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFA500" />
            <directionalLight position={[5, 5, 5]} intensity={0.4} />
          </>
        );
      default:
        return (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.8}
              castShadow
            />
          </>
        );
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ 
          position: cameraPosition, 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        onPointerDown={(e: any) => {
          if (onUserInteraction) {
            onUserInteraction({
              type: 'click',
              position: e.point || [0, 0, 0],
              object: e.object || null
            });
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          {getLighting()}
          
          {/* Environment */}
          {renderEnvironment()}
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={50}
          />
          
          {/* HDR Environment */}
          <Environment preset={environmentType === 'space' ? 'night' : 'dawn'} />
          
          {/* Custom children (avatars, AI therapists, etc.) */}
          {children}
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/80 text-white p-3 rounded-lg">
          <h3 className="font-semibold text-sm mb-1">치료 환경</h3>
          <p className="text-xs opacity-80">마우스로 시점 조작, 휠로 줌</p>
        </div>
      </div>
    </div>
  );
};