import React from 'react';
import { CalendarCheck, RotateCcw, Users, Brain, FileText, MessageCircle, ShoppingBag } from 'lucide-react';

interface RewardHistoryItem {
  id: string;
  points: number;
  action_type: string;
  description: string | null;
  created_at: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  attendance: <CalendarCheck className="w-4 h-4 text-orange-500" />,
  roulette: <RotateCcw className="w-4 h-4 text-amber-500" />,
  referral: <Users className="w-4 h-4 text-pink-500" />,
  assessment_complete: <Brain className="w-4 h-4 text-blue-500" />,
  report_complete: <FileText className="w-4 h-4 text-purple-500" />,
  exchange: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
};

const ACTION_LABELS: Record<string, string> = {
  attendance: '출석',
  roulette: '룰렛',
  referral: '친구 초대',
  assessment_complete: '검사 완료',
  report_complete: '리포트',
  exchange: '교환',
};

interface RewardHistoryProps {
  history: RewardHistoryItem[];
}

export const RewardHistory: React.FC<RewardHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        아직 포인트 내역이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold px-1">최근 내역</h3>
      {history.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {ACTION_ICONS[item.action_type] || <MessageCircle className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {ACTION_LABELS[item.action_type] || item.action_type}
            </div>
            {item.description && (
              <div className="text-xs text-muted-foreground truncate">{item.description}</div>
            )}
          </div>
          <div className={`text-sm font-bold ${item.points > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {item.points > 0 ? '+' : ''}₩{item.points.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  );
};
