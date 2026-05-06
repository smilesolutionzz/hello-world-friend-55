import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Heart, Brain, Target, Timer, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickOnboardingProps {
  open: boolean;
  onClose: () => void;
}

const QuickOnboarding: React.FC<QuickOnboardingProps> = ({ open, onClose }) => {
  const [selectedConcern, setSelectedConcern] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const concerns = [
    { 
      id: 'observation', 
      label: '관찰일지 작성', 
      icon: Brain, 
      description: '일상 행동 기록 & AI 분석',
      color: 'bg-blue-500',
      route: '/observation'
    },
    { 
      id: 'assessment', 
      label: 'AI 심리검사', 
      icon: Target, 
      description: 'ADHD, 스트레스 등 즉시 검사',
      color: 'bg-green-500',
      route: '/assessment'
    },
    { 
      id: 'expert', 
      label: '전문가 상담', 
      icon: Heart, 
      description: '실시간 전문가 매칭',
      color: 'bg-red-500',
      route: '/expert-hiring'
    }
  ];

  const handleStart = (concern: any) => {
    // 무료 체험 플래그 설정
    localStorage.setItem('quick_trial_started', 'true');
    localStorage.setItem('trial_concern', concern.id);
    
    toast({
      title: "🎉 무료 체험 시작!",
      description: `${concern.label}을(를) 바로 시작합니다`,
    });

    navigate(concern.route);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              회원가입 불필요
            </Badge>
            <Badge className="text-xs bg-green-500">
              <Gift className="w-3 h-3 mr-1" />
              완전 무료
            </Badge>
          </div>
          <DialogTitle className="text-2xl">
            ⚡ 30초만에 시작하는 AI 케어
          </DialogTitle>
          <DialogDescription className="text-base">
            원하는 서비스를 선택하고 바로 체험해보세요
          </DialogDescription>
          
          <div className="flex items-center justify-center space-x-6 pt-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4" />
              <span>30초 소요</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>즉시 결과</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          {concerns.map((concern) => (
            <Card
              key={concern.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                selectedConcern === concern.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : ''
              }`}
              onClick={() => setSelectedConcern(concern.id)}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-16 h-16 ${concern.color} rounded-full flex items-center justify-center mx-auto`}>
                  <concern.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{concern.label}</h3>
                  <p className="text-sm text-muted-foreground">{concern.description}</p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStart(concern);
                  }}
                  className="w-full"
                  variant={selectedConcern === concern.id ? "default" : "outline"}
                >
                  <span>바로 시작</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            💡 체험 후 마음에 들면 회원가입하고 더 많은 기능을 이용하세요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickOnboarding;
