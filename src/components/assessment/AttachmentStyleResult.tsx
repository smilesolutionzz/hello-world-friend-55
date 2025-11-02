import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AttachmentStyleResultProps {
  result: {
    answers: Record<string, number>;
    anxietyScore: number;
    avoidanceScore: number;
    style: string;
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const AttachmentStyleResult: React.FC<AttachmentStyleResultProps> = ({ result, onRestart }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>애착 유형: {result.style}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>불안 점수: {result.anxietyScore}</p>
          <p>회피 점수: {result.avoidanceScore}</p>
          <p>총점: {result.total}</p>
          <p>평균: {result.average}</p>
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button onClick={onRestart}>다시 검사</Button>
        <Button variant="outline" onClick={() => navigate('/assessment')}>검사 목록</Button>
      </div>
    </div>
  );
};

export default AttachmentStyleResult;
