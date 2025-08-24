import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, RotateCcw, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/hooks/useTokens";
import { useToast } from "@/hooks/use-toast";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { supabase } from "@/integrations/supabase/client";

interface AnimalFaceTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

export default function AnimalFaceTest({ onComplete, onBack }: AnimalFaceTestProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'camera'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { consumeTokens, checkTokenAvailability } = useTokens();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
          setStep('preview');
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "잘못된 파일 형식",
          description: "이미지 파일만 업로드 가능합니다.",
          variant: "destructive"
        });
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStep('camera');
      }
    } catch (error) {
      toast({
        title: "카메라 접근 실패",
        description: "카메라에 접근할 수 없습니다. 파일 업로드를 이용해주세요.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageDataUrl);
        setStep('preview');
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    if (!checkTokenAvailability(TOKEN_COSTS.ANIMAL_FACE_MATCH)) {
      toast({
        title: "토큰이 부족합니다",
        description: `이 테스트를 위해서는 ${TOKEN_COSTS.ANIMAL_FACE_MATCH}토큰이 필요합니다.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await consumeTokens(TOKEN_COSTS.ANIMAL_FACE_MATCH);
      if (!success) {
        throw new Error("토큰 차감에 실패했습니다");
      }

      const { data, error } = await supabase.functions.invoke('animal-face-matcher', {
        body: { 
          image: selectedImage,
          imageType: 'base64'
        }
      });

      if (error) throw error;

      const resultData = {
        type: 'animal_face_match',
        image: selectedImage,
        result: data
      };

      onComplete(data, 'animal_face_match');

      toast({
        title: "분석 완료!",
        description: "당신과 닮은 동물을 확인해보세요!"
      });

    } catch (error) {
      console.error('Animal face matching error:', error);
      toast({
        title: "분석 실패",
        description: "얼굴 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTest = () => {
    setSelectedImage(null);
    setStep('upload');
    
    // Stop camera if active
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-8 h-8 text-primary animate-pulse" />
            <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              내 얼굴 닮은 동물 찾기
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            AI가 당신의 얼굴을 분석해서 닮은 동물을 찾아드려요!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">사진을 업로드하거나 촬영해주세요</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="lg"
                    className="h-32 flex-col gap-3 border-dashed border-2 hover:border-primary/50"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span>갤러리에서 선택</span>
                  </Button>
                  
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    size="lg"
                    className="h-32 flex-col gap-3 border-dashed border-2 hover:border-primary/50"
                  >
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span>카메라로 촬영</span>
                  </Button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">📸 촬영 팁</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 밝은 곳에서 정면을 바라보고 촬영해주세요</li>
                  <li>• 얼굴이 사진의 중앙에 오도록 해주세요</li>
                  <li>• 선글라스나 마스크는 벗고 촬영해주세요</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={capturePhoto} size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <Camera className="w-4 h-4 mr-2" />
                  사진 촬영
                </Button>
                <Button onClick={resetTest} variant="outline">
                  취소
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && selectedImage && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">선택한 사진을 확인해주세요</h3>
                <div className="relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-w-sm max-h-64 mx-auto rounded-lg border-2 border-primary/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  {isLoading ? (
                    "AI 분석 중..."
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      동물 찾기 시작!
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetTest}
                  variant="outline"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 선택
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            💰 소모 토큰: {TOKEN_COSTS.ANIMAL_FACE_MATCH}개
          </div>
        </CardContent>
      </Card>
    </div>
  );
}