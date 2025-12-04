import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConcernStorageList } from '@/components/concern/ConcernStorageList';
import AssessmentHistory from '@/components/history/AssessmentHistory';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ClipboardCheck } from 'lucide-react';

const ConcernStorage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('concerns');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                {activeTab === 'concerns' ? (
                  <Heart className="w-6 h-6 text-white" />
                ) : (
                  <ClipboardCheck className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {activeTab === 'concerns' ? '고민 저장소' : '검사 저장소'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'concerns' 
                    ? '내가 입력했던 모든 고민과 AI 분석 결과를 확인하세요'
                    : '모든 검사 결과를 한눈에 확인하세요'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="concerns" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  고민 저장소
                </TabsTrigger>
                <TabsTrigger value="assessments" className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  검사 저장소
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="concerns">
                <ConcernStorageList />
              </TabsContent>
              
              <TabsContent value="assessments">
                <AssessmentHistory />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConcernStorage;
