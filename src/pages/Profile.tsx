import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User, Crown, FileText, ChevronRight, LogOut, Settings,
  CreditCard, HelpCircle, Shield, Bell, Pencil, Check, X,
  Brain, MessageSquare, ClipboardList, Infinity, Lock, UserPlus, Sparkles, CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  account_type: string | null;
  subscription_tier: string | null;
}

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { reportCredits, isSubscriber, loading: accessLoading } = useAccessControl();
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: null,
    email: null,
    phone: null,
    birth_date: null,
    account_type: null,
    subscription_tier: null,
  });
  const [tempName, setTempName] = useState("");
  const [activityCounts, setActivityCounts] = useState({
    reports: 0,
    concerns: 0,
    assessments: 0,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        fetchProfile();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    checkAuthAndFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch profile, reports, concerns, assessments in parallel
      const [profileRes, reportsRes, concernsRes, assessmentsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name, email, phone, birth_date, account_type, subscription_tier')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('assessment_enhanced_analysis')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('concern_storage')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('assessments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      if (profileRes.data) {
        setProfileData(profileRes.data);
        setTempName(profileRes.data.display_name || "");
      }
      setActivityCounts({
        reports: reportsRes.count || 0,
        concerns: concernsRes.count || 0,
        assessments: assessmentsRes.count || 0,
      });
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: tempName })
        .eq('user_id', user.id);

      if (error) throw error;
      setProfileData(prev => ({ ...prev, display_name: tempName }));
      setEditingName(false);
      toast({ title: "저장 완료", description: "이름이 변경되었습니다." });
    } catch {
      toast({ title: "오류", description: "저장에 실패했습니다.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: "로그아웃", description: "로그아웃되었습니다." });
  };

  const getInitials = (name: string | null) => name ? name.charAt(0).toUpperCase() : 'U';

  if (loading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const menuSections = [
    {
      title: "내 결과 다시보기",
      items: [
        {
          icon: FileText,
          label: "생성한 리포트",
          desc: activityCounts.reports > 0 ? `${activityCounts.reports}건의 리포트` : "아직 생성한 리포트가 없어요",
          path: "/assessment-history",
          badge: activityCounts.reports > 0 ? activityCounts.reports : null,
        },
        {
          icon: MessageSquare,
          label: "고민 저장소",
          desc: activityCounts.concerns > 0 ? `${activityCounts.concerns}건 저장됨` : "기록한 고민이 없어요",
          path: "/concern-storage",
          badge: activityCounts.concerns > 0 ? activityCounts.concerns : null,
        },
        {
          icon: ClipboardList,
          label: "검사 결과",
          desc: activityCounts.assessments > 0 ? `${activityCounts.assessments}건의 검사 이력` : "아직 검사를 하지 않았어요",
          path: "/assessment-history",
          badge: activityCounts.assessments > 0 ? activityCounts.assessments : null,
        },
      ]
    },
    {
      title: "이용권·구독",
      items: [
        {
          icon: CreditCard,
          label: isSubscriber ? "구독 관리" : "이용권 구매",
          desc: isSubscriber ? "프리미엄 이용중" : "검사 이용권 충전",
          path: "/token-subscription",
        },
      ]
    },
    {
      title: "설정",
      items: [
        { icon: Bell, label: "알림 설정", desc: "푸시 알림 관리", path: "/settings" },
        { icon: Shield, label: "개인정보 관리", desc: "비밀번호·보안 설정", path: "/settings" },
        { icon: HelpCircle, label: "고객센터", desc: "문의·FAQ", path: "/settings" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-primary/8 to-background px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {getInitials(profileData.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="h-9 text-base font-semibold"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={saving} className="p-1.5 rounded-full bg-primary text-primary-foreground">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditingName(false); setTempName(profileData.display_name || ""); }} className="p-1.5 rounded-full bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground truncate">
                  {profileData.display_name || '이름을 설정하세요'}
                </h2>
                <button onClick={() => setEditingName(true)} className="p-1 text-muted-foreground hover:text-foreground">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {profileData.email || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Status Card */}
      <div className="px-5 -mt-1">
        <div
          onClick={() => navigate('/token-subscription')}
          className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
            isSubscriber
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800/40'
              : 'bg-muted/50 border border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSubscriber
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : 'bg-muted-foreground/10'
            }`}>
              <Crown className={`w-5 h-5 ${isSubscriber ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className={`text-sm font-bold ${isSubscriber ? 'text-amber-800 dark:text-amber-300' : 'text-foreground'}`}>
                {isSubscriber ? '프리미엄 구독중' : '무료 회원'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSubscriber ? '무제한 검사 이용 가능' : '구독하면 모든 검사를 무제한으로'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Quick Stats - 3 columns */}
      <div className="px-5 mt-4 grid grid-cols-3 gap-2.5">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {isSubscriber ? (
              <Infinity className="w-5 h-5 text-primary" />
            ) : (
              <Brain className="w-5 h-5 text-primary" />
            )}
          </div>
          <p className="text-lg font-bold text-foreground">
            {isSubscriber ? '무제한' : `${reportCredits}건`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">이용 가능</p>
        </div>
        <div
          onClick={() => navigate('/assessment-history')}
          className="bg-card border border-border rounded-2xl p-3 text-center cursor-pointer hover:border-primary/30 transition-colors"
        >
          <ClipboardList className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">{activityCounts.assessments}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">검사 완료</p>
        </div>
        <div
          onClick={() => navigate('/concern-storage')}
          className="bg-card border border-border rounded-2xl p-3 text-center cursor-pointer hover:border-primary/30 transition-colors"
        >
          <MessageSquare className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">{activityCounts.concerns}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">고민 기록</p>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-5 mt-6 space-y-5">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {'badge' in item && item.badge && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 mt-6 mb-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Profile;
