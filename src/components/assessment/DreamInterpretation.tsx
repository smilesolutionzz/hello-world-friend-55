import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Moon, Sparkles, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DreamInterpretationProps {
  onBack: () => void;
}

const DreamInterpretation = ({ onBack }: DreamInterpretationProps) => {
  const [dreamText, setDreamText] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!dreamText.trim()) {
      toast({
        title: "입력 필요",
        description: "꿈 내용을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dream-interpreter', {
        body: { dreamText: dreamText.trim() }
      });

      if (error) {
        throw new Error('꿈 해몽 분석에 실패했습니다.');
      }

      setInterpretation(data.interpretation);
      
      toast({
        title: "꿈 해몽 완료",
        description: "AI가 꿈을 분석했습니다.",
      });
    } catch (error) {
      console.error('Dream interpretation error:', error);
      toast({
        title: "분석 실패",
        description: "꿈 해몽 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDreamText("");
    setInterpretation("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 relative overflow-hidden">
      {/* Dream Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Moon className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                AI 꿈 해몽
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-lg text-purple-200">
              당신의 꿈이 담고 있는 의미를 AI가 해석해드립니다
            </p>
          </div>
          
          <div className="w-20" />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                꿈 내용을 자세히 들려주세요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="어떤 꿈을 꾸셨나요? 등장인물, 장소, 상황, 감정 등을 자세히 적어주세요..."
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                className="min-h-32 bg-white/20 border-purple-300/30 text-white placeholder:text-purple-200 resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-200">
                  {dreamText.length}/1000자
                </span>
                <div className="flex gap-2">
                  {dreamText && (
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="bg-white/10 border-purple-300/30 text-white hover:bg-white/20"
                    >
                      다시 쓰기
                    </Button>
                  )}
                  <Button 
                    onClick={handleSubmit}
                    disabled={!dreamText.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        해몽 중...
                      </>
                    ) : (
                      "꿈 해몽 시작"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          {interpretation && (
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI 꿈 해몽 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/20 rounded-lg p-6">
                  <div className="text-white leading-relaxed whitespace-pre-line">
                    {interpretation}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>💡 참고사항:</strong> 이 결과는 AI가 생성한 참고용 해석입니다. 
                    꿈의 의미는 개인의 경험과 상황에 따라 다를 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dream Tips */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-yellow-400" />
                꿈 기록 팁
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-purple-200 space-y-2">
                <p>• 꿈을 깬 직후 기록하면 더 생생한 해석이 가능합니다</p>
                <p>• 감정, 색깔, 숫자 등 세부사항을 포함해 주세요</p>
                <p>• 반복되는 꿈이나 특별한 상징이 있다면 언급해 주세요</p>
                <p>• 꿈속에서 느낀 감정도 중요한 해석 요소입니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DreamInterpretation;