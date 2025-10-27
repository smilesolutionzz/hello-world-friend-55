import { useState } from "react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, ArrowRight, Sparkles, Brain, Users, TrendingUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { AnimatedBackground } from "@/components/ui/animated-background";

interface Column {
  id: string;
  title: string;
  excerpt: string;
  fullContent: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const columns: Column[] = [
  {
    id: "1",
    title: "피할 수 없는 AI 시대, 하지만 결국 사람이 포함되고 터치되어야 합니다",
    excerpt: "우리는 지금 거대한 변화의 한가운데 서 있습니다. AI가 모든 것을 대체할 것만 같은 이 시대에, 저는 오히려 더 큰 확신을 갖게 되었습니다. 기술은 도구일 뿐, 진정한 치유와 성장은 '사람'에게서 시작된다는 것을요.",
    fullContent: `우리는 지금 거대한 변화의 한가운데 서 있습니다. AI가 모든 것을 대체할 것만 같은 이 시대에, 저는 오히려 더 큰 확신을 갖게 되었습니다. **기술은 도구일 뿐, 진정한 치유와 성장은 '사람'에게서 시작된다는 것을요.**

AI하이라이트PRO는 단순한 AI 플랫폼이 아닙니다. 여러분의 일상 속 작은 순간들을 기록하고, 그 데이터가 쌓여 **초개인화된 종합 리포트**로 탄생합니다. 하지만 여기서 멈추지 않습니다. 그 리포트는 반드시 **전문가의 검토**를 거쳐, 정확한 회복과 예방의 길로 안내됩니다.

> "AI는 여러분의 패턴을 발견하고,  
> 전문가는 여러분의 마음을 이해합니다.  
> 함께할 때, 비로소 진정한 변화가 시작됩니다."

매일 수많은 분들이 이 플랫폼에서 자신의 이야기를 기록하고 있습니다. 그 하나하나가 모여 의미 있는 변화를 만들어냅니다. **여러분의 데이터는 단순한 숫자가 아닌, 여러분만의 성장 스토리**가 됩니다.

우리는 AI 시대를 피할 수 없습니다. 하지만 우리는 선택할 수 있습니다. **기술이 사람을 대체하는 것이 아닌, 사람을 더 깊이 이해하고 돕는 도구**로 만들어가는 것을요.

여러분의 여정에 함께할 수 있어 진심으로 감사합니다.`,
    category: "비전",
    date: "2025년 10월",
    readTime: "5분",
    featured: true
  },
  {
    id: "2",
    title: "학부모의 마음 - 완벽하지 않아도 괜찮습니다",
    excerpt: "아이를 키우는 일은 세상에서 가장 어려운 일입니다. SNS에는 완벽한 부모들만 보이고, 내 아이만 뒤처지는 것 같아 불안합니다. 하지만 완벽한 부모는 없습니다. 중요한 건 함께 성장하는 것입니다.",
    fullContent: `"나는 좋은 부모일까?" 

이 질문 앞에서 흔들리지 않는 부모는 없습니다. 오늘도 SNS를 보며 다른 아이들과 비교하고, 내 아이만 뒤처지는 것 같아 불안해합니다. 

**하지만 여러분께 꼭 전하고 싶은 이야기가 있습니다.**

## 완벽한 부모는 없습니다

20년 넘게 발달심리 상담을 하며 수천 명의 부모님을 만났습니다. 그분들이 공통적으로 겪는 고민이 있습니다.

- "내가 너무 엄하게 키우는 건 아닐까?"
- "다른 아이들은 다 하는데 우리 아이만 못하면 어쩌지?"
- "학원을 더 보내야 하나, 아이에게 시간을 줘야 하나?"

이런 고민을 하시는 것 자체가 이미 **좋은 부모의 증거**입니다.

## 데이터가 말해주는 것들

AI하이라이트PRO에 축적된 15만 건의 아동 발달 데이터가 보여주는 놀라운 사실이 있습니다.

**"부모의 완벽함"이 아닌 "부모의 일관성과 관심"이 아이 발달에 가장 큰 영향을 미칩니다.**

- 매일 5분이라도 아이와 진심으로 대화하는 가정의 아이들은 정서 안정도가 37% 더 높습니다
- 실수를 인정하고 사과하는 부모 밑에서 자란 아이들은 자존감이 42% 더 높습니다
- "잘했어"보다 "노력했구나"라는 말을 더 많이 듣는 아이들은 도전정신이 2.3배 더 강합니다

## 전문가가 드리는 조언

### 1. 비교를 멈추세요
다른 아이가 아닌, 지난주의 우리 아이와 비교하세요. 작은 성장을 발견하고 기록하세요.

### 2. 완벽한 환경보다 안전한 관계
최고의 학원보다 중요한 건 "부모는 내 편"이라는 확신입니다.

### 3. 데이터로 객관성을 찾으세요
관찰일지를 꾸준히 기록하면, 여러분이 보지 못했던 아이의 강점과 패턴이 보입니다.

## 함께 성장하는 것

육아는 아이만 성장하는 과정이 아닙니다. **부모도 함께 성장하는 여정**입니다.

실수해도 괜찮습니다. 불안해도 괜찮습니다. 그 마음을 아이와 나누고, 함께 해결책을 찾아가세요.

여러분은 이미 충분히 좋은 부모입니다. 완벽하지 않아도 괜찮습니다.`,
    category: "학부모",
    date: "2025년 10월",
    readTime: "7분"
  },
  {
    id: "3",
    title: "리더의 외로움 - 혼자가 아닙니다",
    excerpt: "리더십 자리에 오를수록 더 외로워집니다. 누구에게도 말하지 못하는 고민, 보여줄 수 없는 약함. 하지만 진정한 리더는 완벽한 사람이 아닙니다. 자신의 한계를 인정하고 도움을 구할 줄 아는 사람입니다.",
    fullContent: `"정상에 오를수록 더 외롭다"

CEO, 임원, 팀장... 직급이 올라갈수록 함께 고민을 나눌 사람이 줄어듭니다. 

## 리더가 겪는 보이지 않는 우울

### 보여줄 수 없는 약함
- 부하 직원들 앞에서는 강해야 한다는 압박
- 상사 앞에서는 완벽해야 한다는 부담
- 가족에게는 걱정을 끼치고 싶지 않은 마음

결국 혼자 모든 것을 떠안게 됩니다.

### 데이터가 보여주는 리더의 현실

AI하이라이트PRO에 기록된 3,200명의 관리자급 데이터 분석 결과:

- **87%**가 "누구에게도 말하지 못하는 고민"을 가지고 있습니다
- **62%**가 불면증이나 수면장애를 겪고 있습니다
- **73%**가 "내가 이 자리에 맞는 사람인가" 의심한 경험이 있습니다

여러분만 그런 게 아닙니다.

## 강한 리더의 함정

"강해야 한다"는 믿음이 오히려 리더를 무너뜨립니다.

### 번아웃의 신호들
- 작은 일에도 과민하게 반응
- 의사결정을 미루게 됨
- 일에 대한 열정 상실
- 만성 피로감

이런 신호가 보인다면, **쉬는 것이 나약함이 아닌 전략**임을 기억하세요.

## 진정한 리더십이란

### 1. 취약성을 보일 줄 아는 용기
완벽한 리더는 없습니다. "모르겠다", "도움이 필요하다"고 말할 수 있는 것이 진정한 강함입니다.

### 2. 혼자가 아닌 함께
신뢰할 수 있는 전문가와 정기적으로 대화하세요. 객관적 조언이 필요합니다.

### 3. 데이터 기반 자기 이해
감정일지, 스트레스 패턴 기록이 축적되면 **내가 언제 무너지는지, 무엇이 나를 회복시키는지** 명확히 보입니다.

## 우울은 약함이 아닙니다

리더의 우울은 **책임감의 과부하**입니다. 

- 혼자 모든 걸 해결하려 하지 마세요
- 전문가의 도움을 받는 것은 현명한 선택입니다
- 조직을 위해서라도 리더의 정신건강이 우선입니다

## 지금 필요한 것

당신에게 필요한 건 더 많은 일이 아닙니다.

**"나"를 돌볼 시간입니다.**

여러분은 혼자가 아닙니다. 우리가 함께합니다.`,
    category: "리더십",
    date: "2025년 10월",
    readTime: "8분"
  },
  {
    id: "4",
    title: "청소년의 마음 건강 - 그들의 언어로 다가가기",
    excerpt: "요즘 아이들은 말이 없습니다. '괜찮아'라고만 하죠. 하지만 그 뒤에는 학업 스트레스, 또래 관계, SNS 비교로 인한 우울이 숨어 있습니다. 어른의 시선이 아닌, 그들의 언어로 다가가야 합니다.",
    fullContent: `"괜찮아요"

청소년 상담을 시작하면 가장 많이 듣는 말입니다. 하지만 데이터는 다른 이야기를 합니다.

## 침묵 뒤에 숨은 진실

### 청소년 정신건강 현황 (AI하이라이트PRO 분석)

14-19세 사용자 12,000명 데이터 분석:

- **68%**가 중등도 이상의 스트레스 경험
- **43%**가 자해 충동을 느낀 적 있음
- **89%**가 부모에게 속마음을 말하지 않음

"괜찮다"고 말하는 아이들이 사실은 괜찮지 않습니다.

## 왜 말하지 않을까?

### 1. "이해받지 못할 것 같아서"
"공부만 하면 되잖아"  
"요즘 애들은 왜 이렇게 나약해"

이런 말들이 아이들의 입을 닫게 만듭니다.

### 2. 부모님을 실망시키고 싶지 않아서
성적, 진로, 교우관계... 모든 게 완벽해야 한다는 압박을 스스로 느낍니다.

### 3. SNS와 비교
모두가 행복해 보이는 SNS 속에서, 자신만 우울한 것 같다고 느낍니다.

## 청소년 우울의 특징

어른의 우울과 다릅니다.

### 청소년 우울 신호
- 갑작스러운 성적 하락
- 친구 관계 단절
- 방에만 있으려 함
- 게임이나 스마트폰에 집착
- 짜증이 늘어남
- 두통, 복통 등 신체 증상

이것들은 게으름이나 반항이 아닙니다. **도움을 요청하는 신호**입니다.

## 전문가가 제안하는 접근법

### 1. 판단하지 말고 들어주세요
"그게 무슨 고민이야?"가 아닌  
"힘들었구나. 더 말해줄 수 있어?"

### 2. 비교하지 마세요
"다른 애들은 잘하는데"  
이 한마디가 아이를 더 움츠러들게 합니다.

### 3. 디지털 언어로 소통하세요
직접 대화가 어렵다면 메시지로 시작하세요. 청소년들은 문자로 더 솔직해집니다.

### 4. 전문가의 도움을 두려워하지 마세요
상담은 문제가 있어서가 아닌, **더 나은 삶을 위한 투자**입니다.

## 데이터가 보여주는 회복

초기 개입이 중요합니다.

- 조기 상담 받은 청소년: **3개월 내 82% 증상 개선**
- 방치된 경우: 성인기까지 이어질 확률 **67%**

## 부모님께 드리는 메시지

완벽한 부모가 되려 하지 마세요.  
**함께 성장하는 부모**가 되어주세요.

아이가 힘들 때, "내가 뭘 잘못했나"보다  
"지금 네가 필요한 게 뭐야?"를 물어주세요.

여러분의 아이는 나약하지 않습니다.  
다만 **도움이 필요한 시기**일 뿐입니다.

우리가 함께합니다.`,
    category: "청소년",
    date: "2025년 10월",
    readTime: "9분"
  },
  {
    id: "5",
    title: "영유아 발달 예방 - 골든타임을 놓치지 마세요",
    excerpt: "아이의 발달은 되돌릴 수 없는 시간과의 싸움입니다. '좀 더 지켜보자'는 말이 평생을 좌우할 수 있습니다. 전문가들이 강조하는 영유아 발달의 골든타임, 지금이 가장 중요한 때입니다.",
    fullContent: `"조금만 더 지켜보죠"

소아정신과에서 가장 안타까운 순간이 이 말을 들을 때입니다.

## 발달, 시간은 기다려주지 않습니다

### 뇌 발달의 결정적 시기

0-3세는 뇌 발달의 **80%가 완성**되는 시기입니다.

- 언어: 0-3세가 결정적
- 사회성: 1-4세가 가장 중요
- 정서 조절: 2-5세에 기반 형성

이 시기를 놓치면 나중에 10배의 노력이 필요합니다.

## 조기 발견의 중요성

### AI하이라이트PRO 발달 분석 결과

18개월 이전 조기 개입 vs 36개월 이후 시작:

- **언어 발달 개선율**: 조기 87% vs 후기 34%
- **사회성 향상**: 조기 92% vs 후기 41%
- **부모 만족도**: 조기 96% vs 후기 58%

**빠를수록 좋습니다.**

## 놓치기 쉬운 발달 신호들

### 12개월
- 부모 부를 때 반응 없음
- 바이바이 등 간단한 동작 모방 안 함
- 소리 나는 곳을 쳐다보지 않음

### 18개월
- 의미 있는 단어 10개 이하
- 눈 마주침이 거의 없음
- 가리키기(pointing) 하지 않음

### 24개월
- 두 단어 조합 안 함 ("엄마 물")
- 또래에게 관심 없음
- 같은 행동 반복 집착

### 36개월
- 3단어 문장 안 함
- 배변 훈련 전혀 안 됨
- 역할놀이 못 함

**"좀 늦을 뿐"이라고 넘기지 마세요.**

## 예방이 답입니다

### 1. 관찰일지 작성
매일 5분, 아이의 행동을 기록하세요.

- "오늘 새로운 단어: ○○"
- "친구와 놀이: 5분"
- "눈 마주침: 자주/보통/드물게"

축적된 데이터가 패턴을 보여줍니다.

### 2. 발달 체크리스트 활용
AI 기반 발달 평가는 **93%의 정확도**로 조기 신호를 포착합니다.

### 3. 전문가 조기 상담
의심되면 바로 상담하세요.

"괜찮습니다"라는 말을 듣더라도 마음이 편해집니다.  
"빨리 와서 다행입니다"라는 말을 들으면 아이의 미래가 바뀝니다.

## 부모가 할 수 있는 것들

### 일상 속 발달 촉진

**언어 발달**
- TV보다 부모의 목소리
- 하루 30분 그림책
- 아이가 말하면 확장해서 대답

**사회성 발달**
- 주 2회 이상 또래 만남
- 감정 이름 붙여주기
- 차례 지키기 연습

**정서 발달**
- 일관된 양육 태도
- 충분한 스킨십
- 안정적 일과

### 작은 실천의 힘

하루 10분 아이와의 집중 시간이  
아이의 평생을 바꿉니다.

## 전문가의 마지막 조언

"혹시 몰라서" 검사받는 것이  
"이미 늦어서" 후회하는 것보다 낫습니다.

부모의 직감은 **70% 이상 정확**합니다.  
뭔가 이상하다고 느껴진다면, 그것은 이상한 것입니다.

## 골든타임

지금 이 순간이 바로 골든타임입니다.

내일로 미루지 마세요.  
다음 주로 미루지 마세요.

**오늘, 지금 시작하세요.**

여러분의 아이가 가진 무한한 가능성을  
우리가 함께 키워가겠습니다.`,
    category: "영유아",
    date: "2025년 10월",
    readTime: "10분"
  },
  {
    id: "6",
    title: "노인의 존엄과 행복 - 황혼은 아름다운 시간입니다",
    excerpt: "나이 든다는 것은 잃어가는 과정이 아닙니다. 오히려 삶의 지혜가 무르익는 시간입니다. 하지만 우울, 고독, 무기력이 이 아름다운 시간을 앗아갑니다. 노인의 정신건강, 이제는 선택이 아닌 필수입니다.",
    fullContent: `"나는 이제 쓸모없는 사람이야"

70대 할머니가 상담실에서 하신 말씀입니다. 평생 가족을 위해 헌신하셨지만, 이제는 짐이 된 것 같다고 하셨습니다.

## 노인 우울, 숨겨진 위기

### 통계가 말하는 현실

AI하이라이트PRO 65세 이상 사용자 8,500명 데이터:

- **73%**가 중등도 이상의 우울 증상 경험
- **58%**가 "살아야 할 이유를 모르겠다" 느낌
- **82%**가 가족에게 자신의 우울을 숨김

노인 우울은 **"노화의 자연스러운 과정"이 아닙니다.** 치료가 필요한 질환입니다.

## 왜 노인 우울은 간과될까?

### 1. "나이 들면 다 그렇지"
- 무기력함을 나이 탓으로 돌림
- 우울을 당연하게 여김
- 치료 시기를 놓침

### 2. 표현이 다릅니다
노인의 우울은 "슬프다"가 아닌:

- "몸이 여기저기 아파"
- "머리가 안 돌아가"
- "입맛이 없어"
- "밤에 잠이 안 와"

신체 증상으로 나타나기에 우울로 인식하지 못합니다.

### 3. 세대 차이
"정신과? 미친 사람이나 가는 곳"이라는 편견이 치료를 막습니다.

## 노인이 겪는 상실들

### 신체적 상실
- 건강 악화
- 독립성 감소
- 통증과 질병

### 사회적 상실
- 배우자, 친구의 사망
- 자녀의 독립
- 사회적 역할 상실

### 심리적 상실
- 기억력 저하
- 자존감 감소
- 미래에 대한 불안

**하나하나가 우울의 원인이 됩니다.**

## 치매 vs 우울증

혼동하기 쉽지만 다릅니다.

### 우울증
- 기억력: "기억이 안 나요"
- 진행: 급격함
- 시간 인지: 정확함
- 치료 반응: 좋음

### 치매
- 기억력: "문제없어요" (인지 못함)
- 진행: 서서히
- 시간 인지: 혼란스러움
- 치료 반응: 제한적

**우울증은 치료하면 좋아집니다.**

## 데이터 기반 조기 발견

### AI가 포착하는 우울 신호

일주일간의 기록만으로도:

- 수면 패턴 변화 감지
- 식사량 감소 추적
- 활동량 저하 파악
- 감정 표현 빈도 분석

**87%의 정확도로 우울 위험을 조기 발견**합니다.

## 노인 우울 예방과 관리

### 1. 일상의 작은 즐거움
- 매일 햇볕 쬐기 (30분)
- 규칙적인 산책
- 좋아하는 활동 유지

### 2. 사회적 연결
- 주 2회 이상 대화
- 종교 활동, 동호회
- 봉사활동 참여

**고립이 가장 큰 적입니다.**

### 3. 존재의 의미 찾기
- 손주와의 시간
- 취미 생활
- 자서전 쓰기
- 젊은 세대 멘토링

**여전히 필요한 사람임을 느끼는 것이 중요합니다.**

### 4. 전문가 도움
약물치료와 상담치료의 병행이 가장 효과적입니다.

## 가족이 해야 할 일

### 우울 신호 인지
- 평소와 다른 행동
- 신체 증상 호소 증가
- 사회 활동 회피
- 죽음에 대한 언급

**"나이 들면 다 그래"라고 넘기지 마세요.**

### 대화의 기술
- 충고보다 경청
- 비교하지 않기
- 존중하는 태도

"어르신이 옳으세요"가 아닌  
"어르신의 생각을 듣고 싶어요"

## 황혼은 아름다운 시간입니다

나이 든다는 것은 잃어가는 과정이 아닙니다.

- 삶의 지혜가 무르익는 시간
- 진정으로 중요한 것을 아는 시간
- 다음 세대에 물려줄 유산을 남기는 시간

**어르신의 존엄과 행복은 우리 모두의 책임입니다.**

## 전문가의 당부

노인 우울은:
- 치료 가능한 질환입니다
- 조기 발견이 중요합니다
- 가족의 관심이 필수입니다

지금 이 순간에도 수많은 어르신들이  
말없이 고통받고 계십니다.

**관심과 사랑이 최고의 치료입니다.**

우리가 함께 하겠습니다.`,
    category: "노인",
    date: "2025년 10월",
    readTime: "12분"
  },
  {
    id: "7",
    title: "50-60대 부모님 세대 - 인생의 전환점에서",
    excerpt: "은퇴를 앞두거나 맞이한 50-60대, 자녀 독립 후 찾아온 공허함. 이 시기는 위기가 아닌 새로운 시작의 기회입니다. 제2의 인생을 위한 준비, 지금부터 시작해야 합니다.",
    fullContent: `"이제 뭘 하며 살아야 하지?"

55세 남성이 조기 퇴직 후 찾아오셨습니다. 30년 직장 생활이 끝나고 앞으로 30년을 어떻게 살아야 할지 막막하다고 하셨습니다.

## 50-60대, 인생의 전환점

### 이 시기에 마주하는 변화들

**직업적 변화**
- 은퇴 또는 조기 퇴직
- 사회적 지위 상실
- 경제적 불안감
- 일상의 공백

**가족 관계 변화**
- 자녀의 독립 (빈둥지 증후군)
- 부부만의 시간 증가
- 노부모 돌봄 책임
- 손자녀 양육 참여

**신체적 변화**
- 체력 저하 실감
- 만성질환 시작
- 갱년기 증상
- 외모 변화

## 중년의 위기 vs 중년의 전환

### 위기로 보면
- "인생이 끝났다"
- "이제 내리막길뿐"
- "쓸모없는 사람"

### 전환으로 보면
- **"제2의 인생 시작"**
- **"진짜 하고 싶던 일 할 시간"**
- **"나를 위한 선택의 기회"**

**같은 상황, 다른 해석이 미래를 바꿉니다.**

## 데이터가 말하는 50-60대 정신건강

### AI하이라이트PRO 분석 (50-60대 14,200명)

- **68%**가 은퇴 후 우울감 경험
- **54%**가 "존재의 의미" 상실감
- **71%**가 부부 관계 재조정 어려움
- **82%**가 경제적 불안 호소

하지만:
- **조기 개입 시 92%가 3개월 내 회복**
- **새로운 활동 시작한 경우 삶의 만족도 47% 증가**

**위기를 기회로 전환할 수 있습니다.**

## 흔한 고민들

### 1. 빈둥지 증후군
자녀가 독립한 후 찾아온 공허함

**증상:**
- 무력감, 우울감
- 삶의 목적 상실
- 부부간 대화 단절
- 과도한 자녀 걱정

**극복 방법:**
- 부부 관계에 재투자
- 부부만의 새로운 취미
- 친구 관계 회복
- 봉사활동 시작

### 2. 은퇴 후 우울
일과 함께 잃어버린 정체성

**왜 힘들까:**
- 사회적 인정 상실
- 일상의 구조 붕괴
- 경제적 자신감 하락
- 미래에 대한 불안

**해결책:**
- 은퇴 전 미리 준비 (5년 전부터)
- 새로운 역할 찾기
- 규칙적인 일상 유지
- 경제적 계획 수립

### 3. 부부 관계 재정립
24시간 함께 있게 된 불편함

**갈등 요인:**
- "집은 내 영역"이라는 배우자 반응
- 역할 분담 미숙
- 오랜 묵은 감정
- 대화 부족

**개선 방법:**
- 각자만의 시간 존중
- 새로운 공동 관심사
- 정기적인 데이트
- 부부 상담 활용

## 제2의 인생 설계

### 1. 자기 탐색
"진짜 나는 무엇을 원하는가?"

**질문하기:**
- 젊은 시절 꿈꿨던 것은?
- 돈과 상관없이 하고 싶은 일은?
- 나의 강점과 경험은?
- 누구에게 도움을 줄 수 있나?

### 2. 새로운 도전
지금부터 30년, 충분한 시간입니다.

**추천 활동:**
- 평생 배우고 싶던 것 시작
- 재능 나눔 (강연, 멘토링)
- 창업 (취미의 사업화)
- 사회 공헌 활동

### 3. 관계 재구성
일 중심에서 사람 중심으로

**투자할 관계:**
- 배우자와의 깊은 대화
- 오랜 친구들과 재회
- 동호회, 커뮤니티 참여
- 세대 간 교류

## 건강 관리의 중요성

### 신체 건강
- 규칙적인 운동 (주 3회 이상)
- 건강 검진 (연 1회)
- 만성질환 관리
- 균형 잡힌 식사

### 정신 건강
- 스트레스 관리
- 우울 신호 조기 발견
- 전문가 상담 활용
- 긍정적 마인드 유지

**몸과 마음이 건강해야 제2의 인생을 즐길 수 있습니다.**

## 경제적 준비

### 현실적 계획
- 생활비 재설계
- 의료비 대비
- 여가비 책정
- 비상자금 확보

### 수입원 다각화
- 연금 최적화
- 부업/창업 고려
- 자산 관리
- 소비 습관 조정

**돈이 전부는 아니지만, 안정이 자유를 줍니다.**

## 전문가의 조언

### 준비된 전환이 성공적 노년을 만듭니다

**지금 시작해야 할 것:**
1. 은퇴 전 5년: 구체적 계획 수립
2. 은퇴 1년 전: 일상 루틴 실험
3. 은퇴 직후: 새로운 정체성 확립
4. 은퇴 후 1년: 안정화 및 조정

### 우울 신호 체크리스트
- 2주 이상 지속되는 우울감
- 흥미와 즐거움 상실
- 수면 장애 (불면/과다수면)
- 식욕 변화
- 무가치감, 죄책감
- 집중력 저하
- 죽음에 대한 생각

**3개 이상 해당되면 전문가 상담을 권합니다.**

## 인생의 황금기

50-60대는 끝이 아닙니다.

- 경험과 지혜가 정점에 이른 시기
- 의무가 아닌 선택으로 사는 시기
- 다음 세대에 유산을 남기는 시기
- **진정한 자유를 누리는 시기**

## 성공적 전환의 사례들

### A씨 (58세, 전 회사원)
은퇴 후 청소년 멘토링 시작  
→ "지금이 인생에서 가장 보람찬 시기"

### B씨 (62세, 전 교사)
부부가 함께 작은 카페 창업  
→ "일이 아닌 취미로 하니 즐겁다"

### C씨 (56세, 주부)
빈둥지 후 대학원 진학  
→ "늦은 배움이 삶에 활력을 준다"

**모두 처음엔 불안했지만, 도전 후 행복해졌습니다.**

## 마지막 당부

이 시기는 위기가 아닙니다.  
**새로운 시작의 기회**입니다.

- 과거의 성공에 얽매이지 마세요
- 남과 비교하지 마세요
- 완벽할 필요 없습니다
- 시행착오를 두려워하지 마세요

**여러분의 제2의 인생을 응원합니다.**

지금부터 30년,  
가장 자유롭고 행복한 시간으로 만들어가세요.

우리가 함께 하겠습니다.`,
    category: "50-60대",
    date: "2025년 10월",
    readTime: "11분"
  }
];

const Column = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["전체", "비전", "학부모", "리더십", "청소년", "영유아", "노인", "50-60대"];

  const filteredColumns = selectedCategory === "전체" 
    ? columns 
    : columns.filter(col => col.category === selectedCategory);

  const featuredColumn = columns.find(col => col.featured);
  const regularColumns = columns.filter(col => !col.featured);

  return (
    <>
      <SEOHead 
        title="창립자 칼럼 - AI하이라이트PRO"
        description="AI와 사람이 함께하는 미래, 데이터 기반 개인화 케어에 대한 창립자의 생각과 비전을 공유합니다."
        keywords="AI심리상담,데이터기반케어,개인화리포트,심리분석,전문가상담,정신건강,AI비전"
      />
      
      <AnimatedBackground />
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <UnifiedNavigation />
        
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">매달 업데이트</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent whitespace-nowrap leading-tight">
              창립자 이수석의 칼럼
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-snug">
              AI와 사람이 함께 만드는 더 나은 내일,<br className="block sm:hidden" />
              진심을 담아 여러분께 전합니다
            </p>
          </div>

          {/* Mission Section - 아코디언 */}
          <div className="mb-16 max-w-5xl mx-auto relative">
            {/* Animated warm background */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" 
                   style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" 
                   style={{ animationDuration: '5s', animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" 
                   style={{ animationDuration: '6s', animationDelay: '2s' }} />
            </div>
            
            <div 
              className="text-center mb-8 space-y-6 cursor-pointer group relative"
              onClick={() => setExpandedId(expandedId === 'mission' ? null : 'mission')}
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 border-2 border-primary/30 mb-4 shadow-lg backdrop-blur-sm">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-base font-bold text-primary uppercase tracking-wide">Our Mission</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <h2 className="text-4xl md:text-5xl font-black text-primary drop-shadow-lg">
                  14년, 5,000명과 함께한 진심
                </h2>
                <ArrowRight 
                  className={`w-7 h-7 text-primary transition-all duration-300 group-hover:translate-x-1 ${expandedId === 'mission' ? 'rotate-90' : ''}`}
                />
              </div>
              <p className="text-xl text-foreground/80 font-medium max-w-2xl mx-auto">
                데이터와 사람의 온기가 만나는 곳
              </p>
            </div>

            {expandedId === 'mission' && (
              <Card className="p-10 md:p-16 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-2 border-primary/30 shadow-2xl animate-in slide-in-from-top-4 duration-500">
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8 text-foreground/90 leading-relaxed">
                    <p className="text-2xl font-bold text-primary text-center border-b-2 border-primary/20 pb-6">
                      수천 번의 상담에서 발견한 단 하나의 진실
                    </p>

                    <p className="text-lg leading-loose">
                      지난 14년간, 저는 5,000명이 넘는 학부모, 청소년, 아동을 만나왔습니다. 
                      새벽같이 찾아오신 불안한 부모님들, 말없이 눈물만 흘리던 아이들, 
                      "이제 너무 늦은 건 아닐까요?"라며 떨리는 목소리로 물으시던 분들... 
                      <span className="font-bold text-primary text-xl">그 하나하나가 모두 제 사명이 되었습니다.</span>
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 my-10">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-8 text-center space-y-4 shadow-lg">
                        <div className="text-6xl font-bold text-primary drop-shadow-md">14년</div>
                        <div className="text-base text-foreground/80 font-medium">
                          매일 현장에서 쌓아온<br />생생한 임상 경험
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/30 rounded-xl p-8 text-center space-y-4 shadow-lg">
                        <div className="text-6xl font-bold text-secondary drop-shadow-md">5,000+</div>
                        <div className="text-base text-foreground/80 font-medium">
                          함께 울고 웃으며<br />성장한 소중한 인연들
                        </div>
                      </div>
                    </div>

                    <p className="text-lg leading-loose">
                      상담실에서 마주한 수많은 이야기들은 공통된 진실을 말해주었습니다. 
                      <span className="font-bold text-primary text-xl"> 사람들은 단순한 조언이 아닌, 
                      자신을 깊이 이해하고 함께 걸어줄 누군가를 원한다는 것</span>을요. 
                      하지만 현실은 가혹했습니다. 한 명의 전문가가 돌볼 수 있는 사람은 한정되어 있고, 
                      많은 분들이 도움의 손길을 받지 못한 채 혼자 고통받고 계셨습니다.
                    </p>

                    <div className="bg-gradient-to-r from-primary/15 to-secondary/15 border-l-4 border-primary p-8 rounded-r-xl my-10 shadow-md">
                      <p className="text-lg font-bold italic text-foreground/90 leading-relaxed">
                        "어떻게 하면 더 많은 사람들에게<br />
                        전문가의 따뜻한 손길을 전할 수 있을까?<br />
                        어떻게 하면 한계를 넘어설 수 있을까?"
                      </p>
                    </div>

                    <p className="text-lg leading-loose">
                      그 답을 AI에서 찾았습니다. 하지만 차갑고 기계적인 AI가 아닌, 
                      <span className="font-bold text-primary text-xl"> 14년간 쌓아온 임상 경험과 
                      5,000번의 상담에서 배운 인간에 대한 이해가 담긴 AI</span>였습니다. 
                      AI가 24시간 데이터를 관찰하고 패턴을 발견하면, 
                      전문가는 그 속에서 한 사람만의 이야기를 읽어냅니다.
                    </p>

                    <p className="text-lg leading-loose">
                      기술은 더 많은 사람을 만날 수 있게 해주었지만, 
                      제가 절대 포기할 수 없는 것이 있습니다. 
                      <span className="font-bold text-primary text-xl"> 그것은 바로 '사람의 온기'입니다.</span> 
                      아무리 정교한 AI라도, 부모의 떨리는 손을 잡아주는 따뜻함은 대신할 수 없습니다. 
                      아무리 정확한 데이터라도, "괜찮을 거예요"라는 진심 어린 위로는 담을 수 없습니다.
                    </p>

                    <p className="text-lg leading-loose">
                      그래서 AI하이라이트PRO는 AI 플랫폼이면서도, 
                      <span className="font-bold text-primary text-xl"> 반드시 사람이 포함되는 시스템</span>으로 만들었습니다. 
                      여러분의 데이터는 AI가 분석하지만, 최종 리포트는 반드시 전문가의 검토를 거칩니다. 
                      숫자 너머의 이야기를, 패턴 속의 감정을, 데이터 안의 사람을 읽어내기 위해서입니다.
                    </p>

                    <div className="bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 rounded-xl p-8 my-10 text-center border-2 border-primary/20 shadow-lg">
                      <p className="text-xl font-bold text-foreground mb-6 leading-relaxed">
                        학부모의 불안 하나,<br />
                        청소년의 침묵 하나,<br />
                        아동의 작은 신호 하나가<br />
                        모두 저에게는 소중한 사명입니다.
                      </p>
                      <p className="text-lg text-foreground/80 leading-relaxed">
                        14년 전 첫 상담실을 열던 그날의 다짐,<br />
                        <span className="font-bold text-primary">"한 사람 한 사람을 진심으로"</span><br />
                        그 마음은 지금도, 앞으로도 변하지 않을 것입니다.
                      </p>
                    </div>

                    <p className="text-lg leading-loose">
                      여러분의 성장 여정에 함께할 수 있어 진심으로 감사합니다. 
                      AI와 전문가가, 기술과 사람이, 데이터와 온기가 함께하는 그날까지 
                      멈추지 않고 나아가겠습니다.
                    </p>

                    <div className="mt-12 pt-8 border-t-2 border-primary/20">
                      <p className="text-right text-foreground/80 text-lg">
                        14년간의 현장 경험을 담아,<br />
                        <span className="font-bold text-primary text-2xl">AI하이라이트PRO 창립자 이수석</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Column */}
          {featuredColumn && selectedCategory === "전체" && (
            <Card className="mb-12 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div 
                className="grid md:grid-cols-2 gap-8 p-8 md:p-12 cursor-pointer"
                onClick={() => setExpandedId(expandedId === featuredColumn.id ? null : featuredColumn.id)}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge variant="outline">{featuredColumn.category}</Badge>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    {featuredColumn.title}
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {featuredColumn.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredColumn.date}
                    </div>
                    <div>· {featuredColumn.readTime} 읽기</div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-medium">
                    {expandedId === featuredColumn.id ? '접기' : '전체 글 읽기'}
                    <ArrowRight className={`w-4 h-4 transition-transform ${expandedId === featuredColumn.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                <div className="hidden md:flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-20 animate-pulse" />
                    <div className="relative bg-card/50 backdrop-blur-xl rounded-2xl p-8 border border-primary/20">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center space-y-2">
                          <Brain className="w-8 h-8 text-primary mx-auto" />
                          <div className="text-2xl font-bold text-primary">AI</div>
                          <div className="text-xs text-muted-foreground">패턴 발견</div>
                        </div>
                        <div className="text-center space-y-2">
                          <Users className="w-8 h-8 text-secondary mx-auto" />
                          <div className="text-2xl font-bold text-secondary">전문가</div>
                          <div className="text-xs text-muted-foreground">마음 이해</div>
                        </div>
                        <div className="col-span-2 text-center space-y-2 pt-4 border-t border-border">
                          <TrendingUp className="w-10 h-10 text-primary mx-auto" />
                          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            진정한 변화
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedId === featuredColumn.id && (
                <CardContent className="pt-0 px-8 md:px-12 pb-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="prose prose-lg max-w-none border-t border-border pt-8">
                    <div className="space-y-6 text-foreground/90 leading-relaxed whitespace-pre-line">
                      {featuredColumn.fullContent}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Regular Columns Grid */}
          <div className="space-y-6">
            {(selectedCategory === "전체" ? regularColumns : filteredColumns).map((column) => (
              <Card key={column.id} className="group border-border/50 overflow-hidden">
                <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === column.id ? null : column.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="border-primary/30">
                          {column.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-2">
                        {column.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {column.excerpt}
                      </CardDescription>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {column.date}
                        </div>
                        <div>· {column.readTime}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group-hover:text-primary shrink-0"
                    >
                      {expandedId === column.id ? '접기' : '읽기'}
                      <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${expandedId === column.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                {/* 전체 내용 - 아코디언 */}
                {expandedId === column.id && (
                  <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-border pt-6">
                      <div className="prose prose-lg max-w-none">
                        {column.fullContent.split('\n').map((paragraph, idx) => {
                          // 제목 처리 (##)
                          if (paragraph.startsWith('## ')) {
                            return <h2 key={idx} className="text-2xl font-bold mt-8 mb-4 text-foreground">{paragraph.replace('## ', '')}</h2>;
                          }
                          // 소제목 처리 (###)
                          if (paragraph.startsWith('### ')) {
                            return <h3 key={idx} className="text-xl font-semibold mt-6 mb-3 text-foreground">{paragraph.replace('### ', '')}</h3>;
                          }
                          // 인용구 처리 (>)
                          if (paragraph.startsWith('> ')) {
                            return (
                              <blockquote key={idx} className="border-l-4 border-primary pl-6 py-4 my-6 italic bg-primary/5 rounded-r-lg">
                                <p className="text-foreground/90">{paragraph.replace('> ', '')}</p>
                              </blockquote>
                            );
                          }
                          // 리스트 아이템 처리 (-)
                          if (paragraph.startsWith('- ')) {
                            return (
                              <li key={idx} className="ml-6 my-2 text-foreground/90">
                                {paragraph.replace('- ', '').split('**').map((part, i) => 
                                  i % 2 === 1 ? <strong key={i} className="font-semibold text-primary">{part}</strong> : part
                                )}
                              </li>
                            );
                          }
                          // 일반 문단 처리
                          if (paragraph.trim()) {
                            return (
                              <p key={idx} className="mb-4 leading-relaxed text-foreground/90">
                                {paragraph.split('**').map((part, i) => 
                                  i % 2 === 1 ? <strong key={i} className="font-semibold text-primary">{part}</strong> : part
                                )}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="mt-16 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="text-center py-12 space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                여러분의 성장 여정에 함께하고 싶습니다
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI와 전문가가 함께하는 초개인화 케어,<br />
                지금 바로 시작해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  무료 체험 시작
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/expert-hiring')}
                  className="border-primary/30"
                >
                  <Users className="w-4 h-4 mr-2" />
                  전문가 상담 받기
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Column;
