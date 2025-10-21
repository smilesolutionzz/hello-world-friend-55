import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OrganizationSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast({
        title: '입력 오류',
        description: '모든 필드를 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          type: formData.type,
          admin_user_id: user.id
        });

      if (error) throw error;

      toast({
        title: '기관 등록 완료',
        description: '기관이 성공적으로 등록되었습니다.'
      });

      navigate('/organization/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: '오류',
        description: '기관 등록에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          홈으로
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Building className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">기관 등록</CardTitle>
            <p className="text-muted-foreground">
              소속 기관 정보를 등록하고 구성원들의 검사 결과를 관리하세요
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">기관명 *</Label>
                <Input
                  id="name"
                  placeholder="예: 삼성웰니스의원"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">기관 유형 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="기관 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">병원</SelectItem>
                    <SelectItem value="clinic">클리닉</SelectItem>
                    <SelectItem value="school">학교</SelectItem>
                    <SelectItem value="company">회사</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? '등록 중...' : '기관 등록하기'}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                <p className="font-semibold">📋 등록 후 가능한 기능</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>구성원 ID 등록 및 관리</li>
                  <li>검사 결과 통합 대시보드</li>
                  <li>월별/분기별 통계 분석</li>
                  <li>취약점 분포 차트</li>
                  <li>맞춤형 보고서 다운로드</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationSetup;
