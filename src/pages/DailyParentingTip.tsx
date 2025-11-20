import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyParentingTip() {
  const [childAge, setChildAge] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [tip, setTip] = useState<any>(null);
  const [canDraw, setCanDraw] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkLastDrawDate();
  }, []);

  const checkLastDrawDate = () => {
    const lastDraw = localStorage.getItem("lastTipDraw");
    if (lastDraw) {
      const lastDate = new Date(lastDraw);
      const today = new Date();
      if (
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        setCanDraw(false);
      }
    }
  };

  const handleDrawCard = async () => {
    if (!childAge || parseInt(childAge) < 0 || parseInt(childAge) > 18) {
      toast({
        title: "나이를 확인해주세요",
        description: "0-18세 사이의 나이를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsDrawing(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-parenting-tip", {
        body: { childAge: parseInt(childAge) },
      });

      if (error) throw error;

      setTip(data);
      localStorage.setItem("lastTipDraw", new Date().toISOString());
      setCanDraw(false);
    } catch (error: any) {
      toast({
        title: "오류가 발생했습니다",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsDrawing(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-subtle to-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-huge font-bold text-primary">오늘의 육아 팁</h1>
          <p className="text-medium text-muted-foreground">
            매일 하루에 한 번, 아이 나이에 맞는 육아 팁을 받아보세요
          </p>
        </motion.div>

        <Card visualWeight="medium" glassMorphism>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              카드 뽑기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-small font-medium">아이 나이 (세)</label>
              <Input
                type="number"
                placeholder="예: 3"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                disabled={!canDraw || isDrawing}
                min="0"
                max="18"
              />
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleDrawCard}
              disabled={!canDraw || isDrawing || !childAge}
            >
              {isDrawing ? "카드 뽑는 중..." : canDraw ? "오늘의 육아팁 뽑기" : "내일 다시 올게요"}
            </Button>

            {!canDraw && !tip && (
              <p className="text-small text-center text-muted-foreground">
                오늘은 이미 카드를 뽑으셨어요. 내일 다시 시도해주세요!
              </p>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {isDrawing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 0 }}
              animate={{ opacity: 1, scale: 1, rotateY: 360 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5 }}
              className="flex justify-center"
            >
              <div className="w-64 h-96 bg-gradient-to-br from-primary to-primary-glow rounded-visual-primary shadow-2xl flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white animate-pulse" />
              </div>
            </motion.div>
          )}

          {tip && !isDrawing && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card visualWeight="heavy" glassMorphism floating>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-small font-semibold text-primary">
                        {childAge}세 육아팁
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-big font-bold text-center">{tip.title}</h3>
                    <p className="text-normal leading-relaxed">{tip.content}</p>
                    
                    {tip.tips && tip.tips.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-medium font-semibold">실천 방법</h4>
                        <ul className="space-y-2">
                          {tip.tips.map((item: string, index: number) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span className="text-small">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
