import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { ReadyPlayerMeAvatar } from './ReadyPlayerMeAvatar';

interface AvatarPreviewProps {
  avatarUrl: string;
}

export const AvatarPreview = ({ avatarUrl }: AvatarPreviewProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // URL 유효성 검사
    if (!avatarUrl) {
      setIsValid(null);
      setIsLoading(false);
      return;
    }

    const isValidUrl = avatarUrl.includes('readyplayer.me') && avatarUrl.endsWith('.glb');
    setIsValid(isValidUrl);
    
    if (isValidUrl) {
      setIsLoading(true);
      // 로딩 시뮬레이션 (실제 모델 로딩은 ReadyPlayerMeAvatar에서 처리)
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      setIsLoading(false);
    }
  }, [avatarUrl]);

  if (!avatarUrl) {
    return (
      <Card className="w-full h-48 flex items-center justify-center bg-muted/50 border-dashed">
        <p className="text-sm text-muted-foreground">아바타 URL을 입력하세요</p>
      </Card>
    );
  }

  if (!isValid) {
    return (
      <Card className="w-full h-48 flex items-center justify-center bg-destructive/10 border-destructive/50">
        <div className="flex flex-col items-center gap-2">
          <XCircle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-destructive">올바른 Ready Player Me URL이 아닙니다</p>
          <p className="text-xs text-muted-foreground">URL은 .glb로 끝나야 합니다</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">아바타 로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium">준비됨</span>
        </div>
      )}
      
      <Canvas camera={{ position: [0, 0.5, 2], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <ReadyPlayerMeAvatar 
            position={[0, -0.8, 0]} 
            avatarUrl={avatarUrl}
            scale={1}
            emotion="neutral"
            emotionIntensity={0.5}
          />
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={3}
          target={[0, 0.2, 0]}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
        <p className="text-xs text-muted-foreground">드래그로 회전</p>
      </div>
    </Card>
  );
};
