import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, FileText, Brain, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Mission {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string;
  action: string;
  route: string;
  color: string;
}

const missions: Mission[] = [
  {
    id: 'referral',
    icon: <Users className="w-5 h-5" />,
    title: '친구 초대하기',
    description: '친구가 가입하면 양쪽 모두 보상!',
    points: '최대 ₩500',
    action: '초대하기',
    route: '/referral',
    color: 'text-pink-500 bg-pink-50',
  },
  {
    id: 'assessment',
    icon: <Brain className="w-5 h-5" />,
    title: '검사 완료하기',
    description: '심리검사를 완료하면 포인트 적립',
    points: '₩50 / 회',
    action: '검사하기',
    route: '/assessment',
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 'report',
    icon: <FileText className="w-5 h-5" />,
    title: 'AI 리포트 생성',
    description: '리포트를 생성하면 포인트 적립',
    points: '₩100 / 회',
    action: '리포트 생성',
    route: '/report-generator',
    color: 'text-purple-500 bg-purple-50',
  },
  {
    id: 'counseling',
    icon: <MessageCircle className="w-5 h-5" />,
    title: 'AI 상담 이용',
    description: '음성/채팅 상담 완료 시 적립',
    points: '₩30 / 회',
    action: '상담하기',
    route: '/counseling',
    color: 'text-emerald-500 bg-emerald-50',
  },
];

export const RewardMissions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold px-1">미션 수행하고 포인트 받기</h3>
      {missions.map((mission) => (
        <div
          key={mission.id}
          className="bg-card border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(mission.route)}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mission.color}`}>
            {mission.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{mission.title}</span>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                {mission.points}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{mission.description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};
