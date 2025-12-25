import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Baby, Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BirthDateSelectorProps {
  testTitle: string;
  testSubtitle: string;
  testDescription: string;
  onConfirm: (birthDate: Date, ageInMonths: number, ageGroup: string) => void;
  onBack: () => void;
}

const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  testTitle,
  testSubtitle,
  testDescription,
  onConfirm,
  onBack
}) => {
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [calculatedAge, setCalculatedAge] = useState<{ months: number; years: number; display: string } | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const calculateAge = (y: string, m: string, d: string) => {
    if (!y || !m || !d) return null;
    
    const birthDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const today = new Date();
    
    let ageMonths = (today.getFullYear() - birthDate.getFullYear()) * 12;
    ageMonths += today.getMonth() - birthDate.getMonth();
    
    if (today.getDate() < birthDate.getDate()) {
      ageMonths--;
    }
    
    const years = Math.floor(ageMonths / 12);
    const remainingMonths = ageMonths % 12;
    
    let display = "";
    if (years > 0) {
      display = `${years}세 ${remainingMonths}개월`;
    } else {
      display = `${remainingMonths}개월`;
    }
    
    return { months: ageMonths, years, display };
  };

  const handleDateChange = (type: 'year' | 'month' | 'day', value: string) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;
    
    if (type === 'year') {
      newYear = value;
      setYear(value);
    } else if (type === 'month') {
      newMonth = value;
      setMonth(value);
    } else {
      newDay = value;
      setDay(value);
    }
    
    const age = calculateAge(newYear, newMonth, newDay);
    setCalculatedAge(age);
  };

  const getAgeGroup = (ageMonths: number): string => {
    if (ageMonths < 12) return "영아";
    if (ageMonths < 24) return "12-23개월";
    if (ageMonths < 36) return "24-35개월";
    if (ageMonths < 48) return "36-47개월";
    if (ageMonths < 60) return "48-59개월";
    if (ageMonths < 72) return "60-71개월";
    if (ageMonths < 84) return "72-83개월";
    if (ageMonths < 144) return "아동";
    if (ageMonths < 228) return "청소년";
    return "성인";
  };

  const handleConfirm = () => {
    if (!year || !month || !day || !calculatedAge) return;
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const ageGroup = getAgeGroup(calculatedAge.months);
    
    onConfirm(birthDate, calculatedAge.months, ageGroup);
  };

  const isValid = year && month && day && calculatedAge && calculatedAge.months >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            ← 뒤로가기
          </Button>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {testTitle}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {testSubtitle}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-3">
                {testDescription}
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              {/* 생년월일 입력 안내 */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Calendar className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">생년월일을 입력해주세요</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  연령에 맞는 맞춤형 문항과 정확한 발달 수준 분석을 제공합니다
                </p>
              </div>

              {/* 날짜 선택 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">년도</Label>
                  <Select value={year} onValueChange={(v) => handleDateChange('year', v)}>
                    <SelectTrigger id="year" className="h-12">
                      <SelectValue placeholder="년도" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm font-medium">월</Label>
                  <Select value={month} onValueChange={(v) => handleDateChange('month', v)}>
                    <SelectTrigger id="month" className="h-12">
                      <SelectValue placeholder="월" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m}월
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day" className="text-sm font-medium">일</Label>
                  <Select value={day} onValueChange={(v) => handleDateChange('day', v)}>
                    <SelectTrigger id="day" className="h-12">
                      <SelectValue placeholder="일" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d}일
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 계산된 연령 표시 */}
              {calculatedAge && (
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-center gap-2">
                    <Baby className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold text-foreground">
                      현재 연령: {calculatedAge.display}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-sm px-4 py-1 bg-background">
                    {getAgeGroup(calculatedAge.months)} 대상 맞춤 검사 진행
                  </Badge>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{calculatedAge.months}개월 발달 수준에 맞춘 문항이 제공됩니다</span>
                  </div>
                </div>
              )}

              {/* 시작 버튼 */}
              <Button
                onClick={handleConfirm}
                disabled={!isValid}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isValid ? "검사 시작하기" : "생년월일을 입력해주세요"}
              </Button>

              {/* 안내 문구 */}
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>※ 입력하신 정보는 정확한 연령별 분석을 위해서만 사용됩니다</p>
                <p>※ 본 검사는 전문적 진단을 대체하지 않습니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BirthDateSelector;
