import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Plus, Download, Edit, Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContentItem {
  id: string;
  week_number: number;
  date: string;
  channel: string;
  topic: string;
  content_type: string;
  notes?: string;
  status: string;
}

const CHANNELS = [
  { value: '블로그', label: '블로그', color: 'bg-blue-100 text-blue-800' },
  { value: '스레드', label: '스레드', color: 'bg-red-100 text-red-800' },
  { value: '인스타그램', label: '인스타그램', color: 'bg-pink-100 text-pink-800' },
  { value: '카페', label: '카페', color: 'bg-green-100 text-green-800' },
  { value: '유튜브', label: '유튜브', color: 'bg-purple-100 text-purple-800' },
];

const ContentCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState('1');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    week_number: 1,
    date: '',
    channel: '',
    topic: '',
    content_type: '',
    notes: '',
  });

  const [bulkFormData, setBulkFormData] = useState({
    company_name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchContentItems();
  }, []);

  useEffect(() => {
    if (selectedChannel === 'all') {
      setFilteredItems(contentItems);
    } else {
      setFilteredItems(contentItems.filter(item => item.channel === selectedChannel));
    }
  }, [selectedChannel, contentItems]);

  const fetchContentItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('institution_content_calendar')
      .select('*')
      .eq('institution_id', user.id)
      .order('week_number', { ascending: true });

    if (error) {
      toast({
        title: '오류',
        description: '콘텐츠 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      return;
    }

    setContentItems(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dataToSave = {
      ...formData,
      institution_id: user.id,
      status: 'planned',
    };

    if (editingItem) {
      const { error } = await supabase
        .from('institution_content_calendar')
        .update(dataToSave)
        .eq('id', editingItem.id);

      if (error) {
        toast({
          title: '오류',
          description: '콘텐츠 수정에 실패했습니다.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '성공',
        description: '콘텐츠가 수정되었습니다.',
      });
    } else {
      const { error } = await supabase
        .from('institution_content_calendar')
        .insert([dataToSave]);

      if (error) {
        toast({
          title: '오류',
          description: '콘텐츠 추가에 실패했습니다.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '성공',
        description: '새 콘텐츠가 추가되었습니다.',
      });
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    resetForm();
    fetchContentItems();
  };

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'planned' : 'completed';
    
    const { error } = await supabase
      .from('institution_content_calendar')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '성공',
      description: newStatus === 'completed' ? '완료로 표시되었습니다.' : '미완료로 변경되었습니다.',
    });
    fetchContentItems();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('institution_content_calendar')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: '오류',
        description: '콘텐츠 삭제에 실패했습니다.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '성공',
      description: '콘텐츠가 삭제되었습니다.',
    });
    fetchContentItems();
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      week_number: item.week_number,
      date: item.date,
      channel: item.channel,
      topic: item.topic,
      content_type: item.content_type,
      notes: item.notes || '',
    });
    setIsDialogOpen(true);
  };

  const generateMonthlyContent = async () => {
    if (!bulkFormData.company_name) {
      toast({
        title: '입력 필요',
        description: '회사명을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const year = bulkFormData.year;
    const month = bulkFormData.month;
    const daysInMonth = new Date(year, month, 0).getDate();

    const channels = ['블로그', '스레드', '인스타그램', '카페', '유튜브'];
    const contentTypes = ['정보성', '교육', '홍보', '이벤트', '소식'];
    
    // 채널별 구체적이고 실행 가능한 주제 템플릿
    const topicTemplates: Record<string, string[]> = {
      '블로그': [
        '3-4세 언어발달 체크포인트 완벽 가이드',
        '주의력 향상을 위한 가정 내 실천 전략 7가지',
        '감각통합 놀이: 집에서 하는 점토 활동법',
        '초등 입학 전 사회성 발달 준비 리스트',
        '실제 사례로 보는 6개월 발달 변화 스토리',
        '부모가 꼭 알아야 할 ADHD 조기 신호 10가지',
        '학습 동기 높이는 보상 시스템 만들기'
      ],
      '스레드': [
        '아침 루틴 만들기: 3단계 실천법',
        '오늘의 칭찬 포인트 - 작은 성공 발견하기',
        '5분 놀이 - 집중력 키우는 컵 쌓기',
        '이번 주 센터 활동 하이라이트 사진',
        '자주 묻는 질문: 감정 조절이 어려워요',
        '전문가 조언 - 형제간 갈등 대처법',
        '부모님들의 공감 메시지 모음'
      ],
      '인스타그램': [
        '오늘의 센터 활동 현장 (미술치료 시간)',
        '수업 중 포착한 아이들의 집중 모습',
        '학부모 후기: "3개월 만에 이렇게 변했어요"',
        '신규 프로그램 소개 - 감각통합 놀이반',
        '이달의 이벤트 - 무료 발달 상담 신청',
        '집에서 따라하는 소근육 발달 놀이',
        '우리 센터 치료실 & 놀이방 투어'
      ],
      '카페': [
        '이번 달 가장 많이 받은 질문 TOP 5',
        '11월 센터 일정 및 휴무일 안내',
        '무료 배포 - 발달 단계별 체크리스트 PDF',
        '사례 상담: 4세 언어 지연 고민 해결법',
        '참가 후기 - 부모 교육 워크샵 현장',
        '추천 교구 - 집중력 향상 보드게임 3선',
        '우리 센터만의 특별 프로그램 소개'
      ],
      '유튜브': [
        '센터 일과 공개 - 오전 수업 밀착 영상',
        '전문가 강의: 감정 조절 3단계 훈련법',
        '변화의 순간 - 6개월 전후 비교 인터뷰',
        '따라하기 쉬운 주의력 놀이 10분 튜토리얼',
        '시설 투어 - 각 치료실 상세 소개',
        '한 주간의 하이라이트 모음 영상',
        'Q&A 라이브 - 부모님 궁금증 실시간 답변'
      ]
    };
    
    const monthlyContents = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const channel = channels[day % channels.length];
      const contentType = contentTypes[day % contentTypes.length];
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // 채널별 주제 템플릿에서 순환 선택
      const channelTopics = topicTemplates[channel] || [];
      const topicTemplate = channelTopics[day % channelTopics.length];
      
      monthlyContents.push({
        institution_id: user.id,
        week_number: Math.ceil(day / 7),
        date: date,
        channel: channel,
        topic: `[${bulkFormData.company_name}] ${topicTemplate}`,
        content_type: contentType,
        notes: `${month}월 ${day}일 - ${channel} 콘텐츠 가이드:\n• 회사 브랜드 정체성 반영\n• 타겟 고객층 고려\n• 호출-투-액션(CTA) 포함`,
        status: 'planned',
      });
    }

    const { error } = await supabase
      .from('institution_content_calendar')
      .insert(monthlyContents);

    if (error) {
      toast({
        title: '오류',
        description: '1달치 콘텐츠 생성에 실패했습니다.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '성공',
      description: `${month}월 ${daysInMonth}일치 콘텐츠가 생성되었습니다.`,
    });

    setIsDialogOpen(false);
    fetchContentItems();
  };

  const resetForm = () => {
    setFormData({
      week_number: 1,
      date: '',
      channel: '',
      topic: '',
      content_type: '',
      notes: '',
    });
  };

  const handleExport = () => {
    const csv = [
      ['주차', '날짜', '채널', '주제', '타입', '비고'].join(','),
      ...filteredItems.map(item =>
        [item.week_number, item.date, item.channel, item.topic, item.content_type, item.notes || ''].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `콘텐츠캘린더_${selectedMonth}월.csv`;
    link.click();
  };

  const getChannelStyle = (channel: string) => {
    const channelData = CHANNELS.find(c => c.value === channel);
    return channelData?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-primary" />
          <CardTitle className="text-white">콘텐츠 캘린더</CardTitle>
        </div>
        <p className="text-sm text-slate-300">
          마케팅 콘텐츠를 계획하고 관리해보세요
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingItem(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  1달치 자동생성
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>1달치 콘텐츠 자동 생성</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>회사명 *</Label>
                    <Input
                      value={bulkFormData.company_name}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, company_name: e.target.value })}
                      placeholder="예: AIHumanPro"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>년도</Label>
                      <Select
                        value={String(bulkFormData.year)}
                        onValueChange={(value) => setBulkFormData({ ...bulkFormData, year: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026].map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}년
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>월</Label>
                      <Select
                        value={String(bulkFormData.month)}
                        onValueChange={(value) => setBulkFormData({ ...bulkFormData, month: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={String(month)}>
                              {month}월
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={generateMonthlyContent}>
                      생성하기
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>

        {/* Channel Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedChannel === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedChannel('all')}
          >
            전체
          </Button>
          {CHANNELS.map(channel => (
            <Button
              key={channel.value}
              variant={selectedChannel === channel.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChannel(channel.value)}
              className={selectedChannel === channel.value ? '' : channel.color}
            >
              {channel.label}
            </Button>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-100">완료</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-100">주차</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-100">날짜</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-100">채널</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-100">주제</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-100">타입</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-100">비고</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-100">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      콘텐츠가 없습니다. 새 콘텐츠를 추가해보세요.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className={`hover:bg-slate-700/50 transition-colors ${item.status === 'completed' ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleComplete(item.id, item.status)}
                            className={`h-8 w-8 p-0 ${item.status === 'completed' ? 'text-green-400 hover:text-green-300' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <Check className={`w-5 h-5 ${item.status === 'completed' ? 'stroke-[3]' : ''}`} />
                          </Button>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm text-slate-200 ${item.status === 'completed' ? 'line-through decoration-2' : ''}`}>{item.week_number}주차</td>
                      <td className={`px-4 py-3 text-sm text-slate-200 ${item.status === 'completed' ? 'line-through decoration-2' : ''}`}>{item.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getChannelStyle(item.channel)}`}>
                          {item.channel}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm text-white ${item.status === 'completed' ? 'line-through decoration-2' : ''}`}>{item.topic}</td>
                      <td className={`px-4 py-3 text-sm text-slate-200 ${item.status === 'completed' ? 'line-through decoration-2' : ''}`}>{item.content_type}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-slate-300 hover:text-red-400 hover:bg-slate-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">콘텐츠가 없습니다.</p>
              <p className="text-sm text-slate-500 mt-1">새 콘텐츠를 추가해보세요.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`bg-slate-800 border border-slate-700 rounded-lg p-4 ${item.status === 'completed' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComplete(item.id, item.status)}
                      className={`h-10 w-10 p-0 flex-shrink-0 ${item.status === 'completed' ? 'text-green-400' : 'text-slate-400'}`}
                    >
                      <Check className={`w-6 h-6 ${item.status === 'completed' ? 'stroke-[3]' : ''}`} />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getChannelStyle(item.channel)}`}>
                          {item.channel}
                        </span>
                        <span className={`text-xs text-slate-400 ${item.status === 'completed' ? 'line-through decoration-2' : ''}`}>{item.week_number}주차</span>
                      </div>
                      <h3 className={`text-base font-medium text-white mb-1 ${item.status === 'completed' ? 'line-through decoration-2' : ''}`}>
                        {item.topic}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className={item.status === 'completed' ? 'line-through decoration-2' : ''}>{item.date}</span>
                        <span>•</span>
                        <span className={item.status === 'completed' ? 'line-through decoration-2' : ''}>{item.content_type}</span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-400 h-10 w-10 p-0 flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCalendar;
