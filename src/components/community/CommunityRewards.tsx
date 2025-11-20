import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Coins, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CommunityRewards = () => {
  const [concern, setConcern] = useState('');
  const [tokens, setTokens] = useState(0);
  const { toast } = useToast();

  const handleShare = () => {
    if (concern.length < 20) {
      toast({
        title: "내용이 너무 짧습니다",
        description: "최소 20자 이상 작성해주세요",
        variant: "destructive"
      });
      return;
    }

    const earnedTokens = 50;
    setTokens(prev => prev + earnedTokens);
    setConcern('');
    
    toast({
      title: "🎉 토큰 획득!",
      description: `고민 공유로 ${earnedTokens} 토큰을 받았습니다. 상담료 할인에 사용하세요!`
    });
  };

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-2xl mb-2">
            커뮤니티 참여하고 토큰 받기
          </h3>
          <p className="text-white/70 text-sm">
            고민을 공유하고 다른 사람을 응원하면 토큰을 드립니다
          </p>
        </div>
        <div className="text-center bg-yellow-500/20 px-6 py-3 rounded-2xl">
          <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
          <p className="text-yellow-400 font-bold text-2xl">{tokens}</p>
          <p className="text-yellow-300 text-xs">보유 토큰</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-white font-bold">고민 공유</span>
          </div>
          <p className="text-white/60 text-sm mb-2">익명으로 고민 작성</p>
          <p className="text-yellow-400 font-bold">+50 토큰</p>
        </div>

        <div className="bg-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <span className="text-white font-bold">응원하기</span>
          </div>
          <p className="text-white/60 text-sm mb-2">다른 사람 위로/댓글</p>
          <p className="text-yellow-400 font-bold">+10 토큰</p>
        </div>

        <div className="bg-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white font-bold">인기 글</span>
          </div>
          <p className="text-white/60 text-sm mb-2">많은 공감 받으면</p>
          <p className="text-yellow-400 font-bold">+100 토큰</p>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="여기에 익명으로 고민을 공유해보세요. (최소 20자)"
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
        />
        
        <Button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-6"
        >
          <Coins className="w-5 h-5 mr-2" />
          고민 공유하고 50 토큰 받기
        </Button>

        <p className="text-white/50 text-xs text-center">
          * 토큰은 전문가 상담료 결제 시 1토큰 = 10원으로 사용 가능합니다
        </p>
      </div>
    </div>
  );
};
