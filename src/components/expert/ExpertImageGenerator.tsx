import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCheck, Download, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const imageTypes = [
  { 
    value: "profile", 
    label: "프로필 사진", 
    prompt: "Professional healthcare expert headshot, trustworthy appearance, clean studio background" 
  },
  { 
    value: "banner", 
    label: "배너 이미지", 
    prompt: "Professional medical clinic banner, modern healthcare facility, welcoming atmosphere" 
  },
  { 
    value: "consultation", 
    label: "상담실 이미지", 
    prompt: "Comfortable therapy consultation room, warm lighting, professional but welcoming" 
  },
  { 
    value: "certificate", 
    label: "자격증 배경", 
    prompt: "Professional certificate background, medical theme, clean and authoritative design" 
  }
];

const specializations = [
  "임상심리사", "상담심리사", "언어치료사", "작업치료사", "특수교육전문가", 
  "아동발달전문가", "학습치료사", "놀이치료사", "미술치료사", "음악치료사"
];

interface ExpertImageGeneratorProps {
  onImageGenerated?: (imageUrl: string, type: string) => void;
}

export function ExpertImageGenerator({ onImageGenerated }: ExpertImageGeneratorProps) {
  const [imageType, setImageType] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; type: string; id: string }>>([]);

  const generateImage = async () => {
    if (!imageType && !customPrompt.trim()) {
      toast.error("이미지 유형을 선택하거나 설명을 입력해주세요");
      return;
    }

    setIsGenerating(true);
    try {
      const typeData = imageTypes.find(t => t.value === imageType);
      let finalPrompt = customPrompt.trim() || typeData?.prompt || imageType;
      
      if (specialization && typeData) {
        finalPrompt = `${typeData.prompt}, ${specialization} specialist, Korean healthcare professional`;
      }
      
      const aspectRatio = imageType === "banner" ? "16:9" : imageType === "profile" ? "1:1" : "4:3";
      
      const { data, error } = await supabase.functions.invoke('replicate-image-generator', {
        body: {
          prompt: finalPrompt,
          context: "professional healthcare expert image",
          type: 'expert_profile',
          aspectRatio
        }
      });

      if (error) throw error;

      if (data?.image) {
        const newImage = {
          id: Date.now().toString(),
          url: data.image,
          type: typeData?.label || customPrompt
        };
        
        setGeneratedImages(prev => [newImage, ...prev]);
        onImageGenerated?.(data.image, newImage.type);
        toast.success("전문가 이미지가 생성되었습니다!");
      }
    } catch (error) {
      console.error('Expert image generation error:', error);
      toast.error("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, type: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `expert-${type}-${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateProfileSet = async () => {
    if (!specialization) {
      toast.error("전문 분야를 선택해주세요");
      return;
    }
    
    setIsGenerating(true);
    toast.info("프로필 세트를 생성하고 있습니다...");
    
    try {
      for (const type of imageTypes) {
        const finalPrompt = `${type.prompt}, ${specialization} specialist, Korean healthcare professional`;
        const aspectRatio = type.value === "banner" ? "16:9" : type.value === "profile" ? "1:1" : "4:3";
        
        const { data, error } = await supabase.functions.invoke('replicate-image-generator', {
          body: {
            prompt: finalPrompt,
            context: "professional healthcare expert image set",
            type: 'expert_profile',
            aspectRatio
          }
        });

        if (!error && data?.image) {
          const newImage = {
            id: `${type.value}-${Date.now()}`,
            url: data.image,
            type: type.label
          };
          
          setGeneratedImages(prev => [newImage, ...prev]);
          onImageGenerated?.(data.image, type.label);
        }
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      toast.success("프로필 세트가 생성되었습니다!");
    } catch (error) {
      console.error('Profile set generation error:', error);
      toast.error("일부 이미지 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          전문가 이미지 생성기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select value={imageType} onValueChange={setImageType}>
            <SelectTrigger>
              <SelectValue placeholder="이미지 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              {imageTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger>
              <SelectValue placeholder="전문 분야 선택" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="또는 직접 설명을 입력하세요..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && generateImage()}
            className="flex-1"
          />
          
          <Button 
            onClick={generateImage} 
            disabled={isGenerating || (!imageType && !customPrompt.trim())}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            생성
          </Button>
        </div>

        <Button 
          onClick={generateProfileSet}
          disabled={isGenerating || !specialization}
          variant="outline"
          className="w-full"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <UserCheck className="w-4 h-4 mr-2" />
          )}
          완전한 프로필 세트 생성 (4개 이미지)
        </Button>

        {generatedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">생성된 이미지</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img 
                    src={image.url} 
                    alt={`전문가 ${image.type}`}
                    className="w-full aspect-video rounded-lg shadow-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => downloadImage(image.url, image.type)}
                      size="sm"
                      variant="secondary"
                      className="opacity-90 hover:opacity-100"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      다운로드
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-1 font-medium">{image.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              AI가 전문가 이미지를 생성하고 있습니다...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}