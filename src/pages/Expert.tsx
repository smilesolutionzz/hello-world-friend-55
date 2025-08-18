import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, MapPin, Clock, Video, Users, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Expert {
  id: string;
  name: string;
  photo_url: string | null;
  credential: string;
  verified: boolean;
  categories: string[];
  region: string;
  online: boolean;
  price_per_50: number;
  availability_text: string;
  calendly_url: string;
  contact_form_url: string;
  intro: string;
  rating: number;
  visible: boolean;
}

const Expert = () => {
  const [searchParams] = useSearchParams();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [recommendedExperts, setRecommendedExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '전체');
  const [selectedRegion, setSelectedRegion] = useState<string>(searchParams.get('region') || '전국');
  const [selectedMode, setSelectedMode] = useState<string>(searchParams.get('mode') || 'online');

  const categories = ['전체', '언어', 'ADHD', '주의집중', '정서', '회복력', '노인인지', '기타'];
  const regions = ['전체', '전국', '수도권', '지방'];
  const modes = [
    { value: 'all', label: '전체' },
    { value: 'online', label: '온라인' },
    { value: 'offline', label: '오프라인' }
  ];

  useEffect(() => {
    fetchExperts();
  }, []);

  useEffect(() => {
    filterAndRecommendExperts();
  }, [experts, selectedCategory, selectedRegion, selectedMode]);

  const fetchExperts = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('visible', true);

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error('Error fetching experts:', error);
      toast({
        title: "오류",
        description: "전문가 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRecommendationScore = (expert: Expert): number => {
    let score = 0;
    
    // Category match (40점)
    if (selectedCategory !== '전체') {
      const categoryMatches = expert.categories.some(cat => 
        cat.includes(selectedCategory) || selectedCategory.includes(cat)
      );
      if (categoryMatches) score += 40;
    }
    
    // Mode match (30점)
    if (selectedMode === 'online' && expert.online) score += 30;
    if (selectedMode === 'offline' && !expert.online) score += 30;
    if (selectedMode === 'all') score += 15;
    
    // Region match (15점)
    if (selectedRegion === '전체' || expert.region === '전국' || expert.region === selectedRegion) {
      score += 15;
    }
    
    // Rating normalized (15점)
    score += (expert.rating / 5) * 15;
    
    return score;
  };

  const filterAndRecommendExperts = () => {
    let filtered = experts.filter(expert => {
      // Category filter
      if (selectedCategory !== '전체') {
        const categoryMatch = expert.categories.some(cat => 
          cat.includes(selectedCategory) || selectedCategory.includes(cat)
        );
        if (!categoryMatch) return false;
      }
      
      // Region filter
      if (selectedRegion !== '전체' && selectedRegion !== '전국') {
        if (expert.region !== selectedRegion && expert.region !== '전국') return false;
      }
      
      // Mode filter
      if (selectedMode === 'online' && !expert.online) return false;
      if (selectedMode === 'offline' && expert.online) return false;
      
      return true;
    });

    // Calculate scores and sort for recommendations
    const expertsWithScores = filtered.map(expert => ({
      ...expert,
      score: calculateRecommendationScore(expert)
    })).sort((a, b) => b.score - a.score);

    setRecommendedExperts(expertsWithScores.slice(0, 3));
    setFilteredExperts(filtered);
  };

  const handleConsultRequest = async (expertId: string, contactFormUrl: string) => {
    if (!agreedToTerms) {
      toast({
        title: "이용약관 동의 필요",
        description: "개인정보 처리 방침에 동의해주세요.",
        variant: "destructive"
      });
      return;
    }

    // Record consult request
    try {
      await supabase.from('consult_requests').insert({
        category: selectedCategory,
        region: selectedRegion,
        mode: selectedMode,
        matched_expert_ids: [expertId]
      });
      
      toast({
        title: "신청 접수 완료",
        description: "24시간 내 안내드립니다."
      });
    } catch (error) {
      console.error('Error creating consult request:', error);
    }

    // Open external form
    window.open(contactFormUrl, '_blank');
  };

  const handleBooking = (calendlyUrl: string) => {
    if (!agreedToTerms) {
      toast({
        title: "이용약관 동의 필요",
        description: "개인정보 처리 방침에 동의해주세요.",
        variant: "destructive"
      });
      return;
    }
    window.open(calendlyUrl, '_blank');
  };

  const ExpertCard = ({ expert, isRecommended = false }: { expert: Expert; isRecommended?: boolean }) => (
    <Card className={`h-full ${isRecommended ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={expert.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'}
              alt={expert.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            {expert.verified && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{expert.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{expert.credential}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{expert.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{expert.region}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {expert.categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{expert.intro}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{expert.online ? '온라인 상담' : '대면 상담'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{expert.availability_text}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">{expert.price_per_50.toLocaleString()}원 / 50분</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleBooking(expert.calendly_url)}
              className="flex-1 gap-2"
              disabled={!agreedToTerms}
            >
              <Calendar className="w-4 h-4" />
              바로 예약
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConsultRequest(expert.id, expert.contact_form_url)}
              className="flex-1 gap-2"
              disabled={!agreedToTerms}
            >
              <ExternalLink className="w-4 h-4" />
              상담 신청
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">전문가 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">전문가 상담 연결 (MVP)</h1>
        <p className="text-lg text-muted-foreground">검사 결과에 맞춘 추천 전문가</p>
      </div>

      {/* Filter Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">카테고리</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">지역</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">상담 방식</label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Experts Section */}
      {recommendedExperts.length > 0 && (
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">추천 전문가</h2>
            <p className="text-muted-foreground">검사 결과와 선호 조건을 반영해 전문가를 추천해 드려요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedExperts.map(expert => (
              <ExpertCard key={expert.id} expert={expert} isRecommended />
            ))}
          </div>
        </section>
      )}

      {/* All Experts Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6">모든 전문가 보기</h2>
        {filteredExperts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">조건에 맞는 전문가가 없습니다.</p>
              <p className="text-muted-foreground">필터 조건을 변경해보세요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map(expert => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        )}
      </section>

      {/* Legal Notice & Agreement */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <div className="space-y-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  개인정보 처리 방침에 동의합니다
                </label>
                <p className="text-xs text-muted-foreground">
                  상담 신청을 위해 개인정보 처리가 필요합니다.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>법적 고지:</strong> 본 상담은 참고용이며 의학적 진단을 대체하지 않습니다.
                정확한 진단이 필요한 경우 의료기관을 방문하시기 바랍니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expert;