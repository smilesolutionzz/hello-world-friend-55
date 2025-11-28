import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageGeneratorProps {
  initialPrompt?: string;
  context?: string;
  type?: 'test_result' | 'observation' | 'therapy' | 'institution';
  onImageGenerated?: (imageUrl: string) => void;
}

export function ImageGenerator({ 
  initialPrompt = "", 
  context = "", 
  type = 'therapy',
  onImageGenerated 
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('replicate-image-generator', {
        body: {
          prompt: prompt.trim(),
          context,
          type,
          aspectRatio: "1:1"
        }
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImage(data.image);
        onImageGenerated?.(data.image);
        toast.success("이미지가 성공적으로 생성되었습니다!");
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="이미지 생성을 위한 설명을 입력하세요..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && generateImage()}
          />
          <Button 
            onClick={generateImage} 
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            생성
          </Button>
        </div>

        {generatedImage && (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={generatedImage} 
                alt="Generated image" 
                className="w-full rounded-lg shadow-lg"
              />
              <Button
                onClick={downloadImage}
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-80 hover:opacity-100"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              AI가 이미지를 생성하고 있습니다...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}