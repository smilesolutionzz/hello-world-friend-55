import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Bell,
  Phone,
  Mail,
  User,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface GuardianSettings {
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  alertOnCritical: boolean;
  alertOnHigh: boolean;
  alertOnMissedCheckIn: boolean;
  anonymizeMessages: boolean;
}

export const GuardianAlertSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [settings, setSettings] = useState<GuardianSettings>({
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    alertOnCritical: true,
    alertOnHigh: true,
    alertOnMissedCheckIn: false,
    anonymizeMessages: false,
  });

  const updateSetting = (key: keyof GuardianSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!settings.guardianPhone && !settings.guardianEmail) {
      toast({
        title: '입력 필요',
        description: '전화번호 또는 이메일 중 하나를 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // 로컬 스토리지에 저장 (실제 구현 시 DB 테이블 추가 필요)
      localStorage.setItem('guardian_settings', JSON.stringify(settings));

      toast({
        title: '설정 저장됨',
        description: '보호자 알림 설정이 저장되었습니다.',
      });
    } catch (error) {
      console.error('[GuardianAlertSettings] Save error:', error);
      toast({
        title: '저장 실패',
        description: '설정을 저장하는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAlert = async () => {
    if (!settings.guardianPhone && !settings.guardianEmail) {
      toast({
        title: '입력 필요',
        description: '테스트할 연락처를 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    setIsTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('guardian-alert', {
        body: {
          userId: user?.id || 'test',
          guardianPhone: settings.guardianPhone,
          guardianEmail: settings.guardianEmail,
          alertType: 'check_in_missed',
          crisisLevel: 'medium',
          message: '테스트 알림입니다.'
        }
      });

      if (error) throw error;

      toast({
        title: '테스트 알림 발송',
        description: '테스트 알림이 발송되었습니다. (실제 연동 시 수신됩니다)',
      });
    } catch (error) {
      console.error('[GuardianAlertSettings] Test error:', error);
      toast({
        title: '테스트 실패',
        description: '알림 테스트에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 설명 */}
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          위기 상황 발생 시 지정된 보호자에게 자동으로 알림을 발송합니다.
          개인정보 보호를 위해 상세 내용은 익명화할 수 있습니다.
        </AlertDescription>
      </Alert>

      {/* 보호자 정보 */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          보호자 정보
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guardianName">보호자 이름</Label>
            <Input
              id="guardianName"
              placeholder="홍길동"
              value={settings.guardianName}
              onChange={(e) => updateSetting('guardianName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="guardianPhone">
              <Phone className="w-4 h-4 inline mr-1" />
              보호자 전화번호
            </Label>
            <Input
              id="guardianPhone"
              type="tel"
              placeholder="010-1234-5678"
              value={settings.guardianPhone}
              onChange={(e) => updateSetting('guardianPhone', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              긴급 상황 시 SMS 알림이 발송됩니다
            </p>
          </div>

          <div>
            <Label htmlFor="guardianEmail">
              <Mail className="w-4 h-4 inline mr-1" />
              보호자 이메일
            </Label>
            <Input
              id="guardianEmail"
              type="email"
              placeholder="guardian@email.com"
              value={settings.guardianEmail}
              onChange={(e) => updateSetting('guardianEmail', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          알림 설정
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                <Badge className="bg-red-500">긴급</Badge>
                위기 상황 감지 시
              </p>
              <p className="text-sm text-muted-foreground">
                자살/자해 위험 신호 감지 시 즉시 알림
              </p>
            </div>
            <Switch
              checked={settings.alertOnCritical}
              onCheckedChange={(checked) => updateSetting('alertOnCritical', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                <Badge className="bg-orange-500">주의</Badge>
                위험 수준 높음 시
              </p>
              <p className="text-sm text-muted-foreground">
                우울/불안 등 위험 수준이 높을 때 알림
              </p>
            </div>
            <Switch
              checked={settings.alertOnHigh}
              onCheckedChange={(checked) => updateSetting('alertOnHigh', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">체크인 누락 시</p>
              <p className="text-sm text-muted-foreground">
                일정 기간 앱 사용이 없을 때 알림
              </p>
            </div>
            <Switch
              checked={settings.alertOnMissedCheckIn}
              onCheckedChange={(checked) => updateSetting('alertOnMissedCheckIn', checked)}
            />
          </div>
        </div>
      </Card>

      {/* 개인정보 보호 */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          개인정보 보호
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">메시지 내용 익명화</p>
            <p className="text-sm text-muted-foreground">
              보호자에게 발송되는 알림에서 구체적인 대화 내용을 제외합니다
            </p>
          </div>
          <Switch
            checked={settings.anonymizeMessages}
            onCheckedChange={(checked) => updateSetting('anonymizeMessages', checked)}
          />
        </div>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button onClick={saveSettings} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          )}
          설정 저장
        </Button>
        <Button variant="outline" onClick={testAlert} disabled={isTesting}>
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Bell className="w-4 h-4 mr-2" />
          )}
          테스트 발송
        </Button>
      </div>
    </div>
  );
};

export default GuardianAlertSettings;
