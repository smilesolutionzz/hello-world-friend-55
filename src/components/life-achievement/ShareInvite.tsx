import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Users, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InviteStats {
  totalInvites: number;
  acceptedInvites: number;
}

export const ShareInvite = () => {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [stats, setStats] = useState<InviteStats>({ totalInvites: 0, acceptedInvites: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 초대 코드 생성 또는 가져오기
      const { data: existingInvite } = await supabase
        .from('life_achievement_invites')
        .select('invite_code')
        .eq('inviter_id', user.id)
        .limit(1)
        .single();

      if (existingInvite) {
        setInviteCode(existingInvite.invite_code);
      } else {
        // 새 초대 코드 생성
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data: newInvite } = await supabase
          .from('life_achievement_invites')
          .insert({
            inviter_id: user.id,
            invite_code: code,
            invited_email: '',
            invited_user_id: ''
          })
          .select('invite_code')
          .single();

        if (newInvite) {
          setInviteCode(newInvite.invite_code);
        }
      }

      // 통계 로드
      const { data: invites } = await supabase
        .from('life_achievement_invites')
        .select('*')
        .eq('inviter_id', user.id);

      setStats({
        totalInvites: invites?.length || 0,
        acceptedInvites: invites?.filter(i => i.status === 'accepted').length || 0
      });

    } catch (error) {
      console.error('Error loading invite data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}?invite=${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    
    toast({
      title: "초대 링크가 복사되었습니다! 📋",
      description: "친구에게 공유해보세요"
    });
  };

  const shareToKakao = () => {
    const inviteUrl = `${window.location.origin}?invite=${inviteCode}`;
    const text = `인생 달성률 테스트에 초대합니다! 내 인생 목표를 얼마나 달성했는지 확인해보세요 🎯\n\n${inviteUrl}`;
    
    // 카카오톡 공유 (웹 환경에서는 URL 복사로 대체)
    navigator.clipboard.writeText(text);
    
    toast({
      title: "공유 메시지가 복사되었습니다! 💬",
      description: "카카오톡에서 붙여넣기하세요"
    });
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          친구 초대
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          친구를 초대하고 함께 성장하세요
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            초대 보상
          </CardTitle>
          <CardDescription>
            친구가 초대를 수락하면 양쪽 모두 특별한 배지를 받습니다!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-3xl font-bold text-primary">{stats.totalInvites}</div>
              <div className="text-sm text-muted-foreground mt-1">총 초대</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-3xl font-bold text-green-500">{stats.acceptedInvites}</div>
              <div className="text-sm text-muted-foreground mt-1">수락됨</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내 초대 코드</CardTitle>
          <CardDescription>
            이 코드를 친구와 공유하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-lg text-center tracking-wider"
            />
            <Button onClick={copyInviteLink} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2">
            <Button onClick={copyInviteLink} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              초대 링크 복사
            </Button>
            <Button onClick={shareToKakao} variant="outline" className="w-full">
              💬 카카오톡으로 공유
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            초대 받은 친구들
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.acceptedInvites === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 초대를 수락한 친구가 없습니다</p>
              <p className="text-sm mt-2">친구들을 초대해보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: stats.acceptedInvites }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">친구 #{i + 1}</div>
                      <div className="text-sm text-muted-foreground">초대 수락됨</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    활성
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};