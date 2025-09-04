import { useToast } from "@/hooks/use-toast";

export const useShareText = () => {
  const { toast } = useToast();

  const shareAsText = async (text: string, title: string = "테스트 결과") => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 텍스트 복사 완료!",
        description: "결과가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: "복사 실패",
        description: "텍스트 복사에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  return { shareAsText };
};

// 재미 테스트 결과 포맷팅
export const formatFunTestResult = (result: any, testType: string): string => {
  const timestamp = new Date().toLocaleString('ko-KR');
  
  switch (testType) {
    case 'past_life_job':
      return `🏺 내 전생 직업 분석 결과
📅 ${timestamp}

👑 전생 직업: ${result.pastLifeJob}
🏛️ 시대: ${result.era}

📖 설명:
${result.description}

✨ 성격 분석:
${result.personality}

🎯 특별한 능력:
${result.abilities?.map((ability: string, index: number) => `${index + 1}. ${ability}`).join('\n') || '정보 없음'}

📜 전생 이야기:
${result.lifestory}

🔗 현재와의 연결점:
${result.modernConnection}

💡 전생에서 얻는 지혜:
${result.advice}

💼 직업 호환성:
✅ 잘 맞는 현재 직업: ${result.compatibility?.bestMatch || '정보 없음'}
❌ 피해야 할 직업: ${result.compatibility?.worstMatch || '정보 없음'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 AI 전생 직업 분석 서비스
더 많은 재미있는 테스트: aihpro.com`;

    case 'animal_face_match':
      return `🐾 내 얼굴 닮은 동물 분석 결과
📅 ${timestamp}

🐨 닮은 동물: ${result.matchedAnimal} ${result.emoji || ''}
📊 유사도: ${result.similarity}%

🔍 얼굴 특징 분석:
👀 눈: ${result.facialFeatures?.eyes || '정보 없음'}
👃 코: ${result.facialFeatures?.nose || '정보 없음'}
😊 얼굴형: ${result.facialFeatures?.face_shape || '정보 없음'}
✨ 전체 인상: ${result.facialFeatures?.overall || '정보 없음'}

🎭 동물 특성:
• 성격: ${result.animalCharacteristics?.personality?.join(', ') || '정보 없음'}
• 강점: ${result.animalCharacteristics?.strengths?.join(', ') || '정보 없음'}
• 서식지: ${result.animalCharacteristics?.habitat || '정보 없음'}

🤔 재미있는 사실들:
${result.funFacts?.map((fact: string, index: number) => `${index + 1}. ${fact}`).join('\n') || '정보 없음'}

👥 호환성:
🤝 잘 맞는 친구들: ${result.compatibility?.friends?.join(', ') || '정보 없음'}
⚔️ 라이벌 관계: ${result.compatibility?.rivals?.join(', ') || '정보 없음'}

💫 조언:
${result.advice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 AI 얼굴 분석 서비스
친구들과 함께 재미있는 테스트: aihpro.com`;

    case 'inner_animal':
      return `🦋 내 내면 동물 분석 결과
📅 ${timestamp}

🐾 내면 동물: ${result.innerAnimal}
🎭 동물 유형: ${result.animalType}
📊 매칭도: ${result.personalityMatch}%

🎯 핵심 특성:
• 주요 특성: ${result.coreTraits?.primary || '정보 없음'}
• 부차 특성: ${result.coreTraits?.secondary || '정보 없음'}
• 숨겨진 특성: ${result.coreTraits?.hidden || '정보 없음'}

🧠 심리 분석:
💪 강점: ${result.psychologicalAnalysis?.strengths?.join(', ') || '정보 없음'}
🎯 동기: ${result.psychologicalAnalysis?.motivations?.join(', ') || '정보 없음'}
⚡ 과제: ${result.psychologicalAnalysis?.challenges?.join(', ') || '정보 없음'}

💼 라이프스타일 조언:
• 업무 환경: ${result.lifestyleAdvice?.workEnvironment || '정보 없음'}
• 인간관계: ${result.lifestyleAdvice?.relationships || '정보 없음'}
• 성장 방향: ${result.lifestyleAdvice?.growth || '정보 없음'}

🐾 동물의 지혜:
${result.animalWisdom}

🌟 현재 인생 단계:
${result.currentLifePhase}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 AI 내면 동물 분석 서비스
나의 진정한 모습을 발견: aihpro.com`;

    default:
      return `테스트 결과
📅 ${timestamp}

${JSON.stringify(result, null, 2)}`;
  }
};

// 심리검사 결과 포맷팅
export const formatPsychTestResult = (testType: string, results: any, analysis?: string): string => {
  const timestamp = new Date().toLocaleString('ko-KR');
  
  switch (testType) {
    case 'depression':
      return `😔 우울감 수준 검사 결과
📅 ${timestamp}

📊 점수: ${results.total}점 (평균: ${results.average})
📈 수준: ${results.severity}

🔍 분석 결과:
${analysis || '추가 분석 정보가 없습니다.'}

💡 권장사항:
• 정확한 진단은 전문의와 상담하세요
• 꾸준한 자기관리가 중요합니다
• 주변 지인들과 소통을 유지하세요

🚨 응급상황 시 연락처:
• 응급상황: 119
• 자살예방 상담: 1577-0199

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 전문 심리검사 서비스
더 정확한 진단: aihpro.com`;

    case 'anxiety':
    case 'panic':
      return `😰 불안감 수준 검사 결과
📅 ${timestamp}

📊 점수: ${results.total}점 (평균: ${results.average})
📈 수준: ${results.severity}

🔍 분석 결과:
${analysis || '추가 분석 정보가 없습니다.'}

💡 관리 방법:
• 규칙적인 운동과 충분한 휴식
• 스트레스 관리 기법 학습
• 전문가 상담 고려

🚨 응급상황 시 연락처:
• 응급상황: 119
• 자살예방 상담: 1577-0199

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 전문 심리검사 서비스
더 많은 테스트: aihpro.com`;

    case 'adhd':
      return `🎯 ADHD 성향 검사 결과
📅 ${timestamp}

📊 점수: ${results.total}점 (평균: ${results.average})
📈 수준: ${results.severity}
👶 연령군: ${results.ageGroup}

🔍 분석 결과:
${analysis || '추가 분석 정보가 없습니다.'}

💡 권장사항:
• 전문의와 정확한 진단 상담
• 체계적인 일상 관리 시스템 구축
• 집중력 향상을 위한 환경 조성

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 전문 심리검사 서비스
더 많은 테스트: aihpro.com`;

    default:
      return `심리검사 결과
📅 ${timestamp}

${JSON.stringify(results, null, 2)}`;
  }
};

// 한의학 검사 결과 포맷팅
export const formatMedicalTestResult = (testType: string, result: any): string => {
  const timestamp = new Date().toLocaleString('ko-KR');
  
  if (testType === 'sasang_constitution') {
    const constitutionNames = {
      soyang: '소양인',
      soeum: '소음인', 
      taeyang: '태양인',
      taeeum: '태음인'
    };
    
    return `⚊⚊ 사상체질 진단 결과
📅 ${timestamp}

🏥 체질: ${constitutionNames[result.constitution as keyof typeof constitutionNames] || result.constitution}

📊 체질별 점수:
• 소양인: ${result.scores?.soyang || 0}점
• 소음인: ${result.scores?.soeum || 0}점  
• 태양인: ${result.scores?.taeyang || 0}점
• 태음인: ${result.scores?.taeeum || 0}점

💡 체질 특성 및 관리법:
(체질별 맞춤 관리법은 한의원에서 상세히 상담받으세요)

🌿 권장사항:
• 체질에 맞는 식단 관리
• 적절한 운동과 생활습관
• 정기적인 한의학적 관리

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 한의학 체질 진단 서비스
정확한 체질 관리: aihpro.com`;
  }
  
  return `한의학 검사 결과
📅 ${timestamp}

${JSON.stringify(result, null, 2)}`;
};