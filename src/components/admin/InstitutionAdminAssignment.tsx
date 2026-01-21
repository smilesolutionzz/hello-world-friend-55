import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, UserCheck, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface B2BInstitution {
  id: string;
  institution_name: string;
  institution_type: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
  email: string | null;
}

export function InstitutionAdminAssignment() {
  const [institutions, setInstitutions] = useState<B2BInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<B2BInstitution | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('b2b_partner_institutions')
        .select('id, institution_name, institution_type, email, phone, is_active, user_id, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('기관 목록 조회 실패:', error);
      toast({
        title: "조회 실패",
        description: "기관 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "이메일 입력 필요",
        description: "검색할 사용자의 이메일을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setSearchedUser(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .eq('email', searchEmail.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "사용자를 찾을 수 없습니다",
            description: "해당 이메일로 등록된 사용자가 없습니다.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setSearchedUser(data);
      toast({
        title: "사용자 검색 완료",
        description: `${data.display_name || data.email} 사용자를 찾았습니다.`
      });
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      toast({
        title: "검색 실패",
        description: "사용자 검색 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const assignAdmin = async () => {
    if (!selectedInstitution || !searchedUser) return;

    setAssigning(true);
    try {
      // assign_institution_admin 함수 호출
      const { data, error } = await supabase.rpc('assign_institution_admin', {
        target_user_id: searchedUser.user_id,
        institution_id: selectedInstitution.id
      });

      if (error) throw error;

      toast({
        title: "관리자 지정 완료",
        description: `${searchedUser.display_name || searchedUser.email}님이 ${selectedInstitution.institution_name}의 관리자로 지정되었습니다.`
      });

      setIsDialogOpen(false);
      setSelectedInstitution(null);
      setSearchEmail('');
      setSearchedUser(null);
      fetchInstitutions();
    } catch (error: any) {
      console.error('관리자 지정 실패:', error);
      toast({
        title: "지정 실패",
        description: error.message || "관리자 지정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setAssigning(false);
    }
  };

  const openAssignDialog = (institution: B2BInstitution) => {
    setSelectedInstitution(institution);
    setSearchEmail('');
    setSearchedUser(null);
    setIsDialogOpen(true);
  };

  const getInstitutionTypeName = (type: string) => {
    const types: Record<string, string> = {
      'development_center': '발달센터',
      'therapy_center': '치료센터',
      'hospital': '병원',
      'clinic': '의원',
      'school': '학교',
      'kindergarten': '유치원',
      'daycare': '어린이집'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>B2B 기관 관리자 지정</CardTitle>
          <CardDescription>B2B 파트너 기관에 관리자를 지정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          B2B 기관 관리자 지정
        </CardTitle>
        <CardDescription>B2B 파트너 기관에 institution_admin 역할을 부여합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>기관명</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>관리자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  등록된 B2B 기관이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell className="font-medium">{institution.institution_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getInstitutionTypeName(institution.institution_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {institution.email && <div>{institution.email}</div>}
                      {institution.phone && <div className="text-muted-foreground">{institution.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {institution.user_id ? (
                      <Badge variant="secondary" className="gap-1">
                        <UserCheck className="h-3 w-3" />
                        지정됨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        미지정
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={institution.is_active ? 'default' : 'secondary'}>
                      {institution.is_active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignDialog(institution)}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      관리자 지정
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>기관 관리자 지정</DialogTitle>
              <DialogDescription>
                {selectedInstitution?.institution_name}의 관리자를 지정합니다
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>사용자 이메일로 검색</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                  />
                  <Button onClick={searchUser} disabled={searching}>
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {searchedUser && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="font-medium">{searchedUser.display_name || '이름 없음'}</div>
                  <div className="text-sm text-muted-foreground">{searchedUser.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ID: {searchedUser.user_id}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button
                  onClick={assignAdmin}
                  disabled={!searchedUser || assigning}
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      지정 중...
                    </>
                  ) : (
                    '관리자 지정'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
