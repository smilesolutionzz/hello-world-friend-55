import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface JoseonNameFormProps {
  onComplete: (result: any) => void;
}

const JoseonNameForm: React.FC<JoseonNameFormProps> = ({ onComplete }) => {
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthMonth || !birthDay || !gender) {
      alert('모든 정보를 입력해주세요!');
      return;
    }

    const monthNames = ['병', '욱', '창', '계', '맹', '경', '방', '돌', '막', '감', '산', '쌍'];
    const dayNames = ['창', '순', '건', '겸', '총', '혁', '석', '국', '자', '란', '공', '남', '우', '무', '춘', '봉', '홍', '금', '신', '심', '섭', '나', '복', '미', '산', '설', '심', '복', '오', '한', '혜'];
    
    const monthIndex = parseInt(birthMonth) - 1;
    const dayIndex = parseInt(birthDay) - 1;
    
    const firstName = monthNames[monthIndex % monthNames.length];
    const secondName = dayNames[dayIndex % dayNames.length];
    
    const genderPrefix = gender === 'male' ? '김' : '이';
    const joseonName = `${genderPrefix}${firstName}${secondName}`;
    
    const meanings = [
      '충직하고 용맹한 성품', '지혜롭고 온화한 마음', '정의로운 성격', 
      '예술적 재능', '학문에 뛰어난 능력', '리더십이 뛰어남',
      '인덕이 높음', '무예에 뛰어남', '시와 글솜씨가 훌륭함'
    ];
    
    const statusOptions = ['양반', '중인', '상민'];
    const jobOptions = ['학자', '무관', '의원', '상인', '농부', '수공업자', '예술가'];
    
    const randomMeaning = meanings[Math.floor(Math.random() * meanings.length)];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const randomJob = jobOptions[Math.floor(Math.random() * jobOptions.length)];
    
    const result = {
      joseonName,
      meaning: randomMeaning,
      status: randomStatus,
      job: randomJob,
      birthMonth: parseInt(birthMonth),
      birthDay: parseInt(birthDay),
      modernAdvice: '당신의 조선시대 이름처럼 품격 있는 삶을 살아보세요!'
    };

    onComplete(result);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🏯 조선시대 내 이름은? 🏯
        </CardTitle>
        <CardDescription className="text-lg">
          태어난 달과 일로 알아보는 나의 조선시대 이름!
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">태어난 월</Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                placeholder="예: 3"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                className="text-center text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="day">태어난 일</Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                placeholder="예: 15"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="text-center text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>성별</Label>
            <RadioGroup value={gender} onValueChange={setGender}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">남성 👨</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">여성 👩</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            className="w-full text-lg py-6"
            disabled={!birthMonth || !birthDay || !gender}
          >
            내 조선시대 이름 알아보기! 🎭
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoseonNameForm;