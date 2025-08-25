import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  MessageCircle, 
  FileText, 
  Calendar,
  Users,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: '3분 심리검사',
      description: '빠른 심리상태 체크',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-primary to-primary-glow',
      path: '/assessment'
    },
    {
      title: 'AI 상담',
      description: '24시간 언제든지',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'from-soft-mint to-soft-mint-foreground',
      path: '/ai-counselor'
    },
    {
      title: '관찰일지',
      description: '일상 기록하기',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-calm-blue to-calm-blue-foreground',
      path: '/observation'
    },
    {
      title: '가족 관리',
      description: '구성원 추가/수정',
      icon: <Users className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      path: '/family'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">빠른 시작</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-background/80"
            onClick={() => navigate(action.path)}
          >
            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
              {action.icon}
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </Button>
        ))}
      </div>
    </Card>
  );
}