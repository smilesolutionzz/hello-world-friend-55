import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  selectQuestions, 
  analyzeAnswer, 
  analyzeCounselingResults,
  CHARACTERS,
  type AgeGroup,
  type CharacterType,
  type CounselingQuestion 
} from '@/utils/CounselingQuestions';
import { ArrowRight, CheckCircle, AlertCircle, Sparkles, Download, Loader2, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StructuredCounselingProps {
  ageGroup: AgeGroup;
  character: CharacterType;
  onComplete: (result: any) => void;
  onMessage: (message: string, isUser: boolean) => void;
}

interface Answer {
  questionId: string;
  question: string;
  answer: string;
  score: number;
  keywords: string[];
  timestamp: Date;
}

export const StructuredCounseling = ({ 
  ageGroup, 
  character, 
  onComplete,
  onMessage 
}: StructuredCounselingProps) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<CounselingQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReassurance, setShowReassurance] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const characterConfig = CHARACTERS[character];

  // TTS 함수
  const speakText = async (text: string) => {
    if (!voiceEnabled) return;
    
    try {
      setIsSpeaking(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    // 초기 질문 선택
    const initialQuestions = selectQuestions(ageGroup, []);
    setQuestions(initialQuestions);
    
    // 인사말 및 비밀 보장 메시지
    setTimeout(() => {
      const greeting = characterConfig.greeting;
      onMessage(greeting, false);
      speakText(greeting);
    }, 500);
    
    setTimeout(() => {
      const reassurance = characterConfig.reassurance[Math.floor(Math.random() * characterConfig.reassurance.length)];
      onMessage(reassurance, false);
      setShowReassurance(false);
    }, 4000);
    
    // 첫 질문
    setTimeout(() => {
      if (initialQuestions.length > 0) {
        const firstQuestion = initialQuestions[0].question;
        onMessage(firstQuestion, false);
        speakText(firstQuestion);
      }
    }, 6000);

    return () => {
      stopSpeaking();
    };
  }, [ageGroup, character]);

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "답변을 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    // 사용자 답변 표시
    onMessage(currentAnswer, true);
    
    // 답변 분석
    setIsAnalyzing(true);
    const analysis = analyzeAnswer(currentAnswer, currentQuestion);
    
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentAnswer,
      score: analysis.score,
      keywords: analysis.keywords,
      timestamp: new Date()
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    // AI 응답 (공감 메시지)
    setTimeout(() => {
      const empathyMessages = [
        '그렇구나, 네 이야기 잘 들었어.',
        '말해줘서 고마워.',
        '네 마음을 이해했어.',
        '솔직하게 얘기해줘서 정말 고마워.',
        '네 감정은 모두 소중해.'
      ];
      const empathy = empathyMessages[Math.floor(Math.random() * empathyMessages.length)];
      onMessage(empathy, false);
      speakText(empathy);
      
      // 우려되는 답변일 경우
      if (analysis.concern) {
        setTimeout(() => {
          const concernMessage = '네가 힘든 시간을 보내고 있는 것 같아서 마음이 쓰여. 언제든 이야기하고 싶으면 말해줘.';
          onMessage(concernMessage, false);
        }, 1500);
      }
    }, 1000);
    
    setCurrentAnswer('');
    setIsAnalyzing(false);
    
    // 다음 질문 또는 완료
    if (currentQuestionIndex < questions.length - 1) {
      // 중간에 격려 메시지
      if ((currentQuestionIndex + 1) % 3 === 0) {
        setTimeout(() => {
          const encouragement = characterConfig.reassurance[Math.floor(Math.random() * characterConfig.reassurance.length)];
          onMessage(encouragement, false);
        }, 2500);
        
        setTimeout(() => {
          const nextQuestion = questions[currentQuestionIndex + 1].question;
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          onMessage(nextQuestion, false);
          speakText(nextQuestion);
        }, 4000);
      } else {
        setTimeout(() => {
          const nextQuestion = questions[currentQuestionIndex + 1].question;
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          onMessage(nextQuestion, false);
          speakText(nextQuestion);
        }, 3000);
      }
    } else {
      // 모든 질문 완료
      completeAnalysis(updatedAnswers);
    }
  };

  const completeAnalysis = async (finalAnswers: Answer[]) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      onMessage('모든 질문에 답해줘서 정말 고마워! 이제 네 이야기를 정리해볼게.', false);
    }, 1000);
    
    // 결과 분석
    const result = analyzeCounselingResults(finalAnswers.map(a => ({
      questionId: a.questionId,
      answer: a.answer,
      score: a.score,
      keywords: a.keywords
    })));
    
    // 마이데이터에 저장
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.from('ai_health_insights').insert({
          user_id: user.id,
          insight_type: 'structured_counseling',
          content: JSON.stringify({
            ageGroup,
            character,
            questions: finalAnswers.length,
            result,
            answers: finalAnswers.map(a => ({
              question: a.question,
              answer: a.answer,
              score: a.score
            }))
          }),
          confidence_score: result.severity === 'high' ? 90 : result.severity === 'medium' ? 70 : 50
        });
        
        if (error) {
          console.error('Error saving counseling result:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
    // 결과 메시지
    setTimeout(() => {
      let message = '';
      if (result.severity === 'high') {
        message = '네가 요즘 많이 힘들어하는 것 같아. 혼자 고민하지 말고 전문가 선생님과 이야기해보는 게 좋을 것 같아.';
      } else if (result.severity === 'medium') {
        message = '몇 가지 걱정되는 부분이 있네. 앞으로도 네 마음을 잘 살펴보고, 필요하면 언제든 도움을 청해.';
      } else {
        message = '전반적으로 잘 지내고 있는 것 같아! 앞으로도 지금처럼 건강하게 지내길 바라.';
      }
      onMessage(message, false);
    }, 3000);
    
    setTimeout(() => {
      onMessage(result.recommendation, false);
    }, 4500);
    
    setTimeout(() => {
      onMessage('오늘 대화해줘서 정말 고마웠어. 다음에 또 만나자!', false);
    }, 6000);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      onComplete({
        ...result,
        answers: finalAnswers,
        ageGroup,
        character,
        timestamp: new Date()
      });
    }, 7000);
  };

  const progress = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;

  return (
    <Card className="p-6 space-y-4 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: characterConfig.color }}
          >
            {character === 'elephant' && '🐘'}
            {character === 'bear' && '🐻'}
            {character === 'rabbit' && '🐰'}
            {character === 'fox' && '🦊'}
          </div>
          <div>
            <h3 className="font-semibold">{characterConfig.name}</h3>
            <p className="text-sm text-muted-foreground">구조화된 상담</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              }
              setVoiceEnabled(!voiceEnabled);
            }}
            className="h-8 w-8"
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Badge variant={showReassurance ? "default" : "secondary"}>
            🔒 비밀 보장
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">진행 상황</span>
          <span className="font-medium">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {questions.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="font-medium text-primary">
                {questions[currentQuestionIndex].question}
              </p>
              <Badge variant="outline" className="text-xs">
                {questions[currentQuestionIndex].category === 'emotion' && '감정'}
                {questions[currentQuestionIndex].category === 'family' && '가족'}
                {questions[currentQuestionIndex].category === 'social' && '사회'}
                {questions[currentQuestionIndex].category === 'self' && '자아'}
                {questions[currentQuestionIndex].category === 'daily' && '일상'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAnswerSubmit();
            }
          }}
          placeholder="편안하게 네 마음을 얘기해줘..."
          className="w-full p-3 rounded-lg border bg-background min-h-[100px] resize-none focus:ring-2 focus:ring-primary"
          disabled={isAnalyzing}
        />
        
        <Button
          onClick={handleAnswerSubmit}
          disabled={!currentAnswer.trim() || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              답변하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {answers.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            답변 완료: {answers.length}개
          </p>
          <div className="flex gap-1">
            {answers.map((_, index) => (
              <div
                key={index}
                className="h-2 flex-1 rounded-full bg-primary/30"
              />
            ))}
            {Array.from({ length: questions.length - answers.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-2 flex-1 rounded-full bg-muted"
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
