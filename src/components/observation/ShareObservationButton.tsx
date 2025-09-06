import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Users, Globe, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ShareObservationButtonProps {
  observationId: string;
  observationTitle: string;
  observationContent: string;
}

export default function ShareObservationButton({ 
  observationId, 
  observationTitle, 
  observationContent 
}: ShareObservationButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleShareToCommunity = () => {
    // 커뮤니티 포스트 작성 폼을 열고 관찰일지 내용을 미리 채움
    const title = `[관찰일지 공유] ${observationTitle}`;
    const content = `관찰일지를 공유합니다.\n\n${observationContent}`;
    
    // URL 파라미터로 전달하여 커뮤니티 페이지로 이동
    const params = new URLSearchParams({
      type: 'observation',
      title,
      content,
      observationId
    });
    
    window.open(`/community?share=true&${params.toString()}`, '_blank');
    setIsOpen(false);
  };

  const handleSharePrivately = () => {
    // 개인적 공유 (링크 복사)
    const shareUrl = `${window.location.origin}/observation/${observationId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "링크가 복사되었습니다",
      description: "가족이나 전문가와 개인적으로 공유할 수 있습니다.",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          공유하기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>관찰일지 공유하기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={handleShareToCommunity}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">커뮤니티에 공유</h3>
                  <p className="text-sm text-muted-foreground">
                    다른 부모들과 경험을 나누고 조언을 받아보세요
                  </p>
                </div>
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={handleSharePrivately}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">개인적으로 공유</h3>
                  <p className="text-sm text-muted-foreground">
                    가족이나 전문가와 직접 공유할 링크를 복사합니다
                  </p>
                </div>
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}