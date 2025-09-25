import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Heart, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emotionTypes = [
  { value: "happy", label: "기쁨 😊", prompt: "A child showing genuine happiness and joy" },
  { value: "sad", label: "슬픔 😢", prompt: "A child showing sadness in a gentle, understanding way" },
  { value: "angry", label: "화남 😠", prompt: "A child showing controlled anger, learning to manage emotions" },
  { value: "surprised", label: "놀람 😲", prompt: "A child showing pleasant surprise and wonder" },
  { value: "worried", label: "걱정 😟", prompt: "A child showing concern but in a safe environment" },
  { value: "excited", label: "신남 🤩", prompt: "A child showing enthusiasm and excitement" },
  { value: "calm", label: "평온 😌", prompt: "A child in a peaceful, relaxed state" },
  { value: "confused", label: "혼란 😕", prompt: "A child showing confusion but ready to learn" }
];

interface EmotionCardGeneratorProps {
  onCardGenerated?: (imageUrl: string, emotion: string) => void;
}

export function EmotionCardGenerator({ onCardGenerated }: EmotionCardGeneratorProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Array<{ url: string; emotion: string; id: string }>>([]);

  const generateEmotionCard = async () => {
    if (!selectedEmotion && !customPrompt.trim()) {
      toast.error("감정을 선택하거나 설명을 입력해주세요");
      return;
    }

    setIsGenerating(true);
    try {
      const emotionData = emotionTypes.find(e => e.value === selectedEmotion);
      const finalPrompt = customPrompt.trim() || emotionData?.prompt || selectedEmotion;
      
      const { data, error } = await supabase.functions.invoke('replicate-image-generator', {
        body: {
          prompt: finalPrompt,
          context: "emotion recognition therapy card for children",
          type: 'emotion_card',
          aspectRatio: "1:1"
        }
      });

      if (error) throw error;

      if (data?.image) {
        const newCard = {
          id: Date.now().toString(),
          url: data.image,
          emotion: emotionData?.label || customPrompt
        };
        
        setGeneratedCards(prev => [newCard, ...prev]);
        onCardGenerated?.(data.image, newCard.emotion);
        toast.success("감정 카드가 생성되었습니다!");
      }
    } catch (error) {
      console.error('Emotion card generation error:', error);
      toast.error("카드 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCard = (url: string, emotion: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `emotion-card-${emotion}-${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAllEmotions = async () => {
    setIsGenerating(true);
    toast.info("모든 감정 카드를 생성하고 있습니다...");
    
    try {
      for (const emotion of emotionTypes) {
        const { data, error } = await supabase.functions.invoke('replicate-image-generator', {
          body: {
            prompt: emotion.prompt,
            context: "emotion recognition therapy card for children",
            type: 'emotion_card',
            aspectRatio: "1:1"
          }
        });

        if (!error && data?.image) {
          const newCard = {
            id: `${emotion.value}-${Date.now()}`,
            url: data.image,
            emotion: emotion.label
          };
          
          setGeneratedCards(prev => [newCard, ...prev]);
          onCardGenerated?.(data.image, emotion.label);
        }
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success("모든 감정 카드가 생성되었습니다!");
    } catch (error) {
      console.error('Bulk generation error:', error);
      toast.error("일부 카드 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          감정 카드 생성기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="감정을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {emotionTypes.map((emotion) => (
                <SelectItem key={emotion.value} value={emotion.value}>
                  {emotion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateEmotionCard} 
            disabled={isGenerating || (!selectedEmotion && !customPrompt.trim())}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            생성
          </Button>
        </div>

        <Input
          placeholder="또는 직접 설명을 입력하세요... (예: 웃고 있는 아이)"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isGenerating && generateEmotionCard()}
        />

        <Button 
          onClick={generateAllEmotions}
          disabled={isGenerating}
          variant="outline"
          className="w-full"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          모든 기본 감정 카드 생성 (8개)
        </Button>

        {generatedCards.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">생성된 감정 카드</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {generatedCards.map((card) => (
                <div key={card.id} className="relative group">
                  <img 
                    src={card.url} 
                    alt={`감정 카드: ${card.emotion}`}
                    className="w-full aspect-square rounded-lg shadow-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => downloadCard(card.url, card.emotion)}
                      size="sm"
                      variant="secondary"
                      className="opacity-90 hover:opacity-100"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      다운로드
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-1 font-medium">{card.emotion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              AI가 감정 카드를 생성하고 있습니다...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}