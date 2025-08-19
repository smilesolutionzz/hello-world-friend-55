import React, { useState } from 'react';
import { Gift, Home, Brain, Users, Building, Stethoscope, BookOpen, Settings, Sparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

const mainItems = [
  { title: '홈', url: '/', icon: Home },
  { title: '대시보드', url: '/dashboard', icon: Brain },
  { title: 'AI 상담', url: '/ai-counselor', icon: Stethoscope },
  { title: '평가하기', url: '/assessment', url2: '/premium-assessment', icon: BookOpen },
  { title: '메타버스', url: '/metaverse', icon: Sparkles },
  { title: '가족관리', url: '/family', icon: Users },
  { title: '기업서비스', url: '/corporate', icon: Building },
];

const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const { referrals, generateReferralCode } = useReferrals();
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const isActive = (path: string, path2?: string) => 
    currentPath === path || (path2 && currentPath === path2);
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'hover:bg-muted/50';

  const handleGenerateAndCopy = async () => {
    const code = await generateReferralCode();
    if (code) {
      const referralUrl = `${window.location.origin}?ref=${code}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      
      toast({
        title: "🎁 추천 링크 복사 완료!",
        description: "친구들에게 공유하여 10토큰을 받아보세요!",
      });
    }
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const totalEarned = referrals
    .filter(r => r.status === 'completed' && r.reward_given)
    .reduce((total, r) => total + r.reward_tokens, 0);

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">AIHPRO</h2>
                <p className="text-xs text-muted-foreground">AI하이라이트프로</p>
              </div>
            )}
          </div>
        </div>

        {/* Gift Referral Section */}
        <div className="p-3 border-b border-sidebar-border">
          <Dialog open={showGiftModal} onOpenChange={setShowGiftModal}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className={`w-full justify-start p-3 h-auto bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200/50 transition-all duration-200 ${
                  collapsed ? 'px-2' : ''
                }`}
              >
                <div className="relative">
                  <Gift className="w-5 h-5 text-pink-600" />
                  {totalEarned > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{completedReferrals}</span>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="ml-3 text-left">
                    <div className="font-medium text-pink-700">친구 초대</div>
                    <div className="text-xs text-pink-600">10토큰 적립</div>
                    {totalEarned > 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs bg-primary/10 text-primary">
                        {totalEarned}토큰 획득!
                      </Badge>
                    )}
                  </div>
                )}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-600" />
                  친구 초대하고 10토큰 받기
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                  <h4 className="font-medium mb-2 text-pink-700">🎁 선물 같은 혜택!</h4>
                  <ul className="text-sm text-pink-600 space-y-1">
                    <li>• 친구가 가입하면 10토큰 즉시 지급</li>
                    <li>• 가입한 친구에게도 5토큰 환영 선물</li>
                    <li>• 무제한으로 친구를 초대 가능</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={handleGenerateAndCopy}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        링크 복사 완료!
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        초대 링크 만들기
                      </>
                    )}
                  </Button>
                </div>

                {completedReferrals > 0 && (
                  <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">지금까지</div>
                    <div className="text-xl font-bold text-primary">{completedReferrals}명 초대</div>
                    <div className="text-sm text-primary font-medium">{totalEarned}토큰 획득!</div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls({ isActive: isActive(item.url, item.url2) })}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <SidebarMenuButton asChild>
            <NavLink 
              to="/settings" 
              className={getNavCls({ isActive: isActive('/settings') })}
            >
              <Settings className="mr-3 h-4 w-4" />
              {!collapsed && <span>설정</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;