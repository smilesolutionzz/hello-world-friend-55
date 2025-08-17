import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsAnalyzing(true);
    
    // 여기에 나중에 AI 분석 로직 추가
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "분석 완료",
        description: "맞춤 전문가를 찾고 있습니다...",
      });
      setMessage("");
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* AIH Pro Beta Badge */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-border">
          <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
          <span className="text-xl font-semibold text-brand-gradient">AIH Pro</span>
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">beta</span>
        </div>
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예시: 우리 아이가 3살인데 말을 잘 안 해서 걱정이에요. 발달이 늦는 건 아닐까요?"
            className="chat-input resize-none min-h-[120px] text-lg leading-relaxed"
            disabled={isAnalyzing}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-4 left-4 text-sm text-muted-foreground">
            {message.length}/500
          </div>
        </div>

        {/* Guidelines */}
        <div className="text-sm text-muted-foreground space-y-2 px-2">
          <p>최소 50자 이상으로 가능한 상황하니 고민을 구체적으로 알려주세요</p>
          <p>잠고원 안원 정보나 URL은 저희 가능해요. AI 분석을 하루 할머닛 가능해요!</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isAnalyzing || message.length < 10}
            className="btn-brand min-w-[120px]"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                분석중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                전송
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;