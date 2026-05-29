import { X, Download, Printer, Sparkles, TrendingUp, Heart, Target, MessageCircle, Calendar, Award, BookOpen, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  clientName?: string;
  period?: string;
}

/**
 * 데모용 고퀄리티 부모 월간 리포트 샘플.
 * 실제 발행 시에는 동일 레이아웃에 LLM 생성 텍스트가 주입됩니다.
 */
export default function SampleParentReport({ open, onClose, clientName = "민준 (5세)", period = "2026년 4월" }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="bg-[#FAF7F0] rounded-3xl w-full max-w-4xl shadow-2xl my-4 overflow-hidden">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Sparkles className="w-4 h-4 text-[#C8B88A]" />
            <span className="font-medium text-neutral-800">샘플 리포트 미리보기</span>
            <span className="hidden sm:inline text-neutral-400">— 실제 발행 시 동일 레이아웃으로 자동 생성됩니다</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs rounded-full hover:bg-neutral-100 inline-flex items-center gap-1.5 text-neutral-700"><Printer className="w-3.5 h-3.5" /> 인쇄</button>
            <button className="px-3 py-1.5 text-xs rounded-full hover:bg-neutral-100 inline-flex items-center gap-1.5 text-neutral-700"><Download className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Report body */}
        <div className="px-8 sm:px-14 py-12 space-y-12">

          {/* Cover */}
          <header className="border-b border-[#C8B88A]/40 pb-10">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-[#C8B88A] uppercase mb-6">
              <span className="w-8 h-px bg-[#C8B88A]" />
              Monthly Parent Report · 01
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif text-neutral-900 leading-tight mb-3">
              {clientName} 보호자께
            </h1>
            <p className="text-lg text-neutral-600">{period} · 햇살 발달치료센터</p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "참여 회기", value: "12회" },
                { label: "출석률", value: "100%" },
                { label: "치료 영역", value: "언어·놀이" },
                { label: "담당 치료사", value: "김민지" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <div className="text-[11px] text-neutral-500 uppercase tracking-wider">{s.label}</div>
                  <div className="text-lg font-semibold text-neutral-900 mt-1">{s.value}</div>
                </div>
              ))}
            </div>
          </header>

          {/* 01 - Executive summary */}
          <section>
            <SectionLabel num="01" title="이번 달 한눈에" />
            <div className="bg-white rounded-3xl p-8 border border-neutral-200">
              <p className="text-neutral-800 leading-relaxed text-[15px]">
                4월 한 달간 민준이는 <strong className="text-neutral-900">총 12회기를 빠짐없이 참여</strong>했고,
                특히 <strong>표현언어 영역에서 의미 있는 진전</strong>을 보였습니다. 지난달 평균 3어절에 머물던
                자발 발화가 이번 달에는 4-5어절로 확장되었으며, 또래와의 협동 놀이 상황에서 먼저 말을 거는 시도가
                <strong className="text-emerald-700"> 주 평균 8회</strong> 관찰되었습니다. 다만 전이 상황(놀이 종료, 활동 전환)에서의
                저항은 여전히 남아 있어, 5월에는 시각적 일정표를 활용한 예측가능성 훈련을 함께 진행하려 합니다.
              </p>
            </div>
          </section>

          {/* 02 - Domain progress */}
          <section>
            <SectionLabel num="02" title="영역별 발달 흐름" />
            <div className="space-y-3">
              {[
                { domain: "표현언어", icon: MessageCircle, prev: 62, curr: 74, delta: "+12", color: "emerald", note: "자발 발화 길이가 3어절에서 4-5어절로 확장" },
                { domain: "수용언어", icon: BookOpen, prev: 70, curr: 76, delta: "+6", color: "emerald", note: "2단계 지시 따르기 정확도 안정화" },
                { domain: "사회적 상호작용", icon: Heart, prev: 55, curr: 63, delta: "+8", color: "emerald", note: "또래 시작 발화 주 8회 관찰" },
                { domain: "정서 조절", icon: Target, prev: 58, curr: 56, delta: "-2", color: "amber", note: "전이 상황에서의 저항 지속 — 5월 중점 영역" },
              ].map((row) => (
                <div key={row.domain} className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6E8] flex items-center justify-center shrink-0">
                    <row.icon className="w-5 h-5 text-[#9B8B5A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-semibold text-neutral-900">{row.domain}</div>
                      <div className={`text-sm font-semibold ${row.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>{row.delta}</div>
                    </div>
                    <div className="mt-2 h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-neutral-300 rounded-full" style={{ width: `${row.prev}%` }} />
                      <div className={`absolute inset-y-0 left-0 rounded-full ${row.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${row.curr}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">{row.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-3 px-1">* 막대는 4월말 도달 수준이며, 회색은 3월말 기준치입니다. 표준화 점수가 아닌 센터 내부 관찰 척도(0-100)입니다.</p>
          </section>

          {/* 03 - Highlight moments */}
          <section>
            <SectionLabel num="03" title="이번 달 빛났던 순간" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { date: "4월 8일", title: "처음으로 친구에게 \"같이 놀자\"고 말했어요", body: "블록 영역에서 도윤이에게 자발적으로 다가가 놀이 제안을 했고, 5분간 협동 놀이가 이어졌습니다." },
                { date: "4월 15일", title: "감정 단어를 스스로 사용했습니다", body: "퍼즐을 완성한 후 \"민준이 기뻐요\"라고 표현했어요. 처음으로 \"기뻐요\"라는 단어가 자발적으로 나왔습니다." },
                { date: "4월 22일", title: "지시 따르기 정확도가 안정화되었어요", body: "\"가방에서 책 꺼내서 책상 위에 올려놓자\" 같은 2단계 지시를 5회 중 5회 모두 성공했습니다." },
                { date: "4월 29일", title: "역할놀이에서 주도성을 보였어요", body: "병원놀이 상황에서 의사 역할을 자발적으로 선택하고, 치료사에게 역할을 지정해주는 모습이 관찰되었습니다." },
              ].map((m) => (
                <div key={m.date} className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-center gap-2 text-[11px] text-[#C8B88A] uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3" /> {m.date}
                  </div>
                  <div className="font-semibold text-neutral-900 leading-snug mb-2">{m.title}</div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 04 - Therapist note */}
          <section>
            <SectionLabel num="04" title="담당 치료사 노트" />
            <div className="bg-gradient-to-br from-[#FAF6E8] to-white rounded-3xl p-8 border border-[#C8B88A]/40 relative">
              <div className="absolute top-6 right-6 text-6xl text-[#C8B88A]/30 font-serif leading-none">"</div>
              <p className="text-neutral-800 leading-relaxed text-[15px] italic">
                민준이는 이번 달 자기 표현의 폭이 눈에 띄게 넓어졌습니다. 특히 \"같이\", \"먼저\" 같은
                관계 단어를 자발적으로 사용하기 시작한 것은 사회성 발달의 중요한 신호입니다. 가정에서도
                민준이가 말을 시작할 때 충분히 기다려주시고, 완성된 문장을 반복해서 들려주시면
                문장 길이가 더 빠르게 늘 거예요. 전이 상황의 어려움은 흔한 발달 과정의 일부이니
                너무 걱정하지 마시고, 다음 활동을 미리 알려주는 작은 루틴을 함께 만들어가요.
              </p>
              <div className="mt-6 flex items-center gap-3 pt-6 border-t border-[#C8B88A]/30">
                <div className="w-10 h-10 rounded-full bg-[#FFB4A2] flex items-center justify-center text-white font-semibold">김</div>
                <div>
                  <div className="font-semibold text-neutral-900 text-sm">김민지 언어치료사</div>
                  <div className="text-xs text-neutral-500">언어재활사 1급 · 8년차</div>
                </div>
              </div>
            </div>
          </section>

          {/* 05 - Home practice */}
          <section>
            <SectionLabel num="05" title="이번 달 가정 연습 제안" />
            <div className="space-y-3">
              {[
                { title: "식사 시간 \"무엇/누구/어디\" 질문 놀이", desc: "하루 한 끼 식사에서 \"이건 누가 만들었을까?\", \"이거 어디서 샀지?\" 같은 열린 질문을 3-5회 던져주세요. 답을 못해도 괜찮습니다.", time: "5분/회" },
                { title: "전이 카드 만들기", desc: "다음 활동을 그림으로 보여주는 작은 카드 3장(놀이 → 정리 → 간식)을 만들어 보여주시면 전이 저항이 줄어듭니다.", time: "준비 10분, 매일 사용" },
                { title: "잠자기 전 \"오늘 가장 좋았던 일\" 1문장 말하기", desc: "감정 단어 확장에 도움이 됩니다. 부모님이 먼저 시범을 보여주세요.", time: "3분/회" },
              ].map((p, i) => (
                <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <div className="font-semibold text-neutral-900">{p.title}</div>
                      <div className="text-[11px] text-[#C8B88A] uppercase tracking-wider shrink-0">{p.time}</div>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 06 - Next month plan */}
          <section>
            <SectionLabel num="06" title="다음 달 목표" />
            <div className="bg-neutral-900 text-white rounded-3xl p-8">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] text-[#C8B88A] uppercase mb-4">
                <Award className="w-3.5 h-3.5" /> May Focus
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: "주요 목표", value: "전이 상황 자기조절" },
                  { label: "회기 횟수", value: "12회 (주 3회)" },
                  { label: "재평가 일정", value: "5월 31일" },
                ].map((g) => (
                  <div key={g.label}>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">{g.label}</div>
                    <div className="text-lg font-semibold">{g.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-neutral-300">5월 첫 회기에 보호자 면담 10분을 함께 진행합니다.</span>
                <ChevronRight className="w-4 h-4 text-[#C8B88A]" />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-neutral-200 text-[11px] text-neutral-500 leading-relaxed">
            <p className="mb-2"><strong className="text-neutral-700">고지사항.</strong> 본 리포트는 발달 코칭 및 의사결정 지원 목적의 관찰 기록이며, 의학적 진단이나 치료 처방이 아닙니다. 임상적 판단이 필요한 경우 전문 의료기관에 문의해주세요.</p>
            <div className="flex items-center justify-between mt-4">
              <span>햇살 발달치료센터 · AIHPRO B2B Center로 발행</span>
              <span>생성일 2026.05.02</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-5">
      <div className="text-[11px] font-mono text-[#C8B88A] tracking-[0.3em]">{num}</div>
      <h2 className="text-xl font-serif text-neutral-900">{title}</h2>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}
