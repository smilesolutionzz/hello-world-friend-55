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
import { Calendar, Plus, Download, Edit, Trash2 } from 'lucide-react';
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
    
    const monthlyContents = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const channel = channels[day % channels.length];
      const contentType = contentTypes[day % contentTypes.length];
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      monthlyContents.push({
        institution_id: user.id,
        week_number: Math.ceil(day / 7),
        date: date,
        channel: channel,
        topic: `${bulkFormData.company_name} ${contentType} 콘텐츠 ${day}일`,
        content_type: contentType,
        notes: `${month}월 ${day}일 자동 생성 콘텐츠`,
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-primary" />
          <CardTitle>콘텐츠 캘린더</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
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

        {/* Content Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">주차</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">날짜</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">채널</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">주제</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">타입</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">비고</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      콘텐츠가 없습니다. 새 콘텐츠를 추가해보세요.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm">{item.week_number}주차</td>
                      <td className="px-4 py-3 text-sm">{item.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getChannelStyle(item.channel)}`}>
                          {item.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.topic}</td>
                      <td className="px-4 py-3 text-sm">{item.content_type}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.notes || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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
      </CardContent>
    </Card>
  );
};

export default ContentCalendar;
