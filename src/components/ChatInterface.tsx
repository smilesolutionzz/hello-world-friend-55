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
    
      // AI 분석으로 전문가급 진단 시작
      window.location.href = '/assessment';
      setIsAnalyzing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* AIH Pro Beta Badge */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-border">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse-glow" />
          <span className="text-lg sm:text-xl font-semibold text-brand-gradient">AIH Pro</span>
          <span className="text-xs sm:text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">beta</span>
        </div>
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예시: 우리 아이가 3살인데 말을 잘 안 해서 걱정이에요. 발달이 늦는 건 아닐까요?"
            className="chat-input resize-none min-h-[100px] sm:min-h-[120px] text-base sm:text-lg leading-relaxed"
            disabled={isAnalyzing}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-xs sm:text-sm text-muted-foreground">
            {message.length}/500
          </div>
        </div>

        {/* Guidelines */}
        <div className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2 px-1 sm:px-2">
          <p>최소 50자 이상으로 가능한 구체적으로 고민을 알려주세요</p>
          <p>개인정보나 민감한 정보는 포함하지 말아주세요. AI 분석이 즉시 시작됩니다!</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center sm:justify-end">
          <Button
            type="submit"
            disabled={isAnalyzing || message.length < 10}
            className="btn-brand w-full sm:w-auto min-w-[120px]"
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