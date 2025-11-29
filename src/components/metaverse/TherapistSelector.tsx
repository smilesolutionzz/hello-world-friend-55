import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getAllTherapistProfiles } from '@/utils/TherapistProfiles';
import type { TherapistType } from '@/types/therapist';

interface TherapistSelectorProps {
  onSelect: (therapistType: TherapistType, userConcern: string) => void;
}

export const TherapistSelector: React.FC<TherapistSelectorProps> = ({ onSelect }) => {
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistType | null>(null);
  const [userConcern, setUserConcern] = useState('');
  const therapists = getAllTherapistProfiles();

  const handleStart = () => {
    if (selectedTherapist) {
      onSelect(selectedTherapist, userConcern);
    }
  };

  const selectedProfile = selectedTherapist 
    ? therapists.find(t => t.id === selectedTherapist)
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🏥 전문 치료사 선택
          </CardTitle>
          <CardDescription className="text-lg">
            10가지 전문 분야의 치료사가 실제 치료 세션처럼 도와드립니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 치료사 목록 */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">치료사 목록</h3>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {therapists.map((therapist) => (
                    <Card
                      key={therapist.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedTherapist === therapist.id
                          ? 'ring-2 ring-primary shadow-lg'
                          : 'hover:ring-1 hover:ring-muted-foreground/30'
                      }`}
                      onClick={() => setSelectedTherapist(therapist.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{therapist.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1">
                              {therapist.nameKo}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {therapist.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {therapist.specialty.slice(0, 3).map((spec, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* 선택된 치료사 상세 정보 */}
            <div>
              {selectedProfile ? (
                <div className="space-y-4">
                  <Card className={`bg-gradient-to-br ${selectedProfile.color}`}>
                    <CardContent className="p-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-5xl">{selectedProfile.icon}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{selectedProfile.nameKo}</h3>
                          <p className="text-sm opacity-90">{selectedProfile.name}</p>
                        </div>
                      </div>
                      <p className="text-sm opacity-90 mb-3">{selectedProfile.description}</p>
                      <div className="text-xs opacity-75">
                        <strong>대상:</strong> {selectedProfile.targetAudience}
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="font-semibold mb-2">전문 분야</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.specialty.map((spec, i) => (
                        <Badge key={i} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">치료 접근법</h4>
                    <ScrollArea className="h-32">
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {selectedProfile.therapeuticApproach.map((approach, i) => (
                          <li key={i}>• {approach}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">상담받고 싶은 내용 (선택사항)</h4>
                    <Textarea
                      placeholder="어떤 어려움이나 목표가 있으신가요? 구체적으로 작성해주시면 더 맞춤형 치료를 받으실 수 있습니다."
                      value={userConcern}
                      onChange={(e) => setUserConcern(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                  >
                    치료 세션 시작하기
                  </Button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-lg">왼쪽에서 치료사를 선택해주세요</p>
                    <p className="text-sm mt-2">
                      각 치료사는 전문 분야와 접근법이 다릅니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
