import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAICoachAdvanced } from '@/hooks/useAICoachAdvanced';
import { Brain, Heart, Users, Activity, MessageCircle, Target, TrendingUp, AlertCircle } from 'lucide-react';

const AICoachDashboard = () => {
  const {
    loading,
    currentSession,
    conversations,
    cbtHomework,
    emotionLogs,
    startCoachingSession,
    endCoachingSession,
    chatWithCoach,
    analyzeEmotion,
    generateCBTHomework,
    analyzeRelationship,
    getLifestyleCoaching,
    getPersonalizedIntervention,
    fetchConversations,
    fetchCBTHomework,
    fetchEmotionLogs,
    getSessionTypeLabel,
  } = useAICoachAdvanced();

  const [userMessage, setUserMessage] = useState('');
  const [activeTab, setActiveTab] = useState('emotion');

  useEffect(() => {
    fetchConversations();
    fetchCBTHomework();
    fetchEmotionLogs();
  }, []);

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    try {
      await chatWithCoach(userMessage, currentSession?.sessionType || 'emotion_monitoring');
      setUserMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEmotionAnalysis = async () => {
    try {
      await analyzeEmotion({
        text: userMessage,
        urgencyLevel: 'medium'
      });
    } catch (error) {
      console.error('Error analyzing emotion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI 심리 코치
          </h1>
          <p className="text-muted-foreground">
            24시간 개인 맞춤 AI 심리 코칭 시스템
          </p>
        </div>

        {/* Session Status */}
        {currentSession && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                활성 세션: {getSessionTypeLabel(currentSession.sessionType)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span>시작 시간: {new Date(currentSession.startTime).toLocaleString()}</span>
                <Button 
                  onClick={() => endCoachingSession(5)}
                  variant="outline"
                >
                  세션 종료
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="emotion" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              감정 모니터링
            </TabsTrigger>
            <TabsTrigger value="cbt" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              CBT 코칭
            </TabsTrigger>
            <TabsTrigger value="relationship" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              관계 개선
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              라이프스타일
            </TabsTrigger>
          </TabsList>

          {/* Emotion Monitoring */}
          <TabsContent value="emotion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chat Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    AI 코치와 대화
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                    {conversations.slice(0, 10).map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-lg ${
                          msg.messageType === 'user' 
                            ? 'bg-primary/10 ml-8' 
                            : 'bg-muted mr-8'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        {msg.emotionDetected && (
                          <Badge variant="secondary" className="mt-1">
                            {msg.emotionDetected}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="감정이나 고민을 자유롭게 표현해보세요..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={loading}>
                      전송
                    </Button>
                  </div>
                  <Button 
                    onClick={handleEmotionAnalysis} 
                    disabled={loading || !userMessage.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    감정 분석하기
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Emotions */}
              <Card>
                <CardHeader>
                  <CardTitle>최근 감정 기록</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {emotionLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium">{log.emotion_type}</span>
                          <p className="text-sm text-muted-foreground">
                            강도: {log.intensity_level}/10
                          </p>
                        </div>
                        <Badge variant={log.intensity_level > 7 ? "destructive" : "secondary"}>
                          {new Date(log.detection_timestamp).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CBT Coaching */}
          <TabsContent value="cbt" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    CBT 숙제
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={generateCBTHomework} disabled={loading} className="w-full">
                    새 숙제 생성
                  </Button>
                  <div className="space-y-2">
                    {cbtHomework.slice(0, 3).map((hw) => (
                      <div key={hw.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{hw.title}</h4>
                        <p className="text-sm text-muted-foreground">{hw.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant={hw.completionStatus === 'completed' ? "default" : "secondary"}>
                            {hw.completionStatus}
                          </Badge>
                          <span className="text-sm">난이도: {hw.difficultyLevel}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Relationship Coaching */}
          <TabsContent value="relationship" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>관계 개선 코칭</CardTitle>
                <CardDescription>
                  가족, 연인, 친구와의 관계를 개선하는 맞춤 조언을 받아보세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => startCoachingSession('relationship_coaching')}
                  disabled={loading || !!currentSession}
                  className="w-full"
                >
                  관계 코칭 세션 시작
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifestyle Coaching */}
          <TabsContent value="lifestyle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>라이프스타일 코칭</CardTitle>
                <CardDescription>
                  수면, 운동, 영양과 정신건강의 연관성을 분석하고 개선 방안을 제시합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => startCoachingSession('lifestyle_coaching')}
                  disabled={loading || !!currentSession}
                  className="w-full"
                >
                  라이프스타일 코칭 세션 시작
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => startCoachingSession('emotion_monitoring')}
            disabled={loading || !!currentSession}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            감정 모니터링
          </Button>
          <Button 
            onClick={() => startCoachingSession('cbt_coaching')}
            disabled={loading || !!currentSession}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            CBT 코칭
          </Button>
          <Button 
            onClick={() => startCoachingSession('relationship_coaching')}
            disabled={loading || !!currentSession}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            관계 개선
          </Button>
          <Button 
            onClick={() => startCoachingSession('lifestyle_coaching')}
            disabled={loading || !!currentSession}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            라이프스타일
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICoachDashboard;