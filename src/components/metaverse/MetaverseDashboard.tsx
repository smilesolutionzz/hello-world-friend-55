import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Globe, 
  Users, 
  Bot, 
  Palette, 
  Play, 
  Pause, 
  Settings, 
  Mic, 
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  Heart,
  Brain,
  Sparkles,
  TreePine,
  Waves,
  Star,
  BookOpen,
  Flower,
  Mountain
} from 'lucide-react';
import { TherapyEnvironment3D, UserAvatar } from '@/components/metaverse/TherapyEnvironment3D';
import { useMetaverseTherapy } from '@/hooks/useMetaverseTherapy';
import { supabase } from '@/integrations/supabase/client';

const environmentIcons = {
  forest: TreePine,
  beach: Waves,
  space: Star,
  library: BookOpen,
  garden: Flower,
  mountain: Mountain
};

export const MetaverseDashboard = () => {
  const { toast } = useToast();
  const {
    loading,
    environments,
    sessions,
    userAvatars,
    aiTherapists,
    scenarios,
    currentSession,
    recommendedEnvironment,
    loadTherapyEnvironments,
    loadMetaverseSessions,
    loadUserAvatars,
    loadAITherapists,
    loadTherapyScenarios,
    recommendEnvironment,
    createMetaverseSession,
    joinMetaverseSession,
    generateAITherapistResponse,
    createUserAvatar
  } = useMetaverseTherapy();

  const [activeTab, setActiveTab] = useState('environments');
  const [selectedEnvironment, setSelectedEnvironment] = useState<any>(null);
  const [selectedAITherapist, setSelectedAITherapist] = useState<any>(null);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isInSession, setIsInSession] = useState(false);
  const [sessionParticipants, setSessionParticipants] = useState<any[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [avatarConfig, setAvatarConfig] = useState({
    name: '',
    bodyColor: '#FFB6C1',
    skinColor: '#FDBCB4',
    style: 'casual'
  });
  const [sessionConfig, setSessionConfig] = useState({
    sessionName: '',
    description: '',
    sessionType: 'individual',
    maxParticipants: 8,
    isPublic: false
  });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
    getCurrentProfile();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadTherapyEnvironments(),
        loadMetaverseSessions(),
        loadAITherapists(),
        loadTherapyScenarios()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getCurrentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setCurrentProfile(profile);
        
        if (profile) {
          await loadUserAvatars(profile.id);
        }
      }
    } catch (error) {
      console.error('Error getting current profile:', error);
    }
  };

  const handleEnvironmentRecommendation = async () => {
    if (!currentProfile) return;

    try {
      const recommendation = await recommendEnvironment(
        currentProfile.id,
        '편안함',
        ['스트레스 완화', '마음 안정']
      );
      
      const environment = environments.find(env => env.id === recommendation.recommended_environment_id);
      setSelectedEnvironment(environment);
      
      toast({
        title: "환경 추천 완료",
        description: `${environment?.name}이(가) 추천되었습니다.`,
      });
    } catch (error) {
      console.error('Error getting environment recommendation:', error);
      toast({
        title: "오류",
        description: "환경 추천 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSession = async () => {
    if (!currentProfile || !selectedEnvironment) return;

    try {
      const session = await createMetaverseSession({
        hostProfileId: currentProfile.id,
        sessionType: sessionConfig.sessionType,
        environmentId: selectedEnvironment.id,
        sessionName: sessionConfig.sessionName,
        description: sessionConfig.description,
        maxParticipants: sessionConfig.maxParticipants,
        isPublic: sessionConfig.isPublic
      });

      setIsInSession(true);
      setSessionParticipants([{
        profile_id: currentProfile.id,
        avatar: userAvatars.find(a => a.is_active),
        role: 'host'
      }]);

      toast({
        title: "세션 생성 완료",
        description: "메타버스 치료 세션이 생성되었습니다.",
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "오류",
        description: "세션 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!currentProfile) return;

    try {
      const activeAvatar = userAvatars.find(a => a.is_active);
      await joinMetaverseSession(sessionId, currentProfile.id, activeAvatar?.id);
      
      setIsInSession(true);
      
      toast({
        title: "세션 참가 완료",
        description: "메타버스 치료 세션에 참가했습니다.",
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "오류",
        description: "세션 참가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAvatar = async () => {
    if (!currentProfile || !avatarConfig.name) return;

    try {
      const avatar = await createUserAvatar(
        currentProfile.id,
        avatarConfig.name,
        {
          bodyColor: avatarConfig.bodyColor,
          skinColor: avatarConfig.skinColor,
          style: avatarConfig.style
        }
      );

      await loadUserAvatars(currentProfile.id);
      
      toast({
        title: "아바타 생성 완료",
        description: "새로운 아바타가 생성되었습니다.",
      });
    } catch (error) {
      console.error('Error creating avatar:', error);
      toast({
        title: "오류",
        description: "아바타 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !selectedAITherapist || !currentProfile) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setUserMessage('');

    try {
      const response = await generateAITherapistResponse(
        selectedAITherapist.id,
        userMessage,
        currentProfile.id,
        { environment: selectedEnvironment, session: currentSession },
        '보통',
        ['스트레스 완화']
      );

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.verbal_response,
        gesture: response.gesture_animation,
        expression: response.facial_expression,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "오류",
        description: "AI 치료사 응답 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getEnvironmentIcon = (type: string) => {
    const IconComponent = environmentIcons[type as keyof typeof environmentIcons] || Globe;
    return <IconComponent className="h-4 w-4" />;
  };

  if (isInSession && selectedEnvironment) {
    return (
      <div className="h-screen flex flex-col">
        {/* Session Header */}
        <div className="bg-background border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{selectedEnvironment.name}</h1>
            <Badge variant="outline">{sessionParticipants.length}명 참가 중</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={audioEnabled ? "default" : "secondary"}
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={videoEnabled ? "default" : "secondary"}
              size="icon"
              onClick={() => setVideoEnabled(!videoEnabled)}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
            <Button variant="outline" onClick={() => setIsInSession(false)}>
              세션 나가기
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* 3D Environment */}
          <div className="flex-1 relative">
            <TherapyEnvironment3D
              environmentType={selectedEnvironment.environment_type}
              config={selectedEnvironment.scene_config}
              lighting={selectedEnvironment.lighting_config}
              onUserInteraction={(interaction) => {
                console.log('User interaction:', interaction);
              }}
            >
              {/* Render user avatars */}
              {sessionParticipants.map((participant, index) => (
                <UserAvatar
                  key={participant.profile_id}
                  position={[index * 2 - 1, 0, 0]}
                  config={{
                    name: participant.avatar?.avatar_name || '사용자',
                    ...participant.avatar?.appearance_config
                  }}
                  isCurrentUser={participant.profile_id === currentProfile?.id}
                />
              ))}
            </TherapyEnvironment3D>
          </div>

          {/* Chat Panel */}
          <div className="w-80 border-l bg-background flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                AI 치료사와 대화
              </h3>
              
              {selectedAITherapist && (
                <div className="flex items-center gap-2 mt-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {selectedAITherapist.name}
                  </span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    {message.gesture && (
                      <p className="text-xs opacity-70 mt-1">*{message.gesture}*</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="메시지를 입력하세요..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={!selectedAITherapist}
                />
                <Button onClick={handleSendMessage} disabled={!selectedAITherapist}>
                  전송
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            메타버스 치료 환경
          </h1>
          <p className="text-muted-foreground mt-1">
            몰입형 3D 가상 치료 공간에서 새로운 차원의 치료를 경험하세요
          </p>
        </div>
        
        <Button onClick={handleEnvironmentRecommendation} disabled={loading || !currentProfile}>
          <Sparkles className="h-4 w-4 mr-2" />
          환경 추천 받기
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="environments">가상 환경</TabsTrigger>
          <TabsTrigger value="avatars">아바타</TabsTrigger>
          <TabsTrigger value="therapists">AI 치료사</TabsTrigger>
          <TabsTrigger value="sessions">세션</TabsTrigger>
          <TabsTrigger value="scenarios">시나리오</TabsTrigger>
        </TabsList>

        <TabsContent value="environments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {environments.map((environment) => (
              <Card 
                key={environment.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedEnvironment?.id === environment.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedEnvironment(environment)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getEnvironmentIcon(environment.environment_type)}
                    {environment.name}
                  </CardTitle>
                  <CardDescription>{environment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">
                      {environment.environment_type}
                    </Badge>
                    
                    {environment.ambient_sounds && (
                      <div>
                        <p className="text-sm font-medium">배경음</p>
                        <div className="flex flex-wrap gap-1">
                          {environment.ambient_sounds.map((sound: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {sound}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedEnvironment && (
            <Card>
              <CardHeader>
                <CardTitle>세션 생성</CardTitle>
                <CardDescription>선택한 환경에서 새로운 치료 세션을 만들어보세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">세션 이름</label>
                    <Input
                      placeholder="세션 이름을 입력하세요"
                      value={sessionConfig.sessionName}
                      onChange={(e) => setSessionConfig(prev => ({ ...prev, sessionName: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">세션 유형</label>
                    <Select 
                      value={sessionConfig.sessionType} 
                      onValueChange={(value) => setSessionConfig(prev => ({ ...prev, sessionType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">개별 치료</SelectItem>
                        <SelectItem value="group">그룹 치료</SelectItem>
                        <SelectItem value="exposure">노출 치료</SelectItem>
                        <SelectItem value="roleplay">역할극</SelectItem>
                        <SelectItem value="social_training">사회성 훈련</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">설명</label>
                  <Textarea
                    placeholder="세션에 대한 설명을 입력하세요"
                    value={sessionConfig.description}
                    onChange={(e) => setSessionConfig(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">최대 참가자</label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={sessionConfig.maxParticipants}
                      onChange={(e) => setSessionConfig(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                  </div>
                  
                  <Button onClick={handleCreateSession} disabled={!sessionConfig.sessionName}>
                    <Play className="h-4 w-4 mr-2" />
                    세션 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="avatars" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  아바타 생성
                </CardTitle>
                <CardDescription>나만의 가상 아바타를 만들어보세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">아바타 이름</label>
                  <Input
                    placeholder="아바타 이름을 입력하세요"
                    value={avatarConfig.name}
                    onChange={(e) => setAvatarConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">피부색</label>
                    <Input
                      type="color"
                      value={avatarConfig.skinColor}
                      onChange={(e) => setAvatarConfig(prev => ({ ...prev, skinColor: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">의상색</label>
                    <Input
                      type="color"
                      value={avatarConfig.bodyColor}
                      onChange={(e) => setAvatarConfig(prev => ({ ...prev, bodyColor: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">스타일</label>
                  <Select 
                    value={avatarConfig.style} 
                    onValueChange={(value) => setAvatarConfig(prev => ({ ...prev, style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">캐주얼</SelectItem>
                      <SelectItem value="formal">포멀</SelectItem>
                      <SelectItem value="sporty">스포티</SelectItem>
                      <SelectItem value="elegant">우아함</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateAvatar} disabled={!avatarConfig.name} className="w-full">
                  아바타 생성
                </Button>
              </CardContent>
            </Card>

            {/* Existing Avatars */}
            <Card>
              <CardHeader>
                <CardTitle>내 아바타</CardTitle>
                <CardDescription>생성된 아바타를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAvatars.map((avatar) => (
                    <div 
                      key={avatar.id} 
                      className={`p-3 border rounded-lg flex items-center justify-between ${
                        avatar.is_active ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2"
                          style={{ backgroundColor: avatar.appearance_config.skinColor }}
                        />
                        <div>
                          <p className="font-medium">{avatar.avatar_name}</p>
                          <p className="text-sm text-muted-foreground">{avatar.appearance_config.style}</p>
                        </div>
                      </div>
                      
                      {avatar.is_active && (
                        <Badge variant="default">활성</Badge>
                      )}
                    </div>
                  ))}
                  
                  {userAvatars.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      아직 생성된 아바타가 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="therapists" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTherapists.map((therapist) => (
              <Card 
                key={therapist.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedAITherapist?.id === therapist.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedAITherapist(therapist)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    {therapist.name}
                  </CardTitle>
                  <CardDescription>{therapist.specialization}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">성격 특성</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(therapist.personality_traits).map(([trait, value]) => (
                          <Badge key={trait} variant="secondary" className="text-xs">
                            {trait}: {value}/10
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">치료 접근법</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {therapist.therapy_approaches.map((approach: string) => (
                          <Badge key={approach} variant="outline" className="text-xs">
                            {approach}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {session.session_name}
                      </CardTitle>
                      <CardDescription>{session.description}</CardDescription>
                    </div>
                    
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {session.current_participants}/{session.max_participants} 참가자
                      </span>
                      <Badge variant="outline">{session.session_type}</Badge>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoinSession(session.id)}
                      disabled={session.current_participants >= session.max_participants}
                    >
                      참가하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {sessions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">현재 활성화된 세션이 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-1">새로운 세션을 만들어보세요!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {scenario.title}
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">난이도</span>
                      <Badge variant="outline">{scenario.difficulty_level}/10</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">대상</span>
                      <Badge variant="secondary">{scenario.target_age_group}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">치료 목표</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scenario.therapeutic_goals.map((goal: string) => (
                          <Badge key={goal} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
