import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ShareConcernButtonProps {
  concernTitle: string;
  concernContent: string;
}

export default function ShareConcernButton({ 
  concernTitle, 
  concernContent 
}: ShareConcernButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleShareToCommunity = () => {
    // 커뮤니티 포스트 작성 폼을 열고 고민 내용을 미리 채움
    const title = concernTitle;
    const content = concernContent;
    
    // URL 파라미터로 전달하여 커뮤니티 페이지로 이동
    const params = new URLSearchParams({
      type: 'concern',
      title,
      content
    });
    
    window.open(`/community?share=true&${params.toString()}`, '_blank');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          커뮤니티에서 상담받기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>고민을 커뮤니티에 공유하기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={handleShareToCommunity}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">커뮤니티에 고민 공유</h3>
                  <p className="text-sm text-muted-foreground">
                    다른 부모들과 전문가들로부터 조언과 격려를 받아보세요
                  </p>
                </div>
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            💡 <strong>팁:</strong> 익명으로 게시할 수 있으며, 전문가들이 직접 답변을 달아드립니다.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}