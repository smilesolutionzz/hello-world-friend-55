import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

interface ComingSoonWrapperProps {
  title: string;
  description: string;
  expectedDate?: string;
  additionalInfo?: string;
}

const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({ 
  title, 
  description, 
  expectedDate = "2025년 상반기",
  additionalInfo
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">{description}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
              🚧 개발 중
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">예상 출시일</p>
            <p className="text-blue-600">{expectedDate}</p>
          </div>

          {additionalInfo && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm">{additionalInfo}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전 페이지로
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonWrapper;