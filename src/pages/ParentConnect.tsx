import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Shield, 
  Bell, 
  CheckCircle,
  Copy,
  Share2,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { motion } from "framer-motion";

const ParentConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [connectCode, setConnectCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const [loading, setLoading] = useState(false);

  useState(() => {
    // 내 연결 코드 생성
    const generateCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 간단한 6자리 코드 생성
        const code = user.id.slice(0, 6).toUpperCase();
        setMyCode(code);
      }
    };
    generateCode();
  });

  const handleConnect = async () => {
    if (!connectCode.trim()) {
      toast({
        title: "코드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // 실제로는 parent_child_connections 테이블에 저장
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "연결 요청 완료! 💙",
      description: "부모님이 승인하면 연결이 완료됩니다",
    });
    
    setLoading(false);
    setConnectCode("");
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(myCode);
    toast({
      title: "코드 복사 완료!",
      description: "부모님께 이 코드를 알려주세요",
    });
  };

  const handleShareCode = async () => {
    const message = `우리 아이의 마음일기 연결 코드입니다: ${myCode}\n\n부모 대시보드에서 이 코드로 연결해주세요!`;
    
    if (navigator.share) {
      await navigator.share({
        title: '마음일기 연결 코드',
        text: message,
      });
    } else {
      await navigator.clipboard.writeText(message);
      toast({
        title: "메시지 복사 완료!",
        description: "카카오톡 등으로 부모님께 보내주세요",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-6 pb-12 max-w-md">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-pink-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            부모님과 연결하기
          </h1>
          <p className="text-slate-400 text-sm">
            부모님이 내 마음 상태를 확인할 수 있어요
          </p>
        </motion.div>

        {/* 혜택 안내 */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-4 space-y-3">
            {[
              { icon: Shield, text: "힘들 때 부모님이 먼저 알아차려요", color: "text-blue-400" },
              { icon: Bell, text: "위기 상황 시 즉시 알림이 가요", color: "text-red-400" },
              { icon: Users, text: "가족이 함께 마음 건강을 챙겨요", color: "text-green-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 내 연결 코드 */}
        <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30 mb-6">
          <CardContent className="p-4">
            <p className="text-slate-300 text-sm mb-3">내 연결 코드</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-slate-900/50 rounded-lg px-4 py-3 text-center">
                <span className="text-2xl font-mono font-bold text-white tracking-widest">
                  {myCode || "------"}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopyCode}
                className="text-primary hover:text-primary/80"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <Button 
              onClick={handleShareCode}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary"
            >
              <Share2 className="w-4 h-4 mr-2" />
              부모님께 코드 보내기
            </Button>
          </CardContent>
        </Card>

        {/* 구분선 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 text-sm">또는</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* 부모 코드 입력 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-white font-medium mb-3">부모님 코드 입력</p>
            <p className="text-slate-400 text-sm mb-4">
              부모님께서 알려주신 코드를 입력하세요
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="6자리 코드"
                value={connectCode}
                onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="bg-slate-900/50 border-slate-600 text-center font-mono text-lg tracking-widest"
              />
              <Button 
                onClick={handleConnect}
                disabled={loading || connectCode.length !== 6}
              >
                {loading ? "연결중..." : "연결"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            연결 후에도 일기 내용은 공유되지 않아요.<br />
            기분 상태만 부모님께 보여져요. 🔒
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentConnect;
