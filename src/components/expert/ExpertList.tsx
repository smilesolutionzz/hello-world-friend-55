import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Star, MessageCircle, Clock, Award, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getExpertImage } from './ExpertImages';

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  specializations: string[];
  years_experience: number;
  bio: string;
  profile_image_url: string | null;
  hourly_rate: number;
  average_rating: number;
  total_sessions: number;
  languages: string[];
  consultation_methods: string[];
  is_available: boolean;
  is_verified: boolean;
  kakao_link?: string;
  is_featured?: boolean;
  featured_order?: number;
  is_director?: boolean;
}

interface ExpertListProps {
  specialization?: string;
  consultationType?: string;
}

const SPECIALTY_FILTERS = [
  '전체', '심리상담', '언어치료', '발달재활', 'ABA치료', '미술치료', '특수체육', '감각통합'
];

export const ExpertList: React.FC<ExpertListProps> = ({ 
  specialization, 
  consultationType 
}) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('전체');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperts();
  }, [specialization, consultationType]);

  const fetchExperts = async () => {
    try {
      let query = supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true);

      if (specialization) {
        query = query.contains('specializations', [specialization]);
      }
      if (consultationType) {
        query = query.contains('consultation_methods', [consultationType]);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const sortedExperts = (data || []).sort((a, b) => {
        const hasImageA = a.profile_image_url && !a.profile_image_url.includes('placeholder');
        const hasImageB = b.profile_image_url && !b.profile_image_url.includes('placeholder');
        if (hasImageA && !hasImageB) return -1;
        if (!hasImageA && hasImageB) return 1;
        const orderA = a.featured_order || 999;
        const orderB = b.featured_order || 999;
        return orderA - orderB;
      });
      
      setExperts(sortedExperts);
    } catch (error) {
      console.error('전문가 목록 조회 실패:', error);
      toast({
        title: "오류",
        description: "전문가 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = searchQuery === '' || 
      expert.full_name.includes(searchQuery) ||
      expert.specializations.some(s => s.includes(searchQuery));
    
    const matchesFilter = activeFilter === '전체' || 
      expert.specializations.some(s => s.includes(activeFilter));
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              전문가
            </h1>
            <p className="text-sm text-muted-foreground">
              검증된 {experts.length}명의 전문가
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="이름 또는 전문분야 검색" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SPECIALTY_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        전체 전문가 ({filteredExperts.length}명)
      </p>

      {/* Expert Grid */}
      {filteredExperts.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">조건에 맞는 전문가가 없습니다</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperts.map((expert) => (
            <ExpertCard 
              key={expert.id} 
              expert={expert} 
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Expert Card ─── */
function ExpertCard({ expert, navigate }: { expert: Expert; navigate: ReturnType<typeof useNavigate> }) {
  const isFeatured = expert.is_featured;

  return (
    <Card className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      isFeatured 
        ? 'border-primary/30 bg-gradient-to-b from-primary/[0.04] to-background' 
        : 'border-border/60 bg-card'
    }`}>
      <div className="p-5">
        {/* Top row: avatar + info */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <Avatar className={`w-14 h-14 border-2 ${
              isFeatured ? 'border-primary/40' : 'border-border'
            }`}>
              <AvatarImage 
                src={getExpertImage(expert.full_name) || expert.profile_image_url || ''} 
                className="object-cover" 
              />
              <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                {expert.full_name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {isFeatured && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm">
                TOP
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-foreground truncate">{expert.full_name}</h3>
              {expert.is_director && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-[10px] px-1.5 py-0">
                  기관장
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {expert.average_rating.toFixed(1)}
              </span>
              <span>·</span>
              <span>{expert.years_experience}년</span>
              <span>·</span>
              <span className="text-emerald-600 font-medium">온라인</span>
            </div>
          </div>
        </div>

        {/* Specialization tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {expert.specializations.slice(0, 3).map((spec, idx) => (
            <span 
              key={idx}
              className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-md bg-muted text-muted-foreground"
            >
              {spec}
            </span>
          ))}
          {expert.specializations.length > 3 && (
            <span className="inline-block px-2 py-0.5 text-[11px] text-muted-foreground">
              +{expert.specializations.length - 3}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border/50">
          <ExpertPriceTag size="md" />
          <Button
            size="sm"
            className="rounded-xl px-4 h-9 text-sm font-semibold shadow-sm"
            onClick={() => {
              if (expert.kakao_link) {
                window.open(expert.kakao_link, '_blank');
              } else {
                navigate(`/experts/${expert.id}`);
              }
            }}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            상담
          </Button>
        </div>
      </div>
    </Card>
  );
}
