import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Phone, 
  Calendar, 
  Clock,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  MessageCircle,
  Video,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionRecord {
  id: string;
  memberName: string;
  parentName: string;
  connectionType: 'standard' | 'urgent' | 'emergency';
  consultationType: 'video' | 'phone' | 'chat';
  status: 'pending' | 'connected' | 'completed' | 'cancelled';
  platformFee: number;
  expertEarning: number;
  createdAt: string;
  completedAt?: string;
}

interface ParentConnectionTrackerProps {
  adminId: string;
}

export default function ParentConnectionTracker({ adminId }: ParentConnectionTrackerProps) {
  const [connections, setConnections] = useState<ConnectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConnections: 0,
    completedConnections: 0,
    totalRevenue: 0,
    averageTime: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchConnections();
  }, [adminId]);

  const fetchConnections = async () => {
    try {
      // 실제 데이터 조회 (consultation_bookings + institution_members 조인)
      const { data: members } = await supabase
        .from('institution_members')
        .select('id, member_name, member_user_id, custom_fields')
        .eq('institution_admin_id', adminId);

      // 데모 데이터 생성
      const demoConnections: ConnectionRecord[] = [
        {
          id: '1',
          memberName: members?.[0]?.member_name || '김**',
          parentName: '김** 보호자',
          connectionType: 'urgent',
          consultationType: 'video',
          status: 'completed',
          platformFee: 15000,
          expertEarning: 85000,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString()
        },
        {
          id: '2',
          memberName: members?.[1]?.member_name || '이**',
          parentName: '이** 보호자',
          connectionType: 'standard',
          consultationType: 'phone',
          status: 'connected',
          platformFee: 10000,
          expertEarning: 50000,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          memberName: members?.[2]?.member_name || '박**',
          parentName: '박** 보호자',
          connectionType: 'emergency',
          consultationType: 'video',
          status: 'pending',
          platformFee: 20000,
          expertEarning: 100000,
          createdAt: new Date().toISOString()
        }
      ];

      setConnections(demoConnections);
      
      // 통계 계산
      const completed = demoConnections.filter(c => c.status === 'completed').length;
      const totalRevenue = demoConnections
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.platformFee, 0);

      setStats({
        totalConnections: demoConnections.length,
        completedConnections: completed,
        totalRevenue: totalRevenue,
        averageTime: 45, // 분
        conversionRate: Math.round((completed / demoConnections.length) * 100)
      });
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">완료</Badge>;
      case 'connected':
        return <Badge className="bg-blue-500">진행중</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">대기</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConnectionTypeBadge = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Badge variant="destructive">긴급</Badge>;
      case 'urgent':
        return <Badge className="bg-orange-500">빠른</Badge>;
      default:
        return <Badge variant="outline">일반</Badge>;
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalConnections}</p>
                <p className="text-xs text-muted-foreground">총 연결</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedConnections}</p>
                <p className="text-xs text-muted-foreground">완료된 상담</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">플랫폼 수수료</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageTime}분</p>
                <p className="text-xs text-muted-foreground">평균 상담시간</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">전환율</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 수익 분석 */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <DollarSign className="w-5 h-5" />
            이번 달 수익 분석
          </CardTitle>
          <CardDescription>학부모 → 전문가 연결 시 발생하는 플랫폼 수수료</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">일반 상담 (15%)</p>
              <p className="text-xl font-bold text-green-600">₩10,000</p>
              <p className="text-xs text-muted-foreground mt-1">1건 완료</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">긴급 상담 (+5,000원)</p>
              <p className="text-xl font-bold text-orange-600">₩15,000</p>
              <p className="text-xs text-muted-foreground mt-1">1건 완료</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">예상 수익 (대기중)</p>
              <p className="text-xl font-bold text-blue-600">₩20,000</p>
              <p className="text-xs text-muted-foreground mt-1">1건 진행중</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 연결 기록 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                학부모-전문가 연결 기록
              </CardTitle>
              <CardDescription>
                기관을 통해 연결된 상담 내역
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              전체 보기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학생</TableHead>
                <TableHead>보호자</TableHead>
                <TableHead>연결 유형</TableHead>
                <TableHead>상담 방식</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>수수료</TableHead>
                <TableHead>일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">{connection.memberName}</TableCell>
                  <TableCell>{connection.parentName}</TableCell>
                  <TableCell>{getConnectionTypeBadge(connection.connectionType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getConsultationIcon(connection.consultationType)}
                      <span className="text-sm capitalize">{connection.consultationType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(connection.status)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-medium",
                      connection.status === 'completed' ? "text-green-600" : "text-muted-foreground"
                    )}>
                      ₩{connection.platformFee.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(connection.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
