import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedImage } from './OptimizedImage';
import { Base64Image } from './Base64Image';
import MediaUploader from '@/components/observation/MediaUploader';
import { Image, Database, Upload, Code } from 'lucide-react';

interface ImageManagerProps {
  onImageReady?: (imageData: { url: string; type: 'url' | 'base64' | 'supabase' }) => void;
}

export function ImageManager({ onImageReady }: ImageManagerProps) {
  const [activeTab, setActiveTab] = useState('optimized');

  const handleBase64Converted = (base64: string) => {
    onImageReady?.({ url: base64, type: 'base64' });
  };

  const handleSupabaseUpload = (files: any[]) => {
    if (files.length > 0) {
      onImageReady?.({ url: files[0].url, type: 'supabase' });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          이미지 관리 도구
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="optimized" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              최적화
            </TabsTrigger>
            <TabsTrigger value="base64" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Base64
            </TabsTrigger>
            <TabsTrigger value="supabase" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              가이드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimized" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">최적화된 이미지 컴포넌트</h3>
              <p className="text-sm text-muted-foreground">
                로딩 상태, 에러 처리, fallback 이미지를 포함한 최적화된 이미지 컴포넌트입니다.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">예시 1: 기본 사용</h4>
                  <OptimizedImage
                    src="/placeholder.svg"
                    alt="예시 이미지"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">예시 2: 에러 처리</h4>
                  <OptimizedImage
                    src="https://invalid-url.com/image.jpg"
                    alt="에러 테스트"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">사용 방법:</h4>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`import { OptimizedImage } from '@/components/common/OptimizedImage';

<OptimizedImage
  src="이미지URL"
  alt="설명"
  fallbackSrc="/placeholder.svg"
  className="w-full h-32 object-cover"
  onError={() => console.log('이미지 로드 실패')}
  onLoad={() => console.log('이미지 로드 완료')}
/>`}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="base64" className="space-y-4">
            <Base64Image onImageConverted={handleBase64Converted} />
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Supabase Storage 업로드</h3>
              <p className="text-sm text-muted-foreground">
                대용량 이미지나 여러 개의 이미지를 업로드할 때 사용하세요.
              </p>
              <MediaUploader
                onMediaChange={handleSupabaseUpload}
                existingMedia={[]}
              />
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">이미지 사용 가이드</h3>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-700">📱 모바일 최적화</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• 이미지 크기: 최대 2MB 이하 권장</li>
                    <li>• 포맷: WebP &gt; JPEG &gt; PNG 순으로 권장</li>
                    <li>• 해상도: 모바일용은 최대 1080px 권장</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-700">✅ 권장 방법들</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• <strong>작은 로고/아이콘:</strong> Base64 인코딩</li>
                    <li>• <strong>중간 크기 이미지:</strong> OptimizedImage 컴포넌트</li>
                    <li>• <strong>대용량 이미지:</strong> Supabase Storage</li>
                    <li>• <strong>항상 fallback 이미지 설정</strong></li>
                  </ul>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700">⚠️ 주의사항</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• 외부 URL은 CORS 정책으로 차단될 수 있음</li>
                    <li>• Base64는 파일 크기가 약 33% 증가</li>
                    <li>• 너무 많은 Base64 이미지는 번들 크기 증가</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-red-700">🚫 피해야 할 것들</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• 직접 import한 이미지 (번들 크기 증가)</li>
                    <li>• 신뢰할 수 없는 외부 이미지 URL</li>
                    <li>• 압축하지 않은 고해상도 이미지</li>
                    <li>• fallback 없는 이미지 로딩</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}