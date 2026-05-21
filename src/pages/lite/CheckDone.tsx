import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';


/**
 * /check/done — Day 3 즉시 리포트
 * - 결제/로그인 0회. 결과 100% 공개. 블러/잠금 없음.
 * - 진단/장애/치료 단어 금지. "참고용 체크", "살펴볼 점" 톤.
 * - CTA: 1순위 "7일 챌린지 시작하기" (mind_track_7 결제), 2순위 "맞춤 치료사 구독" (티저).
 *        위기 점수일 때만 작은 안전망 링크로 /expert-hiring?urgent=true 노출.
 */

type AreaCode = 'language' | 'emotion' | 'social' | 'focus';

type CheckResult = {
  age: string;
  area: AreaCode;
  answers: Record<number, number>;
  questions?: { question_no: number; prompt: string }[];
  total: number;
  submittedAt: string;
};

type AreaCopy = {
  label: string;
  shortLabel: string;
  peer: string;
  observations: string[];
  homeTips: string[];
};

const AREA_COPY: Record<AreaCode, AreaCopy> = {
  language: {
    label: '언어 · 발달',
    shortLabel: '언어',
    peer: '또래보다 표현이 적은 편으로 보여요',
    observations: [
      '하루 중 아이가 먼저 말을 거는 횟수가 줄었는지 살펴보세요.',
      '새 단어를 따라 말하기보다 손짓·표정으로 표현하려는 경향이 있는지 봐 주세요.',
      '질문에 단답형으로만 답하고 대화가 짧게 끊기는 순간이 있는지 떠올려 보세요.',
      '책·영상의 내용을 자기 말로 다시 설명할 때 핵심을 놓치지는 않는지 확인해 주세요.',
      '문장이 짧거나, "이거 · 저거" 같은 지시어에 의존하는 빈도가 늘었는지 살펴보세요.',
    ],
    homeTips: [
      '잠자기 전 5분, 오늘 가장 재밌었던 한 가지를 아이가 직접 말로 설명하게 해 주세요.',
      '그림책 한 페이지를 읽고 "여기서 뭐가 보여?"라고 열린 질문으로 되물어 주세요.',
      '아이의 말을 끊지 않고 끝까지 듣고, 마지막 단어를 한 번 더 따라 말해 주세요.',
      '새 단어를 만나면 "어떤 느낌이야?"라고 감각·감정으로 연결해 설명해 주세요.',
      '하루 한 번, "오늘은 ○○이가 선생님이에요"라며 아이가 부모에게 알려주는 역할극을 만들어 보세요.',
    ],
  },
  emotion: {
    label: '감정 · 행동',
    shortLabel: '감정',
    peer: '또래에 비해 감정 기복이 조금 잦은 편으로 보여요',
    observations: [
      '하루 중 짜증·분노가 올라오는 시간대(아침/등하원/잠자기 전)가 정해져 있는지 살펴보세요.',
      '감정이 격해진 뒤 스스로 진정하는 데 걸리는 시간이 점점 길어지는지 봐 주세요.',
      '감정 표현이 말보다 행동(밀기, 던지기, 울기)으로 먼저 나오는 순간이 있는지 떠올려 보세요.',
      '잠들기·기상 패턴이 흔들리며 컨디션 기복이 함께 커졌는지 확인해 주세요.',
      '평소 좋아하던 활동에도 흥미를 덜 보이는 날이 늘었는지 살펴보세요.',
    ],
    homeTips: [
      '아이가 짜증을 낼 때 "지금 화났구나"라고 감정 단어를 먼저 짚어 주세요.',
      '하루 한 번, 아이와 함께 깊게 숨을 3번 같이 들이쉬고 내쉬는 시간을 만들어 보세요.',
      '아이가 진정된 후 "아까 어떤 마음이었어?"라고 천천히 되짚어 주세요. 훈계는 잠시 미뤄도 괜찮아요.',
      '저녁 루틴을 30분 일찍 시작해 자기 전 흥분을 가라앉힐 여백을 만들어 주세요.',
      '잘한 행동 한 가지를 그날 안에 구체적으로 말로 칭찬해 주세요. ("스스로 진정한 거 멋졌어")',
    ],
  },
  social: {
    label: '사회성 · 학교',
    shortLabel: '사회성',
    peer: '또래에 비해 새로운 관계에서 긴장이 큰 편으로 보여요',
    observations: [
      '아이가 친구 이름을 자주 언급하는지, 아니면 혼자 놀았다는 이야기가 늘었는지 살펴보세요.',
      '새로운 장소·새로운 사람 앞에서 평소보다 말수가 줄어드는지 봐 주세요.',
      '친구와 다툰 뒤 스스로 화해하려는 시도가 있는지, 회피하는지 떠올려 보세요.',
      '눈맞춤·인사 같은 기본적인 사회적 반응이 줄지 않았는지 확인해 주세요.',
      '단체 활동에서 자기 차례나 규칙을 지키는 것을 어려워하는지 살펴보세요.',
    ],
    homeTips: [
      '오늘 어린이집·학교에서 같이 논 친구 한 명의 이름을 자연스럽게 물어봐 주세요.',
      '주말에 1:1로 만날 수 있는 친구 한 명과 짧은 만남(30분~1시간)을 만들어 보세요.',
      '갈등 상황을 "어떻게 말하면 좋았을까?"라고 역할극처럼 함께 연습해 주세요.',
      '아이가 인사·고마움을 표현했을 때, 그 자리에서 짧게 알아채 주세요.',
      '보드게임·카드게임으로 차례 지키기·규칙 따르기를 놀이로 연습해 보세요.',
    ],
  },
  focus: {
    label: '집중력',
    shortLabel: '집중',
    peer: '또래에 비해 한 가지 일을 끝까지 마치는 데 어려움이 있는 편으로 보여요',
    observations: [
      '시작한 활동을 끝까지 마치는 비율이 절반 이하인지 살펴보세요.',
      '주변 소리·움직임에 쉽게 시선이 흩어지는지 봐 주세요.',
      '해야 할 일을 자주 잊거나, 같은 안내를 여러 번 해야 하는지 떠올려 보세요.',
      '숙제·정리 등 해야 할 일을 시작 자체를 미루는 경향이 있는지 확인해 주세요.',
      '물건을 자주 잃어버리거나 같은 실수를 반복하는 빈도가 늘었는지 살펴보세요.',
    ],
    homeTips: [
      '한 번에 하나의 지시만 짧은 문장으로 전달해 주세요. ("책가방 정리해 줘" 하나만)',
      '타이머를 활용해 "10분만 집중" 같은 짧은 단위로 성공 경험을 쌓아 주세요.',
      '책상 위에 지금 필요한 물건만 남기고 나머지는 시야에서 치워 주세요.',
      '시작 전에 "끝나면 ○○하자"라고 마무리 신호를 함께 정해 주세요.',
      '체크리스트를 종이에 그려, 끝낼 때마다 아이가 직접 표시하게 해 주세요.',
    ],
  },
};

/**
 * 발달 이정표 — 나이대 × 영역별 "이맘때 갖춰야 할 능력"
 * 출처: 한국 영유아 발달검사 K-DST / 보건복지부 영유아 건강검진 가이드 / DSM-5 기능 기준을 일상 언어로 번안.
 * 진단 기준이 아니라 "또래 평균에서 흔히 보이는 모습" 참고선이에요.
 */
type AgeBucket = '0-2' | '3-4' | '5-6' | '7-9' | '10-12' | '13+';

function toAgeBucket(age: string): AgeBucket {
  const n = parseInt(String(age).replace(/[^0-9]/g, ''), 10);
  if (!Number.isFinite(n)) return '5-6';
  if (n <= 2) return '0-2';
  if (n <= 4) return '3-4';
  if (n <= 6) return '5-6';
  if (n <= 9) return '7-9';
  if (n <= 12) return '10-12';
  return '13+';
}

const AGE_BUCKET_LABEL: Record<AgeBucket, string> = {
  '0-2': '만 0–2세',
  '3-4': '만 3–4세',
  '5-6': '만 5–6세',
  '7-9': '만 7–9세',
  '10-12': '만 10–12세',
  '13+': '만 13세 이상',
};

const MILESTONES: Record<AreaCode, Record<AgeBucket, string[]>> = {
  language: {
    '0-2': [
      '엄마·아빠 외에 의미 있는 단어 5개 이상 사용해요.',
      '"공 줘" 같은 두 단어 문장을 만들어요.',
      '일상 사물 이름(컵, 신발, 강아지)을 듣고 가리켜요.',
    ],
    '3-4': [
      '"왜?"라는 질문을 자주 하고 자기 경험을 3–4문장으로 이야기해요.',
      '간단한 동화 줄거리를 자기 말로 다시 말해요.',
      '낯선 사람도 알아들을 정도로 발음이 또렷해져요.',
    ],
    '5-6': [
      '오늘 있었던 일을 시간 순서대로 설명할 수 있어요.',
      '반대말·비슷한 말을 이해하고 사용해요.',
      '글자에 관심을 보이고 자기 이름을 읽고 써요.',
    ],
    '7-9': [
      '교과서 한 단락을 읽고 핵심 내용을 요약할 수 있어요.',
      '자기 생각의 이유를 "왜냐하면…"으로 설명해요.',
      '농담·비유를 이해하고 대화의 맥락을 따라가요.',
    ],
    '10-12': [
      '주제를 정해 짧은 글(5–7문장)을 논리적으로 써요.',
      '뉴스·설명문에서 주장과 근거를 구분해요.',
      '토론에서 상대 의견을 듣고 자기 입장을 정리해요.',
    ],
    '13+': [
      '추상적 개념(자유, 책임)을 자기 언어로 설명해요.',
      '글의 의도와 함의를 읽어내요.',
      '발표·토론에서 청중에 맞게 표현을 조절해요.',
    ],
  },
  emotion: {
    '0-2': [
      '낯선 환경에서도 양육자와 다시 만나면 안정돼요.',
      '기쁨·분노·두려움 같은 기본 감정을 표정·울음으로 표현해요.',
      '좋아하는 사람·물건에 분명한 애착을 보여요.',
    ],
    '3-4': [
      '자기 감정을 "화났어", "슬퍼" 같은 말로 표현해요.',
      '짜증이 나도 양육자 도움으로 5–10분 안에 진정해요.',
      '실패한 놀이를 다시 시도하는 회복력이 보여요.',
    ],
    '5-6': [
      '친구가 슬퍼하면 알아채고 위로하려고 해요.',
      '하기 싫은 일도 약속이면 잠시 참을 수 있어요.',
      '꿈·상상과 현실을 구분해서 이야기해요.',
    ],
    '7-9': [
      '실수했을 때 스스로 사과하고 다시 시도해요.',
      '"속상하지만 괜찮아" 식으로 감정을 조절하는 말을 써요.',
      '규칙·공정함에 민감해지고 자기 입장을 설명해요.',
    ],
    '10-12': [
      '감정의 원인을 스스로 돌아보고 일기·말로 정리해요.',
      '스트레스 상황에서 도움을 요청할 사람을 알고 있어요.',
      '실패·비교에 흔들려도 며칠 안에 회복돼요.',
    ],
    '13+': [
      '자기 가치관·정체성에 대해 생각하고 표현해요.',
      '강한 감정 속에서도 충동적 행동을 멈출 수 있어요.',
      '오랜 기분 저하·무기력 신호를 스스로 알아채요.',
    ],
  },
  social: {
    '0-2': [
      '눈맞춤·미소로 양육자와 주고받기를 해요.',
      '간단한 손짓(빠이빠이, 짝짜꿍)을 따라 해요.',
      '다른 아이에게 관심을 보이고 옆에서 함께 놀아요.',
    ],
    '3-4': [
      '간단한 차례(순서) 지키기를 시도해요.',
      '"고마워", "미안해"를 상황에 맞게 사용해요.',
      '역할놀이(엄마놀이, 병원놀이)를 친구와 함께해요.',
    ],
    '5-6': [
      '단짝 친구가 생기고 친구 이름을 자주 언급해요.',
      '규칙 있는 게임에서 이기고 지는 것을 받아들여요.',
      '도움이 필요한 친구를 먼저 챙기는 행동을 보여요.',
    ],
    '7-9': [
      '갈등 상황에서 어른 도움 없이 화해를 시도해요.',
      '소그룹 활동에서 역할을 맡고 책임을 다해요.',
      '친구의 입장을 "걔는 그래서 그랬을 거야"로 이해해요.',
    ],
    '10-12': [
      '또래 집단의 분위기를 읽고 행동을 조절해요.',
      '친구의 부탁을 거절해야 할 때 정중하게 말해요.',
      '여러 친구 사이의 관계를 균형 있게 유지해요.',
    ],
    '13+': [
      '소속감과 자기다움 사이에서 자기 입장을 잡아요.',
      '의견이 다른 사람과도 대화를 이어갈 수 있어요.',
      '신뢰할 어른·친구에게 자기 고민을 나눠요.',
    ],
  },
  focus: {
    '0-2': [
      '좋아하는 장난감에 3–5분 집중해서 놀아요.',
      '이름을 부르면 하던 일을 멈추고 쳐다봐요.',
      '간단한 한 단계 지시("공 줘")를 따라 해요.',
    ],
    '3-4': [
      '한 가지 놀이에 10분 안팎으로 머물러요.',
      '두 단계 지시("신발 신고 가방 가져와")를 수행해요.',
      '시작한 활동을 어른 도움으로 마무리해요.',
    ],
    '5-6': [
      '관심 있는 활동에 15–20분 집중해요.',
      '간단한 규칙·순서를 기억해서 게임에 적용해요.',
      '치우기·정리하기 같은 일과를 안내 한 번에 시작해요.',
    ],
    '7-9': [
      '숙제·과제를 20–30분 정도 앉아서 진행해요.',
      '여러 단계의 지시를 잊지 않고 끝까지 따라가요.',
      '하던 일이 끊겨도 다시 돌아와 마무리해요.',
    ],
    '10-12': [
      '계획표를 짜고 우선순위에 따라 일을 처리해요.',
      '40–50분 단위의 학습·활동을 이어갈 수 있어요.',
      '실수를 점검하고 스스로 고치는 습관이 보여요.',
    ],
    '13+': [
      '장기 과제(1–2주 프로젝트)를 단계별로 관리해요.',
      '주의가 흩어졌을 때 스스로 환경(폰·소음)을 조절해요.',
      '집중과 휴식의 리듬을 자기 방식으로 만들어요.',
    ],
  },
};

/**
 * 영역별 발달 이론 근거 — "왜 이 능력을 봐야 하는가"의 학문적 출처를 일상 언어로.
 */
const AREA_THEORY: Record<AreaCode, { framework: string; rationale: string; source: string }> = {
  language: {
    framework: '비고츠키 근접발달영역(ZPD) · 한국 영유아 발달검사(K-DST) 언어 영역',
    rationale:
      '언어는 사고를 담는 그릇이라 어휘·문장 구조가 늘어나는 시기는 인지 발달의 결정적 창이에요. 이 시기에 충분한 대화·읽기 경험이 쌓이면 이후 학습·정서 조절의 토대가 됩니다.',
    source: '출처: Vygotsky(1978), 보건복지부 K-DST 가이드, ASHA 아동 언어발달 단계',
  },
  emotion: {
    framework: '애착 이론(Bowlby) · 감정 코칭(Gottman) · 자기조절(Self-Regulation, Kopp)',
    rationale:
      '감정을 단어로 표현하고 진정하는 능력은 뇌의 전전두엽이 천천히 성숙하며 만들어져요. 양육자가 감정을 비춰주고 함께 진정해 주는 경험이 가장 강력한 학습 자극입니다.',
    source: '출처: Bowlby(1969), Gottman(1997), Kopp(1989) 자기조절 발달 모델',
  },
  social: {
    framework: '에릭슨 심리사회 발달 · 마음이론(Theory of Mind, Premack & Woodruff)',
    rationale:
      '또래와 차례·역할·갈등을 경험하는 시기마다 "나와 다른 사람의 마음"을 추론하는 능력이 한 단계씩 자라요. 작은 협력·갈등 회복 경험이 이후 사회성·자존감의 뿌리가 됩니다.',
    source: '출처: Erikson(1950), Premack & Woodruff(1978), 한국 아동 사회성 발달 척도',
  },
  focus: {
    framework: '실행기능(Executive Function, Diamond) · 작업기억(Baddeley)',
    rationale:
      '집중·억제·전환은 따로따로가 아니라 "실행기능"이라는 한 묶음으로 자라요. 같은 나이라도 환경 자극 양·수면·놀이 경험에 따라 발달 속도 차이가 크므로 일상 루틴이 중요합니다.',
    source: '출처: Diamond(2013) Executive Functions, Baddeley(2003) Working Memory',
  },
};

/**
 * 나이대별 발달 창(window) — "지금 이 시기에 무엇이 한창 자라는가" 한 문단.
 */
const BUCKET_WINDOW: Record<AgeBucket, string> = {
  '0-2':
    '애착과 기본 신뢰가 빠르게 형성되는 시기예요. 양육자와의 반복된 상호작용 자체가 뇌 회로를 만드는 학습입니다.',
  '3-4':
    '"나"라는 자아가 또렷해지며 언어·감정·놀이가 폭발적으로 확장되는 시기예요. 일상에서 작은 선택을 경험하는 것이 자율성 발달에 핵심입니다.',
  '5-6':
    '학교 입학을 앞두고 규칙·역할·또래 관계를 본격적으로 익히는 시기예요. 호기심과 실수를 환영해 주는 환경이 자기효능감을 키웁니다.',
  '7-9':
    '논리적 사고와 또래 비교가 함께 시작되는 시기예요. "잘하는 나" 외에 "노력하는 나"를 알아봐 주는 피드백이 학습 동기를 지킵니다.',
  '10-12':
    '추상적 사고와 자기 정체감의 씨앗이 자라는 시기예요. 어른의 통제는 줄이고 함께 의논하는 대화가 자기조절을 강화합니다.',
  '13+':
    '정체성·또래 소속감·자율성이 한꺼번에 자라는 시기예요. 평가보다 경청, 지시보다 선택지가 안전한 어른 신호로 작동합니다.',
};

/**
 * 영역 × 나이대 — "이런 신호가 2주 이상 지속되면 전문가와 상의" 가이드.
 * 진단이 아니라 "주의 깊게 관찰할 신호"임을 분명히 합니다.
 */
const AREA_WATCH_SIGNS: Record<AreaCode, Partial<Record<AgeBucket, string[]>>> = {
  language: {
    '0-2': ['18개월 이후에도 의미 단어 사용이 거의 없을 때', '이름을 불러도 반복적으로 반응이 없을 때'],
    '3-4': ['낯선 어른이 아이 말을 절반 이상 알아듣지 못할 때', '두 단어 이상의 문장 사용이 거의 없을 때'],
    '5-6': ['자기 이름을 또래 대비 매우 어려워할 때', '대화가 한두 마디 후 자주 끊어질 때'],
    '7-9': ['교과서 한 문단 읽기를 또래 대비 크게 어려워할 때', '하루 일과를 거의 설명하지 못할 때'],
    '10-12': ['짧은 글 쓰기를 회피·거부하는 빈도가 잦아질 때', '비유·농담을 거의 이해하지 못해 또래 관계가 힘들 때'],
    '13+': ['수업 내용을 자기 말로 거의 옮기지 못할 때', '자기 의견을 말하기를 지속적으로 회피할 때'],
  },
  emotion: {
    '0-2': ['양육자와 만나도 진정되지 않고 30분 이상 지속되는 울음', '눈맞춤·미소가 매우 드물 때'],
    '3-4': ['하루 여러 차례 30분 이상 진정되지 않는 감정 폭발', '자해(머리 박기, 깨물기)가 반복될 때'],
    '5-6': ['친구·가족과 거의 즐거움을 느끼지 못한다고 말할 때', '잠들기·식사 패턴이 2주 이상 무너질 때'],
    '7-9': ['죽음·사라짐을 자주 이야기할 때 (즉시 전문가)', '학교 거부가 1주 이상 이어질 때'],
    '10-12': ['자해 흔적·자해 충동을 말할 때 (즉시 전문가)', '2주 이상 의욕 저하·고립이 이어질 때'],
    '13+': ['자해·자살에 대한 구체적 생각·계획을 말할 때 (즉시 전문가)', '한 달 이상 무기력·고립이 이어질 때'],
  },
  social: {
    '0-2': ['이름을 불러도 거의 쳐다보지 않을 때', '양육자와의 분리 후 다시 만나도 위로받지 못할 때'],
    '3-4': ['또래·어른 모두에게 거의 관심을 보이지 않을 때', '같은 행동을 30분 이상 반복하며 다른 자극에 반응이 없을 때'],
    '5-6': ['한 학기 이상 친구 한 명도 만들기 어려울 때', '단체 활동을 매번 강하게 거부할 때'],
    '7-9': ['친구와 갈등이 매주 반복되며 회복이 어려울 때', '학교에서 혼자 점심을 먹는 일이 지속될 때'],
    '10-12': ['따돌림·따돌리는 행동의 신호가 보일 때', '2주 이상 친구·가족과 대화를 차단할 때'],
    '13+': ['거의 모든 또래 관계를 끊고 1개월 이상 고립될 때', '도움 요청을 강하게 거부하면서 위험 신호를 보일 때'],
  },
  focus: {
    '0-2': ['좋아하는 자극에도 1분 이상 머무르지 못할 때', '이름·소리에 거의 반응하지 않을 때'],
    '3-4': ['한 가지 놀이에 3분 이상 머무르지 못하는 날이 대부분일 때', '위험 인지 없이 충동적으로 뛰어드는 행동이 반복될 때'],
    '5-6': ['단순한 두 단계 지시도 매번 잊어버릴 때', '교실에서 자리에 거의 앉아 있지 못할 때'],
    '7-9': ['숙제 시작 자체가 매일 1시간 이상 걸릴 때', '같은 실수를 한 학기 이상 반복할 때'],
    '10-12': ['시험·과제 마감을 지속적으로 놓치며 일상에 지장이 클 때', '계획·정리가 또래 대비 크게 뒤처질 때'],
    '13+': ['중요 일정·약속을 반복적으로 잊어 학업·관계 손상이 클 때', '집중을 위해 부적절한 자극(과한 카페인 등)에 의존할 때'],
  },
};



/**
 * 발달 점수 (높을수록 좋음). 5문항 × 5점척도 → 최소 5, 최대 25.
 * 발달 점수 = ((max - total) / (max - min)) × 100.
 */
function toScore(total: number, questionCount: number = 5): number {
  const min = questionCount;
  const max = questionCount * 5;
  const pct = Math.max(0, Math.min(100, Math.round(((max - total) / (max - min)) * 100)));
  return pct;
}

/** 응답 강도 라벨 (1~5점 → 짧은 해석 문구) */
function answerInsight(v: number): { tag: string; tone: string } {
  if (v <= 1) return { tag: '전혀 아니다', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (v === 2) return { tag: '드물게 보임', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (v === 3) return { tag: '가끔 보임', tone: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (v === 4) return { tag: '자주 보임', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
  return { tag: '매우 자주 보임', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
}

/** 또래 평균 (참고치, 75점 기준). 실데이터 누적 전 임시 벤치마크. */
const PEER_AVG = 75;

/** 또래 대비 상태 카피. 발달 점수가 높을수록 편안한 톤. */
function toToneLabel(score: number): { tag: string; color: string } {
  if (score >= PEER_AVG) return { tag: '또래 평균 수준', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= PEER_AVG - 20) return { tag: '살펴볼 점이 있어요', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { tag: '함께 봐 주시면 좋아요', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

/** 또래 평균과의 비교 한 줄 (위협적이지 않게). */
function toPeerLine(score: number): string {
  const gap = score - PEER_AVG;
  if (gap >= 5) return `또래 평균(${PEER_AVG}점)보다 ${gap}점 높아요`;
  if (gap >= -4) return `또래 평균(${PEER_AVG}점)과 비슷한 수준이에요`;
  return `또래 평균(${PEER_AVG}점)보다 ${Math.abs(gap)}점 낮은 편이에요`;
}

const CheckDone: React.FC = () => {
  const navigate = useNavigate();
  const [milestoneDetailOpen, setMilestoneDetailOpen] = useState(false);


  const result = useMemo<CheckResult | null>(() => {
    try {
      const raw = sessionStorage.getItem('lite_check_result');
      if (!raw) return null;
      return JSON.parse(raw) as CheckResult;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!result) {
      // 직접 진입 시 체크로 유도
      navigate('/check', { replace: true });
      return;
    }
    // 발달체크 1회 완료 마커 — 다음 방문 시 홈으로 자동 라우팅
    try { localStorage.setItem('aihpro_check_done', '1'); } catch {}
  }, [result, navigate]);

  if (!result) return null;

  const copy = AREA_COPY[result.area];
  const questionCount = result.questions?.length || Object.keys(result.answers).length || 5;
  const score = toScore(result.total, questionCount);
  const tone = toToneLabel(score);
  // 하이라이트: 가장 강하게(4~5) 표시된 문항 추출
  const highlights = (result.questions ?? [])
    .map((q) => ({ ...q, value: result.answers[q.question_no] ?? 0 }))
    .filter((q) => q.value >= 4)
    .sort((a, b) => b.value - a.value);
  // 위기 안전망: 전체 점수 매우 낮거나, 감정 영역에서 평균 이하
  const showSafetyNet = score < 40 || (result.area === 'emotion' && score < 50);

  return (
    <div className="min-h-screen bg-white text-slate-900 break-keep flex flex-col">
      {/* 상단 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 text-[15px]"
            aria-label="홈으로"
          >
            ←
          </button>
          <span className="text-[14px] font-medium text-slate-700">참고용 체크 결과</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-40">
        {/* 영역/안내 */}
        <p className="text-[13px] text-slate-500 mb-1">{copy.label}</p>
        <h1 className="text-[22px] font-bold leading-snug mb-5">
          오늘 {copy.shortLabel}에 대해
          <br />이런 점을 함께 봐요
        </h1>

        {/* 큰 숫자 카드 */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-7 mb-3">
          <div className="flex items-end gap-2">
            <span className="text-[15px] font-medium text-slate-600">{copy.shortLabel}</span>
            <span className="text-[64px] leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">
              {score}
            </span>
            <span className="text-[18px] font-semibold text-slate-500 mb-2">점</span>
            <span className="text-[12px] text-slate-400 mb-3 ml-1">/ 100</span>
          </div>
          <p className="text-[13px] text-slate-600 mt-2">{toPeerLine(score)}</p>

          {/* 또래 평균 비교 막대 */}
          <div className="mt-4">
            <div className="relative h-2 rounded-full bg-slate-200 overflow-visible">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all"
                style={{ width: `${score}%` }}
              />
              {/* 또래 평균 마커 */}
              <div
                className="absolute -top-1 -translate-x-1/2"
                style={{ left: `${PEER_AVG}%` }}
                aria-label={`또래 평균 ${PEER_AVG}점`}
              >
                <div className="w-0.5 h-4 bg-amber-500 mx-auto" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-slate-400 tabular-nums">
              <span>0</span>
              <span className="text-amber-600">또래 평균 {PEER_AVG}점</span>
              <span>100</span>
            </div>
          </div>

          <div className={`inline-flex items-center mt-4 px-3 py-1 rounded-full text-[12px] font-medium border ${tone.color}`}>
            {tone.tag}
          </div>
        </section>
        <p className="text-[12px] text-slate-400 mb-8">
          ※ 진단이 아닌, 부모님이 일상에서 살펴보시도록 돕는 참고용 체크예요. 점수는 높을수록 또래 평균에 가깝습니다.
        </p>

        {/* 이맘때 갖춰야 할 능력 — 나이대 × 영역별 발달 이정표 */}
        {(() => {
          const bucket = toAgeBucket(result.age);
          const items = MILESTONES[result.area][bucket];
          const theory = AREA_THEORY[result.area];
          const windowText = BUCKET_WINDOW[bucket];
          const watchSigns = AREA_WATCH_SIGNS[result.area][bucket] ?? [];
          return (
            <section className="mb-8 rounded-3xl border border-[#C8B88A]/40 bg-[#FBF8F1] px-5 py-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] tracking-[0.18em] text-[#8a7a4a] font-semibold">
                  MILESTONE · {AGE_BUCKET_LABEL[bucket]}
                </span>
              </div>
              <h2 className="text-[17px] font-semibold mb-1 text-slate-900">
                이맘때 {copy.shortLabel} 영역에서<br />갖춰야 할 능력
              </h2>
              <p className="text-[12px] text-slate-500 mb-4">
                또래 평균에서 흔히 보이는 모습이에요. 모두 갖춰야 한다는 뜻은 아니에요.
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((it, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C8B88A] shrink-0" />
                    <p className="text-[14px] leading-relaxed text-slate-800">{it}</p>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setMilestoneDetailOpen(true)}
                className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-[#C8B88A]/60 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#8a7a4a] hover:bg-[#FBF8F1] transition"
              >
                상세보기 — 더 깊이 있는 발달 정보
                <span aria-hidden>→</span>
              </button>

              <Dialog open={milestoneDetailOpen} onOpenChange={setMilestoneDetailOpen}>
                <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-0">
                  <div className="px-6 pt-6 pb-2">
                    <DialogHeader>
                      <div className="text-[11px] tracking-[0.18em] text-[#8a7a4a] font-semibold mb-1">
                        MILESTONE 상세 · {AGE_BUCKET_LABEL[bucket]} · {copy.shortLabel}
                      </div>
                      <DialogTitle className="text-[18px] leading-snug text-slate-900 break-keep">
                        이 시기 {copy.shortLabel} 발달, 무엇을 어떻게 봐야 할까요?
                      </DialogTitle>
                      <DialogDescription className="text-[12px] text-slate-500 break-keep">
                        진단이 아닌, 부모님이 일상에서 신호를 읽고 함께 자라도록 돕는 참고 자료예요.
                      </DialogDescription>
                    </DialogHeader>
                  </div>

                  <div className="px-6 pb-6 space-y-5">
                    {/* 01 발달 창 */}
                    <section className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4">
                      <div className="text-[11px] tracking-[0.16em] text-slate-500 font-semibold mb-1">
                        01 · 지금 이 시기의 발달 창
                      </div>
                      <p className="text-[14px] leading-relaxed text-slate-800 break-keep">{windowText}</p>
                    </section>

                    {/* 02 이론 근거 */}
                    <section className="rounded-2xl border border-[#C8B88A]/40 bg-[#FBF8F1] px-4 py-4">
                      <div className="text-[11px] tracking-[0.16em] text-[#8a7a4a] font-semibold mb-1">
                        02 · 이론적 근거
                      </div>
                      <p className="text-[13px] font-semibold text-slate-900 mb-1.5">{theory.framework}</p>
                      <p className="text-[13.5px] leading-relaxed text-slate-700 break-keep">
                        {theory.rationale}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2">{theory.source}</p>
                    </section>

                    {/* 03 갖춰야 할 능력 (재정리) */}
                    <section>
                      <div className="text-[11px] tracking-[0.16em] text-slate-500 font-semibold mb-2">
                        03 · 또래에서 흔히 보이는 모습
                      </div>
                      <ul className="flex flex-col gap-2">
                        {items.map((it, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C8B88A] shrink-0" />
                            <p className="text-[13.5px] leading-relaxed text-slate-800 break-keep">{it}</p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* 04 가정 관찰 포인트 */}
                    <section>
                      <div className="text-[11px] tracking-[0.16em] text-slate-500 font-semibold mb-2">
                        04 · 가정에서 살펴볼 포인트
                      </div>
                      <ul className="flex flex-col gap-2">
                        {copy.observations.map((it, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <p className="text-[13.5px] leading-relaxed text-slate-700 break-keep">{it}</p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* 05 일상 액션 */}
                    <section>
                      <div className="text-[11px] tracking-[0.16em] text-slate-500 font-semibold mb-2">
                        05 · 오늘부터 해볼 수 있는 일
                      </div>
                      <ul className="flex flex-col gap-2">
                        {copy.homeTips.map((it, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <p className="text-[13.5px] leading-relaxed text-slate-700 break-keep">{it}</p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* 06 주의 깊게 볼 신호 */}
                    {watchSigns.length > 0 && (
                      <section className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-4">
                        <div className="text-[11px] tracking-[0.16em] text-rose-700 font-semibold mb-2">
                          06 · 2주 이상 이어지면 전문가와 상의해 볼 신호
                        </div>
                        <ul className="flex flex-col gap-2">
                          {watchSigns.map((it, idx) => (
                            <li key={idx} className="flex gap-2.5 items-start">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <p className="text-[13.5px] leading-relaxed text-slate-800 break-keep">{it}</p>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-rose-700/80 mt-2 leading-relaxed">
                          ※ 위 신호는 진단 기준이 아니라 관찰 가이드입니다. 일상에 지장이 크면 가까운 전문가에게 상담해 보세요.
                        </p>
                      </section>
                    )}

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      ※ 본 자료는 K-DST, DSM-5, 발달심리 표준 이론을 일상 언어로 재구성한 참고 자료이며,
                      의학적 진단·치료를 대체하지 않습니다.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </section>
          );
        })()}


        {/* 문항별 살펴보기 — 응답을 그대로 다시 비춰 줘 깊이감을 더함 */}
        {result.questions && result.questions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[17px] font-semibold mb-1">문항별 살펴보기</h2>
            <p className="text-[12px] text-slate-500 mb-3">
              총 {result.questions.length}개 문항 · 합산 {result.total}점
              {highlights.length > 0 && ` · 눈에 띄는 항목 ${highlights.length}개`}
            </p>
            <ul className="flex flex-col gap-2.5">
              {result.questions.map((q, idx) => {
                const v = result.answers[q.question_no] ?? 0;
                const ins = answerInsight(v);
                return (
                  <li key={q.question_no} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] leading-relaxed text-slate-800 flex-1">
                        <span className="text-slate-400 mr-1 tabular-nums">{idx + 1}.</span>
                        {q.prompt}
                      </p>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${ins.tone}`}>
                        {ins.tag}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`h-1.5 flex-1 rounded-full ${n <= v ? (v >= 4 ? 'bg-rose-400' : v === 3 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-100'}`}
                        />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 살펴보면 좋을 점 */}
        <section className="mb-8">
          <h2 className="text-[17px] font-semibold mb-3">살펴보면 좋을 점</h2>
          <ul className="flex flex-col gap-3">
            {copy.observations.map((obs, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <p className="text-[15px] leading-relaxed text-slate-800">{obs}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 오늘 집에서 해볼 것 */}
        <section className="mb-8">
          <h2 className="text-[17px] font-semibold mb-3">오늘 집에서 해볼 것</h2>
          <ol className="flex flex-col gap-3">
            {copy.homeTips.map((tip, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[12px] font-semibold flex items-center justify-center tabular-nums">
                  {idx + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-slate-800">{tip}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 안내 */}
        <p className="text-[12px] text-slate-400 leading-relaxed">
          이 결과는 만 {result.age}세 아이의 최근 1~2주 모습을 부모님이 직접 체크한 내용으로 만들어졌어요.
          의료적 판단을 대신하지 않으며, 걱정이 길어진다면 가까운 전문가와 한 번 이야기 나눠 보시길 권해요.
        </p>
      </main>

      {/* 하단 CTA — 7일 챌린지 메인 + 치료사 구독 보조 + (조건부) 안전망 */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-slate-100">
        <div className="max-w-md mx-auto px-5 pt-3 pb-4 flex flex-col gap-2">
          <p className="text-[12px] text-slate-500 text-center mb-0.5">
            카드 등록 없이 · 지금 바로 시작
          </p>

          {/* 메인: 3일 무료 체험 */}
          <Link
            to={`/mind-track?audience=child&from=check&area=${result.area}&age=${encodeURIComponent(result.age)}&score=${score}`}
            className="w-full rounded-2xl bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between active:scale-[0.99] transition"
          >
            <span className="flex flex-col items-start">
              <span className="text-[17px] font-semibold leading-tight">3일 무료 체험 시작하기</span>
              <span className="text-[11px] text-white/70 mt-0.5">
                {copy.shortLabel} 7일 부모 코칭 · 4일차부터 ₩{MIND_TRACK_7_PRICE.toLocaleString('ko-KR')}
              </span>
            </span>
            <span className="text-[18px]">→</span>
          </Link>

          {/* 보조: 맞춤 치료사 구독 */}
          <Link
            to={`/therapist-subscription?from=check&area=${result.area}`}
            className="w-full rounded-2xl bg-white border border-[#C8B88A]/50 text-slate-900 px-5 py-2.5 flex items-center justify-between hover:bg-[#C8B88A]/5 transition"
          >
            <span className="flex flex-col items-start">
              <span className="text-[14px] font-semibold leading-tight">맞춤 치료사 구독 알아보기</span>
              <span className="text-[11px] text-slate-500 mt-0.5">내 아이에 맞는 치료사 매칭 · 월간 정기 코칭</span>
            </span>
            <span className="text-[14px] text-[#8a7a4a]">→</span>
          </Link>

          {/* 위기 안전망 — 조건부 */}
          {showSafetyNet && (
            <>
              <Link
                to="/expert-hiring?urgent=true"
                className="text-center text-[12px] text-slate-400 underline underline-offset-2 hover:text-slate-600 mt-1"
              >
                걱정이 크다면 전문가에게 바로 도움받기
              </Link>
              <Link
                to={`/find-center?region=${encodeURIComponent('서울')}`}
                className="text-center text-[12px] text-slate-400 underline underline-offset-2 hover:text-slate-600"
              >
                우리 동네 기관 찾기
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckDone;
