import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Frown, Smile, Sparkles } from 'lucide-react';
import { MIND_TRACK_PRICE } from '@/constants/tokenCosts';

interface BeforeAfterCardProps {
  /** 결제 CTA 클릭 핸들러 (선택) */
  onPayClick?: () => void;
}

type Topic = {
  key: string;
  label: string;
  before: string[];
  after: string[];
};

const TOPICS: Topic[] = [
  {
    key: 'stress',
    label: '스트레스·번아웃',
    before: [
      '아침에 눈뜨는 게 두려워요',
      '잠을 자도 피곤이 안 풀려요',
      '작은 일에도 마음이 무너져요',
      '내가 뭘 원하는지 모르겠어요',
    ],
    after: [
      '아침 5분, 마음 정리 습관이 생겼어요',
      '수면 루틴이 잡혀 깊이 잠들어요',
      '무너져도 다시 일어서는 회복탄력성',
      '내 감정·목표·가치를 또렷이 알아요',
    ],
  },
  {
    key: 'development',
    label: '아이 발달지연',
    before: [
      '또래보다 말이 늦은 것 같아 불안해요',
      '어디서부터 봐야 할지 막막해요',
      '병원 가기 전, 뭘 준비해야 할지 모르겠어요',
      '검사 결과를 받아도 해석이 어려워요',
    ],
    after: [
      '언어·운동·인지·사회성 7개 영역을 한눈에 파악',
      '아이 연령에 맞는 가정 자극 활동을 매일 받아요',
      '전문가 상담 전 정리된 관찰 리포트 보유',
      '결과를 부모 친화 언어로 해석해 드려요',
    ],
  },
  {
    key: 'depression',
    label: '우울·무기력',
    before: [
      '하루 종일 가라앉은 느낌이에요',
      '좋아하던 것도 재미없어요',
      '아무것도 시작할 힘이 없어요',
      '누구에게 말해야 할지 모르겠어요',
    ],
    after: [
      '하루 1개의 작은 행동 미션으로 리듬 회복',
      '기분 변화를 30일 그래프로 직접 확인',
      '회복 단계별 맞춤 콘텐츠 자동 추천',
      '위급할 땐 전문가 매칭으로 바로 연결',
    ],
  },
  {
    key: 'anxiety',
    label: '불안·걱정',
    before: [
      '심장이 두근거려 잠들기 어려워요',
      '머릿속이 항상 바쁘게 돌아가요',
      '최악의 상황이 자꾸 떠올라요',
      '사람 만나는 게 부담스러워요',
    ],
    after: [
      '호흡·이완 루틴이 몸에 배었어요',
      '걱정 분리 글쓰기로 생각이 정돈돼요',
      '불안 트리거를 알고 미리 대비할 수 있어요',
      '관계 상황별 대응 스크립트가 생겼어요',
    ],
  },
  {
    key: 'relationship',
    label: '관계·소통',
    before: [
      '가족과 자꾸 부딪혀요',
      '내 감정을 말로 표현하기 어려워요',
      '거절을 못해서 늘 지쳐요',
      '연인/배우자와 대화가 끊겨요',
    ],
    after: [
      '나의 애착·소통 스타일을 객관적으로 이해',
      '갈등 상황별 비폭력 대화 템플릿 활용',
      '건강한 거리두기와 경계 설정 가능',
      '관계 회복을 위한 30일 실천 미션 수행',
    ],
  },
];

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ onPayClick }) => {
  const [activeKey, setActiveKey] = useState<string>(TOPICS[0].key);
  const active = TOPICS.find((t) => t.key === activeKey) ?? TOPICS[0];

  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-6">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Before / After
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          30일 후, 당신의 마음은 이렇게 달라집니다
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep">
          관심 있는 주제를 선택해 보세요. 실제 졸업자들이 가장 많이 보고한 변화입니다
        </p>
      </div>

      {/* 주제 탭 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {TOPICS.map((t) => {
          const isActive = t.key === activeKey;
          return (
            <button
              key={t.key}
              onClick={() => setActiveKey(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-foreground/40'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch"
        >
          {/* BEFORE */}
          <div className="rounded-2xl border border-slate-300 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                <Frown className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Before
                </div>
                <div className="text-sm font-bold text-slate-900">지금의 나</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              {active.before.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-800 flex gap-2 break-keep leading-relaxed"
                >
                  <span className="text-slate-400 flex-shrink-0">·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ARROW + 가격 */}
          <div className="flex md:flex-col items-center justify-center gap-2 md:px-2">
            <div className="hidden md:block w-px h-10 bg-border" />
            <div className="rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold whitespace-nowrap shadow-lg">
              ₩{MIND_TRACK_PRICE.toLocaleString()} · 30일
            </div>
            <ArrowRight className="w-6 h-6 text-foreground md:rotate-90 hidden md:block" />
            <ArrowRight className="w-6 h-6 text-foreground md:hidden" />
            <div className="hidden md:block w-px h-10 bg-border" />
          </div>

          {/* AFTER */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-white p-5 md:p-6 relative overflow-hidden shadow-sm">
            <Sparkles className="absolute top-3 right-3 w-4 h-4 text-emerald-500" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center">
                <Smile className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                  After
                </div>
                <div className="text-sm font-bold text-slate-900">30일 후의 나</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              {active.after.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-900 font-medium flex gap-2 break-keep leading-relaxed"
                >
                  <span className="text-emerald-600 flex-shrink-0 font-bold">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>

      {onPayClick && (
        <div className="text-center mt-6">
          <button
            onClick={onPayClick}
            className="text-sm text-primary hover:underline font-medium"
          >
            바로 30일 변화 시작하기 →
          </button>
        </div>
      )}
    </section>
  );
};

export default BeforeAfterCard;
