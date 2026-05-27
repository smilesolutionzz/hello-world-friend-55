// 사용자가 입력한 고민 텍스트에서 주제를 추정해 YouTube 검색용
// 큐레이션 키워드로 변환합니다. 원문을 그대로 검색어로 넣으면
// "언어" → "영국영어 팟캐스트" 처럼 엉뚱한 학습 영상이 추천되는 문제가
// 있어, 항상 "치료/상담/코칭/육아" 등 도메인 키워드를 강제로 prepend 합니다.

type Topic =
  | 'language_therapy'
  | 'speech_delay'
  | 'developmental_delay'
  | 'motor_delay'
  | 'autism'
  | 'adhd'
  | 'parenting_stress'
  | 'school_refusal'
  | 'academic_stress'
  | 'peer_relationship'
  | 'sleep'
  | 'depression'
  | 'anxiety'
  | 'panic'
  | 'anger'
  | 'couple'
  | 'workplace'
  | 'self_esteem'
  | 'general';

// 우선순위 순서로 검사 (위에 있을수록 더 구체적)
const TOPIC_RULES: { topic: Topic; keywords: RegExp }[] = [
  { topic: 'language_therapy', keywords: /(언어치료|말이 늦|말을 안 ?해|발화|어휘|문장이 짧|말 트|언어발달|조음|발음|구화|말더듬)/i },
  { topic: 'speech_delay',     keywords: /(말이 ?늦|말 ?안 ?나|언어 ?지연|또래보다 ?말)/i },
  { topic: 'autism',           keywords: /(자폐|asd|상동행동|눈맞춤|반향어|에코랄리아)/i },
  { topic: 'adhd',             keywords: /(adhd|산만|집중이 ?안|충동|가만히 ?못)/i },
  { topic: 'motor_delay',      keywords: /(못 ?걸|뒤집기|기지 ?못|소근육|대근육|운동발달)/i },
  { topic: 'developmental_delay', keywords: /(발달지연|또래보다 ?느|개월수|발달검사|영유아검진)/i },
  { topic: 'school_refusal',   keywords: /(등교거부|학교 ?안 ?가|학교 ?가기 ?싫)/i },
  { topic: 'academic_stress',  keywords: /(공부|성적|시험|입시|학원|수능)/i },
  { topic: 'peer_relationship',keywords: /(친구|따돌림|왕따|또래관계|사회성)/i },
  { topic: 'parenting_stress', keywords: /(육아|훈육|아이 ?키우|엄마 ?번아웃|양육스트레스)/i },
  { topic: 'couple',           keywords: /(부부|이혼|배우자|남편|아내|연인|이별)/i },
  { topic: 'workplace',        keywords: /(직장|상사|회사|번아웃|퇴사|업무)/i },
  { topic: 'sleep',            keywords: /(불면|잠이 ?안|수면|잠 ?못)/i },
  { topic: 'panic',            keywords: /(공황|숨이 ?안|호흡곤란)/i },
  { topic: 'anxiety',          keywords: /(불안|걱정|초조|두려움|무서)/i },
  { topic: 'depression',       keywords: /(우울|무기력|의욕 ?없|허무|슬프)/i },
  { topic: 'anger',            keywords: /(분노|화가 ?나|짜증|폭발|참을 ?수 ?없)/i },
  { topic: 'self_esteem',      keywords: /(자존감|자신감|비교|열등)/i },
];

const KO_QUERIES: Record<Topic, string> = {
  language_therapy:     '언어치료 가정에서 도와주는 방법',
  speech_delay:         '말이 늦은 아이 언어치료 가이드',
  developmental_delay:  '발달지연 부모 가이드 발달치료',
  motor_delay:          '영유아 운동발달 지연 가정 놀이',
  autism:               '자폐스펙트럼 부모교육 조기개입',
  adhd:                 'ADHD 부모 코칭 집중력 향상',
  parenting_stress:     '육아 번아웃 회복 부모 자기돌봄',
  school_refusal:       '등교거부 아이 부모 대처법',
  academic_stress:      '학업 스트레스 학생 멘탈 관리',
  peer_relationship:    '아이 친구관계 사회성 코칭',
  sleep:                '불면증 수면위생 마음챙김 명상',
  depression:           '우울감 회복 자기돌봄 마음챙김',
  anxiety:              '불안 다스리는 호흡법 마음챙김',
  panic:                '공황장애 호흡법 인지행동치료',
  anger:                '분노조절 감정조절 코칭',
  couple:               '부부관계 회복 의사소통 코칭',
  workplace:            '직장 번아웃 회복 멘탈 관리',
  self_esteem:          '자존감 회복 자기돌봄 코칭',
  general:              '마음챙김 자기돌봄 심리상담 가이드',
};

const EN_QUERIES: Record<Topic, string> = {
  language_therapy:     'speech therapy techniques for parents',
  speech_delay:         'late talker speech therapy guide',
  developmental_delay:  'developmental delay parent guide early intervention',
  motor_delay:          'infant motor delay home activities',
  autism:               'autism parent training early intervention',
  adhd:                 'ADHD parent coaching focus strategies',
  parenting_stress:     'parental burnout recovery self care',
  school_refusal:       'school refusal parent strategies',
  academic_stress:      'academic stress mental health for students',
  peer_relationship:    'social skills coaching kids friendship',
  sleep:                'insomnia sleep hygiene mindfulness',
  depression:           'overcoming depression self care mindfulness',
  anxiety:              'managing anxiety breathing mindfulness',
  panic:                'panic attack breathing CBT',
  anger:                'anger management emotion regulation',
  couple:               'couples communication therapy',
  workplace:            'workplace burnout recovery mental health',
  self_esteem:          'self esteem self compassion coaching',
  general:              'mindfulness self care counseling guide',
};

export function buildConcernYoutubeQuery(
  text: string,
  isEnglish: boolean,
): string {
  const detected =
    TOPIC_RULES.find((r) => r.keywords.test(text))?.topic ?? 'general';
  return isEnglish ? EN_QUERIES[detected] : KO_QUERIES[detected];
}
