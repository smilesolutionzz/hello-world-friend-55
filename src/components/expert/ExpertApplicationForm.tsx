import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, FileText, Award, User, Building, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface WorkExperience {
  organization: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const ExpertApplicationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // 기본 정보
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    address: '',
    region: '',
    subRegion: '',
    
    // 전문 분야
    specializations: [] as string[],
    consultationMethods: [] as string[],
    targetAgeGroups: [] as string[],
    
    // 자격증 및 경력
    licenseNumber: '',
    certifications: [] as string[],
    educationBackground: [] as string[],
    workExperience: [] as WorkExperience[],
    
    // 상담 정보
    yearsExperience: 0,
    hourlyRate: 0,
    bio: '',
    
    // 신청 관련
    applicationReason: '',
    termsAgreed: false,
    privacyAgreed: false,
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newEducation, setNewEducation] = useState('');

  const specializationOptions = [
    '아동발달', '언어치료', '심리상담', '행동치료', '학습지도', 
    '감각통합', '놀이치료', '인지치료', '사회성훈련', '부모교육',
    '미술(심리)치료'
  ];

  const consultationMethodOptions = [
    '대면상담', '화상상담', '전화상담', '방문상담', '센터상담'
  ];

  const ageGroupOptions = [
    '영유아(0-3세)', '유아(4-6세)', '초등(7-12세)', '청소년(13-18세)', '성인(19세 이상)'
  ];

  const regionOptions = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
    '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
  ];

  const subRegionOptions: { [key: string]: string[] } = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '부산광역시': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '인천광역시': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
    '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
    '세종특별자치시': ['세종시'],
    '경기도': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '강원도': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '충청북도': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '진천군', '청주시', '충주시', '증평군'],
    '충청남도': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    '전라북도': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    '전라남도': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '경상북도': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    '경상남도': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '제주특별자치도': ['서귀포시', '제주시']
  };

  const addToArray = (field: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()]
      }));
      setter('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        organization: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAgreed || !formData.privacyAgreed) {
      toast.error('이용약관과 개인정보처리방침에 동의해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { error } = await supabase
        .from('expert_applications')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          birth_date: formData.birthDate || null,
          gender: formData.gender || null,
          address: formData.address || null,
          region: formData.region || null,
          sub_region: formData.subRegion || null,
          specializations: formData.specializations,
          consultation_methods: formData.consultationMethods,
          target_age_groups: formData.targetAgeGroups,
          license_number: formData.licenseNumber || null,
          certifications: formData.certifications,
          education_background: formData.educationBackground,
          work_experience: formData.workExperience as any,
          years_experience: formData.yearsExperience,
          hourly_rate: formData.hourlyRate || null,
          bio: formData.bio || null,
          application_reason: formData.applicationReason || null,
          terms_agreed: formData.termsAgreed,
          privacy_agreed: formData.privacyAgreed,
        });

      if (error) {
        console.error('Application submission error:', error);
        toast.error('신청서 제출에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      toast.success('전문가 신청이 완료되었습니다. 검토 후 연락드리겠습니다.');
      navigate('/expert-hiring');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            전문가 신청서
          </CardTitle>
          <p className="text-muted-foreground">
            전문가로 활동하기 위한 신청서를 작성해주세요. 검토 후 연락드리겠습니다.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">이름 *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="전체 이름을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="전화번호를 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="이메일 주소를 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">생년월일</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">성별</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="성별 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">활동 지역 *</Label>
                    <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value, subRegion: '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="시/도 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {regionOptions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subRegion">세부 지역</Label>
                    <Select 
                      value={formData.subRegion} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subRegion: value }))}
                      disabled={!formData.region}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="시/군/구 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.region && subRegionOptions[formData.region]?.map(subRegion => (
                          <SelectItem key={subRegion} value={subRegion}>{subRegion}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">상세 주소</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="상세 주소를 입력하세요"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 전문 분야 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  전문 분야
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>전문 분야 *</Label>
                  <div className="flex gap-2 mb-2">
                    <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="전문 분야 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializationOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={() => addToArray('specializations', newSpecialization, setNewSpecialization)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {spec}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeFromArray('specializations', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>상담 방법</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {consultationMethodOptions.map(method => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={method}
                          checked={formData.consultationMethods.includes(method)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                consultationMethods: [...prev.consultationMethods, method]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                consultationMethods: prev.consultationMethods.filter(m => m !== method)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={method} className="text-sm">{method}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>대상 연령</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ageGroupOptions.map(age => (
                      <div key={age} className="flex items-center space-x-2">
                        <Checkbox
                          id={age}
                          checked={formData.targetAgeGroups.includes(age)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                targetAgeGroups: [...prev.targetAgeGroups, age]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                targetAgeGroups: prev.targetAgeGroups.filter(a => a !== age)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={age} className="text-sm">{age}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 자격증 및 경력 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  자격증 및 경력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">면허번호</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="면허번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">경력 년수 *</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                      placeholder="경력 년수"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>자격증</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="자격증명을 입력하세요"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={() => addToArray('certifications', newCertification, setNewCertification)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {cert}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeFromArray('certifications', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>학력</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newEducation}
                      onChange={(e) => setNewEducation(e.target.value)}
                      placeholder="학력을 입력하세요 (예: 서울대학교 심리학과 학사)"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={() => addToArray('educationBackground', newEducation, setNewEducation)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.educationBackground.map((edu, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {edu}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeFromArray('educationBackground', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>경력 사항</Label>
                    <Button type="button" size="sm" onClick={addWorkExperience}>
                      <Plus className="h-4 w-4 mr-1" />
                      경력 추가
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.workExperience.map((exp, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">경력 {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWorkExperience(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="기관/회사명"
                            value={exp.organization}
                            onChange={(e) => updateWorkExperience(index, 'organization', e.target.value)}
                          />
                          <Input
                            placeholder="직책/포지션"
                            value={exp.position}
                            onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                          />
                          <Input
                            type="date"
                            placeholder="시작일"
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                          />
                          <Input
                            type="date"
                            placeholder="종료일"
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                          />
                        </div>
                        <Textarea
                          placeholder="업무 내용 및 성과"
                          value={exp.description}
                          onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                          className="mt-3"
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상담 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  상담 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hourlyRate">시간당 상담료 (원)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                    placeholder="희망하는 시간당 상담료를 입력하세요"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">자기소개 및 상담 철학</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="자신의 전문성, 상담 철학, 접근 방법 등을 소개해주세요"
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="applicationReason">지원 동기</Label>
                  <Textarea
                    id="applicationReason"
                    value={formData.applicationReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationReason: e.target.value }))}
                    placeholder="전문가로 지원하는 이유와 목표를 작성해주세요"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 약관 동의 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAgreed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAgreed: checked as boolean }))}
                    />
                    <Label htmlFor="terms">이용약관에 동의합니다 *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacyAgreed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privacyAgreed: checked as boolean }))}
                    />
                    <Label htmlFor="privacy">개인정보처리방침에 동의합니다 *</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/expert-hiring')}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? '제출 중...' : '신청서 제출'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};