import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Phone, Coffee, Clock, Smile, Frown, Meh } from 'lucide-react';
import { toast } from 'sonner';

interface EmotionalEntry {
  id: string;
  mood: 'good' | 'okay' | 'hard';
  content: string;
  timestamp: Date;
  supportReceived?: boolean;
}

const EmotionalSupport = () => {
  const [currentMood, setCurrentMood] = useState<'good' | 'okay' | 'hard' | null>(null);
  const [emotionalNote, setEmotionalNote] = useState('');
  const [showSOS, setShowSOS] = useState(false);
  const [entries, setEntries] = useState<EmotionalEntry[]>([]);

  const handleMoodSelect = (mood: 'good' | 'okay' | 'hard') => {
    setCurrentMood(mood);
    if (mood === 'hard') {
      setShowSOS(true);
    }
  };

  const saveEmotionalEntry = () => {
    if (!currentMood || !emotionalNote.trim()) {
      toast.error('기분과 내용을 모두 입력해주세요');
      return;
    }

    const newEntry: EmotionalEntry = {
      id: Date.now().toString(),
      mood: currentMood,
      content: emotionalNote,
      timestamp: new Date()
    };

    setEntries(prev => [newEntry, ...prev]);
    setEmotionalNote('');
    setCurrentMood(null);
    
    toast.success('소중한 마음을 기록했어요 💙');
  };

  const handleSOSClick = () => {
    toast.success('도움 요청을 보냈어요. 곧 연락드릴게요 💙', {
      duration: 5000
    });
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'good': return <Smile className="w-5 h-5 text-green-600" />;
      case 'okay': return <Meh className="w-5 h-5 text-yellow-600" />;
      case 'hard': return <Frown className="w-5 h-5 text-red-600" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'okay': return 'bg-yellow-50 border-yellow-200';
      case 'hard': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const supportMessages = [
    "지금 힘드시죠? 혼자가 아니에요. 많은 부모님들이 같은 마음이에요 💙",
    "완벽할 필요 없어요. 최선을 다하고 계신 것만으로도 충분해요 🫂",
    "오늘 하루도 고생하셨어요. 잠시 쉬어가도 괜찮아요 ☕",
    "우리 아이에게 최고의 부모는 바로 당신이에요 ❤️"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-rose-600" />
            <h1 className="text-3xl font-bold text-gray-900">마음 돌봄</h1>
          </div>
          <p className="text-gray-600">
            혼자가 아니에요. 함께 이겨내요 💙
          </p>
        </div>

        {/* SOS 버튼 */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              지금 당장 도움이 필요하세요?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="destructive" 
                onClick={handleSOSClick}
                className="bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                긴급 상담 요청
              </Button>
              <Button variant="outline" className="border-red-300 text-red-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                채팅 상담
              </Button>
            </div>
            <p className="text-xs text-red-600 mt-2">
              24시간 언제든지 연락주세요. 전문 상담사가 도와드릴게요.
            </p>
          </CardContent>
        </Card>

        {/* 오늘의 기분 기록 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘 기분은 어떠세요?</CardTitle>
            <CardDescription>솔직한 마음을 표현해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={currentMood === 'good' ? 'default' : 'outline'}
                onClick={() => handleMoodSelect('good')}
                className="h-20 flex-col space-y-2"
              >
                <Smile className="w-8 h-8" />
                <span>좋아요</span>
              </Button>
              <Button
                variant={currentMood === 'okay' ? 'default' : 'outline'}
                onClick={() => handleMoodSelect('okay')}
                className="h-20 flex-col space-y-2"
              >
                <Meh className="w-8 h-8" />
                <span>그냥 그래요</span>
              </Button>
              <Button
                variant={currentMood === 'hard' ? 'default' : 'outline'}
                onClick={() => handleMoodSelect('hard')}
                className="h-20 flex-col space-y-2"
              >
                <Frown className="w-8 h-8" />
                <span>힘들어요</span>
              </Button>
            </div>

            {currentMood && (
              <div className="space-y-3">
                <Textarea
                  placeholder="오늘 하루는 어땠나요? 어떤 일이 있었는지, 어떤 기분인지 자유롭게 적어보세요..."
                  value={emotionalNote}
                  onChange={(e) => setEmotionalNote(e.target.value)}
                  rows={4}
                />
                <Button onClick={saveEmotionalEntry} className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  마음 기록하기
                </Button>
              </div>
            )}

            {currentMood === 'hard' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">💙 힘든 시간이시군요</h4>
                <p className="text-blue-700 text-sm mb-3">
                  {supportMessages[Math.floor(Math.random() * supportMessages.length)]}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-blue-600" />
                    <span>잠시 휴식을 취해보세요</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>다른 부모님들과 이야기해보세요</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>전문가 도움을 받아보세요</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 응원 메시지 */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-purple-800">
                ✨ 오늘의 응원 메시지
              </h3>
              <p className="text-purple-700 text-lg italic">
                "당신은 혼자가 아닙니다. 수많은 부모님들이 같은 길을 걷고 있어요. 함께라면 할 수 있어요!"
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  #육아맘파이팅
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  #함께해요
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  #당신은소중해요
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 최근 기록들 */}
        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                나의 감정 기록
              </CardTitle>
              <CardDescription>지난 기록들을 보며 변화를 느껴보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border ${getMoodColor(entry.mood)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <span className="font-medium">
                          {entry.mood === 'good' ? '좋은 하루' : 
                           entry.mood === 'okay' ? '보통 하루' : '힘든 하루'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 전문가 연결 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🤝 전문가와 함께해요</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">심리 상담사</h4>
                <p className="text-sm text-gray-600 mb-3">
                  육아 스트레스와 감정 관리를 도와드려요
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  상담 예약하기
                </Button>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">장애인 부모 모임</h4>
                <p className="text-sm text-gray-600 mb-3">
                  같은 고민을 가진 부모님들과 만나보세요
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  모임 참여하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmotionalSupport;