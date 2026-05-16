import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Lock, Bell, Shield, Trash2, Sparkles, Play } from "lucide-react";
import {
  isIntroDisabled,
  setIntroDisabled,
  getIntroVariant,
  setIntroVariant,
  resetIntroShown,
  getIntroMode,
  setIntroMode,
  type IntroVariant,
  type IntroMode,
} from "@/lib/introPreferences";
import DioramaIntro from "@/components/intro/DioramaIntro";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 알림 설정
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  // 인트로 애니메이션 환경설정
  const [introDisabled, setIntroDisabledState] = useState<boolean>(() => isIntroDisabled());
  const [introVariant, setIntroVariantState] = useState<IntroVariant>(() => getIntroVariant());
  const [introMode, setIntroModeState] = useState<IntroMode>(() => getIntroMode());
  const [introPreview, setIntroPreview] = useState<IntroVariant | null>(null);

  const handleIntroModeChange = (mode: IntroMode) => {
    setIntroMode(mode);
    setIntroModeState(mode);
    toast({
      title: mode === "random" ? "무작위 모드로 변경됨" : "고정 모드로 변경됨",
      description:
        mode === "random"
          ? "방문할 때마다 A/B 변형이 무작위로 바뀌어요."
          : `이제부터 변형 ${introVariant}로 고정되어 재생돼요.`,
    });
  };

  const handleIntroToggle = (checked: boolean) => {
    // checked = 켜기 → disabled false
    const disabled = !checked;
    setIntroDisabled(disabled);
    setIntroDisabledState(disabled);
    toast({
      title: disabled ? "인트로 애니메이션 끔" : "인트로 애니메이션 켬",
      description: disabled
        ? "이제 홈에 들어와도 인트로가 재생되지 않아요."
        : "다음 방문부터 다시 인트로가 재생돼요.",
    });
  };

  const handleIntroVariantChange = (v: IntroVariant) => {
    setIntroVariant(v);
    setIntroVariantState(v);
    toast({ title: `인트로 변형 ${v}로 변경됨`, description: "다음 재생부터 적용됩니다." });
  };

  const handleIntroReplay = (v?: IntroVariant) => {
    resetIntroShown();
    setIntroPreview(v ?? introVariant);
    // 컴포넌트가 unmount될 때까지 자동 닫힘 → 1회 재생 후 null 복귀
    setTimeout(() => setIntroPreview(null), 5200);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "성공",
        description: "비밀번호가 변경되었습니다.",
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error);
      toast({
        title: "오류",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 실제로는 계정 삭제 요청을 백엔드에 보내야 합니다
      // 여기서는 로그아웃만 수행합니다
      await supabase.auth.signOut();
      
      toast({
        title: "계정 삭제 요청",
        description: "계정 삭제가 요청되었습니다. 관리자가 확인 후 처리합니다.",
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      toast({
        title: "오류",
        description: "계정 삭제 요청에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>
          <Button 
            onClick={handlePasswordChange} 
            disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
          >
            비밀번호 변경
          </Button>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 설정
          </CardTitle>
          <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">중요한 정보를 이메일로 받습니다</p>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">푸시 알림</Label>
              <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 받습니다</p>
            </div>
            <Switch
              id="push-notifications"
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-notifications">마케팅 알림</Label>
              <p className="text-sm text-muted-foreground">프로모션 및 이벤트 정보를 받습니다</p>
            </div>
            <Switch
              id="marketing-notifications"
              checked={notifications.marketing}
              onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 인트로 애니메이션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            홈 인트로 애니메이션
          </CardTitle>
          <CardDescription>
            홈에 들어올 때 4초간 재생되는 디오라마 인트로를 켜고 끄거나, A/B 변형을 선택할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="intro-enabled">인트로 재생</Label>
              <p className="text-sm text-muted-foreground">
                {introDisabled ? "꺼짐 — 홈에서 인트로가 나타나지 않아요" : "켜짐 — 세션당 1회 재생"}
              </p>
            </div>
            <Switch
              id="intro-enabled"
              checked={!introDisabled}
              onCheckedChange={handleIntroToggle}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>A/B 변형 선택</Label>
            <p className="text-xs text-muted-foreground">
              현재 할당: <span className="font-semibold text-foreground">변형 {introVariant}</span>
              {" · "}어떤 버전이 전환에 더 좋은지 비교해 보세요.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleIntroVariantChange("A")}
                className={`text-left p-3 rounded-xl border transition-colors ${
                  introVariant === "A"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="font-semibold text-sm">변형 A</div>
                <div className="text-xs text-muted-foreground mt-0.5">디오라마 팝업</div>
              </button>
              <button
                type="button"
                onClick={() => handleIntroVariantChange("B")}
                className={`text-left p-3 rounded-xl border transition-colors ${
                  introVariant === "B"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="font-semibold text-sm">변형 B</div>
                <div className="text-xs text-muted-foreground mt-0.5">헤드라인 + 아크 라인업</div>
              </button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleIntroReplay("A")}
              disabled={!!introPreview}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" /> 변형 A 미리보기
            </Button>
            <Button
              variant="outline"
              onClick={() => handleIntroReplay("B")}
              disabled={!!introPreview}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" /> 변형 B 미리보기
            </Button>
          </div>
        </CardContent>
      </Card>

      {introPreview && <DioramaIntro force variantOverride={introPreview} />}


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            개인정보 및 보안
          </CardTitle>
          <CardDescription>계정 보안 및 개인정보 관리</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">2단계 인증</h4>
            <p className="text-sm text-muted-foreground">
              계정 보안을 강화하기 위해 2단계 인증을 활성화하세요
            </p>
            <Button variant="outline" disabled>
              곧 출시 예정
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">데이터 다운로드</h4>
            <p className="text-sm text-muted-foreground">
              내 개인 데이터를 다운로드받을 수 있습니다
            </p>
            <Button variant="outline" disabled>
              곧 출시 예정
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 계정 삭제 */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            계정 삭제
          </CardTitle>
          <CardDescription>계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            계정 삭제 요청
          </Button>
        </CardContent>
      </Card>

      {/* 계정 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 계정을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
