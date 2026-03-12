import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Dumbbell,
  Sparkles,
  Apple,
  Moon,
  Trophy,
  CheckCircle2,
  Phone,
  Heart
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { VoiceCounselingTab } from '@/components/wellness/VoiceCounselingTab';
import { MeditationTab } from '@/components/wellness/MeditationTab';
import { useLanguage } from '@/i18n/LanguageContext';

const WellnessLifestyle = () => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const { isEnglish } = useLanguage();

  const achievementPercentage = (completedTasks.length / 5) * 100;

  const taskItems = [
    { id: 'meditation', icon: Brain, label: isEnglish ? 'Meditation' : '명상' },
    { id: 'workout', icon: Dumbbell, label: isEnglish ? 'Exercise' : '운동' },
    { id: 'nutrition', icon: Apple, label: isEnglish ? 'Nutrition' : '영양' },
    { id: 'sleep', icon: Moon, label: isEnglish ? 'Sleep' : '수면' },
    { id: 'emotion', icon: Heart, label: isEnglish ? 'Emotion' : '감정' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>{isEnglish ? 'AI Life Hub - Comprehensive Wellness' : 'AI 라이프허브 - 종합 웰니스 관리'}</title>
        <meta name="description" content={isEnglish ? 'Manage your wellness with AI voice counseling, meditation, and emotion journaling' : 'AI 기반 음성 상담, 명상, 감정 일기로 당신의 웰니스를 관리하세요'} />
      </Helmet>
      
      <UnifiedNavigation />
      
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">{isEnglish ? 'AI Life Hub' : 'AI 라이프허브'}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              {isEnglish ? 'Your Personal AI Wellness Hub' : '당신만의 AI 웰니스 허브'}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {isEnglish ? (
                <>From voice counseling to meditation and emotion journaling<br />All wellness features in one place</>
              ) : (
                <>음성 상담부터 명상, 감정 일기까지<br />모든 웰니스 기능을 하나로</>
              )}
            </p>

            <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    {isEnglish ? "Today's Achievement" : '오늘의 성취도'}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{achievementPercentage.toFixed(0)}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={achievementPercentage} className="h-4 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {taskItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      {completedTasks.includes(item.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={completedTasks.includes(item.id) ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          
          <Tabs defaultValue="voice-counseling" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-white/80 p-2 mb-8">
              <TabsTrigger value="voice-counseling" className="data-[state=active]:bg-green-500 data-[state=active]:text-white py-3">
                <Phone className="h-4 w-4 mr-2" />
                {isEnglish ? 'Voice Counseling' : '음성 상담'}
              </TabsTrigger>
              <TabsTrigger value="meditation" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white py-3">
                <Sparkles className="h-4 w-4 mr-2" />
                {isEnglish ? 'Live Meditation' : '실시간 명상'}
              </TabsTrigger>
              <TabsTrigger value="emotion-diary" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white py-3">
                <Heart className="h-4 w-4 mr-2" />
                {isEnglish ? 'Emotion Diary' : '감정 일기'}
              </TabsTrigger>
              <TabsTrigger value="ai-wellness" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-3">
                <Brain className="h-4 w-4 mr-2" />
                {isEnglish ? 'AI Wellness' : 'AI 웰니스'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice-counseling">
              <VoiceCounselingTab />
            </TabsContent>

            <TabsContent value="meditation">
              <MeditationTab />
            </TabsContent>

            <TabsContent value="emotion-diary">
              <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-rose-900">
                    <Heart className="inline-block w-6 h-6 mr-2" />
                    {isEnglish ? 'AI Voice Emotion Diary' : 'AI 음성 감정 일기'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-rose-400" />
                    <h3 className="text-xl font-semibold text-rose-900 mb-2">{isEnglish ? 'Coming Soon' : '준비 중입니다'}</h3>
                    <p className="text-rose-700">
                      {isEnglish ? (
                        <>Voice-based emotion recording<br />will be available soon.</>
                      ) : (
                        <>음성으로 감정을 기록하는 기능이<br />곧 추가될 예정입니다.</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-wellness">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    <Brain className="inline-block w-6 h-6 mr-2" />
                    {isEnglish ? 'AI Wellness Analysis' : 'AI 웰니스 분석'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">{isEnglish ? 'Coming Soon' : '준비 중입니다'}</h3>
                    <p className="text-blue-700">
                      {isEnglish ? (
                        <>Exercise, nutrition, and sleep analysis<br />will be available soon.</>
                      ) : (
                        <>운동, 영양, 수면 분석 기능이<br />곧 추가될 예정입니다.</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </section>
    </div>
  );
};

export default WellnessLifestyle;
