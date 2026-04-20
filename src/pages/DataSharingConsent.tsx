import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Shield, Building, Eye, XCircle, Plus, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useClientDataSharing, DATA_TYPE_OPTIONS } from '@/hooks/useClientDataSharing';

const DataSharingConsent = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const { consents, institutions, isLoading, grantConsent, revokeConsent } = useClientDataSharing();
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState('90');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrant = async () => {
    if (!selectedInstitution || selectedDataTypes.length === 0) return;
    setIsSubmitting(true);
    try {
      const expiresAt = expiryDays === 'unlimited' 
        ? undefined 
        : new Date(Date.now() + parseInt(expiryDays) * 86400000).toISOString();
      
      await grantConsent({
        institutionId: selectedInstitution,
        sharedDataTypes: selectedDataTypes,
        expiresAt,
        note: note || undefined,
      });
      setShowGrantDialog(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedInstitution('');
    setSelectedDataTypes([]);
    setExpiryDays('90');
    setNote('');
  };

  const activeConsents = consents.filter(c => c.consent_status === 'active');
  const revokedConsents = consents.filter(c => c.consent_status !== 'active');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">데이터 공유 관리</h1>
            <p className="text-sm text-muted-foreground">기관에 내 검사·분석 데이터를 공유하여 맞춤 치료에 활용하세요</p>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">안전한 데이터 공유</p>
              <p className="text-muted-foreground">
                공유된 데이터는 선택한 기관만 열람할 수 있으며, 언제든지 공유를 철회할 수 있습니다. 
                모든 접근 기록은 감사 로그로 보관됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* New Consent Button */}
        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              새 기관에 데이터 공유하기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>데이터 공유 동의</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-5">
                {/* Institution Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">공유 대상 기관</label>
                  <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger>
                      <SelectValue placeholder="기관을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{inst.institution_name}</span>
                            <Badge variant="secondary" className="text-[10px]">{inst.institution_type}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">공유할 데이터 범위</label>
                  <div className="space-y-2">
                    {DATA_TYPE_OPTIONS.map(opt => (
                      <label key={opt.key} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors">
                        <Checkbox
                          checked={selectedDataTypes.includes(opt.key)}
                          onCheckedChange={(checked) => {
                            setSelectedDataTypes(prev =>
                              checked ? [...prev, opt.key] : prev.filter(t => t !== opt.key)
                            );
                          }}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <label className="text-sm font-medium mb-2 block">공유 기간</label>
                  <Select value={expiryDays} onValueChange={setExpiryDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30일</SelectItem>
                      <SelectItem value="90">90일 (권장)</SelectItem>
                      <SelectItem value="180">6개월</SelectItem>
                      <SelectItem value="365">1년</SelectItem>
                      <SelectItem value="unlimited">무기한</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-medium mb-2 block">메모 (선택)</label>
                  <Textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="기관에 전달할 메모를 입력하세요"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleGrant}
                  disabled={!selectedInstitution || selectedDataTypes.length === 0 || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? '처리 중...' : '동의하고 공유하기'}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Active Consents */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            활성 공유 ({activeConsents.length})
          </h2>
          {activeConsents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">현재 공유 중인 기관이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeConsents.map(consent => (
                <Card key={consent.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          {consent.institution?.institution_name || '기관'}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {consent.institution?.institution_type}
                        </Badge>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-[10px]">공유 중</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {consent.shared_data_types.map(type => {
                        const opt = DATA_TYPE_OPTIONS.find(o => o.key === type);
                        return (
                          <Badge key={type} variant="outline" className="text-[10px]">
                            {opt?.label || type}
                          </Badge>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {consent.expires_at 
                          ? `${new Date(consent.expires_at).toLocaleDateString('ko-KR')}까지`
                          : '무기한'
                        }
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive text-xs"
                        onClick={() => revokeConsent(consent.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        공유 철회
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Revoked Consents */}
        {revokedConsents.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              철회/만료된 공유 ({revokedConsents.length})
            </h2>
            <div className="space-y-2">
              {revokedConsents.map(consent => (
                <Card key={consent.id} className="opacity-60">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{consent.institution?.institution_name || '기관'}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {consent.consent_status === 'revoked' ? '철회됨' : '만료됨'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSharingConsent;
