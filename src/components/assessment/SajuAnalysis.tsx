import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Sparkles, Calendar, Loader2, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTokens } from "@/hooks/useTokens";
import TokenGate from "@/components/TokenGate";

interface SajuAnalysisProps {
  onBack: () => void;
}

const SajuAnalysis = ({ onBack }: SajuAnalysisProps) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    gender: "",
    birthCity: ""
  });
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkTokenAvailability, consumeTokens } = useTokens();

  const TOKENS_REQUIRED = 8;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.name && formData.birthDate && formData.birthTime && 
           formData.gender && formData.birthCity;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "입력 필요",
        description: "모든 정보를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {

      const { data, error } = await supabase.functions.invoke('saju-analyzer', {
        body: formData
      });

      if (error) {
        throw new Error('사주 분석에 실패했습니다.');
      }

      setAnalysis(data.analysis);
      
      toast({
        title: "사주 분석 완료",
        description: "AI가 사주를 분석했습니다.",
      });
    } catch (error: any) {
      console.error('Saju analysis error:', error);
      if (error.message?.includes('토큰')) {
        toast({
          title: "토큰 부족",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "분석 실패",
          description: "사주 분석 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      birthDate: "",
      birthTime: "",
      gender: "",
      birthCity: ""
    });
    setAnalysis("");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-yellow-800 relative overflow-hidden">
      {/* Fortune Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
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
              <Star className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                AI 사주풀이
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-lg text-orange-200">
              AI가 당신의 사주를 분석하여 운세를 알려드립니다
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/20 text-green-400 border-green-400/30">
                무료 이용 가능
              </Badge>
            </div>
          </div>
          
          <div className="w-20" />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-orange-300/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                사주 정보를 입력해주세요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-orange-200">이름</Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-white/20 border-orange-300/30 text-white placeholder:text-orange-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-orange-200">성별</Label>
                  <Select onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="bg-white/20 border-orange-300/30 text-white">
                      <SelectValue placeholder="성별 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-orange-200">생년월일</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="bg-white/20 border-orange-300/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="text-orange-200">태어난 시간</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange("birthTime", e.target.value)}
                    className="bg-white/20 border-orange-300/30 text-white"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="birthCity" className="text-orange-200">태어난 도시</Label>
                  <Input
                    id="birthCity"
                    placeholder="서울특별시"
                    value={formData.birthCity}
                    onChange={(e) => handleInputChange("birthCity", e.target.value)}
                    className="bg-white/20 border-orange-300/30 text-white placeholder:text-orange-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4">
                {Object.values(formData).some(val => val) && (
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="bg-white/10 border-orange-300/30 text-white hover:bg-white/20"
                  >
                    다시 입력
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isLoading}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      사주 분석 중...
                    </>
                  ) : (
                    "사주풀이 시작"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          {analysis && (
            <Card className="bg-white/10 backdrop-blur-sm border-orange-300/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI 사주풀이 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/20 rounded-lg p-6">
                  <div className="text-white leading-relaxed whitespace-pre-line">
                    {analysis}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>🔮 참고사항:</strong> 이 결과는 AI가 생성한 재미용 사주풀이입니다. 
                    실제 운세와는 다를 수 있으며, 참고용으로만 활용해주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saju Info */}
          <Card className="bg-white/10 backdrop-blur-sm border-orange-300/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                사주란?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-orange-200 space-y-2">
                <p>• 사주는 태어난 연, 월, 일, 시의 간지를 바탕으로 한 운명 분석법입니다</p>
                <p>• 천간과 지지의 조합으로 개인의 성향과 운세를 파악합니다</p>
                <p>• 오행(목, 화, 토, 금, 수)의 균형을 통해 길흉을 판단합니다</p>
                <p>• 정확한 분석을 위해서는 출생 시간과 장소가 중요합니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SajuAnalysis;