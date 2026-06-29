import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Send, Image as ImageIcon, Download, Loader2, Check, ExternalLink, MessageSquare, FileText, Wand2 } from "lucide-react";
import card1 from "@/assets/mkt-demo/card-1.jpg";
import card2 from "@/assets/mkt-demo/card-2.jpg";
import card3 from "@/assets/mkt-demo/card-3.jpg";

type Tab = "landing" | "sms" | "card";

const GOLD = "#C8B88A";

export default function MktStudioDemo() {
  const [tab, setTab] = useState<Tab>("landing");

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top Bar */}
      <div className="border-b border-neutral-200 sticky top-0 z-30 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/b2b-center" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" /> 콘솔로
          </Link>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] text-neutral-400">INTERNAL DEMO</p>
            <p className="text-xs font-medium tracking-wide">AIHPRO 마케팅 스튜디오 · 시연용</p>
          </div>
          <div className="text-[10px] text-neutral-400 hidden md:block">실데이터 미연결 · 시연 전용</div>
        </div>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="text-[11px] tracking-[0.4em] mb-4" style={{ color: GOLD }}>MARKETING STUDIO · BETA</p>
        <h1 className="text-3xl md:text-5xl font-semibold break-keep leading-tight" style={{ fontFamily: "Instrument Serif, serif" }}>
          치료 데이터가, 새로운 보호자를 데려옵니다
        </h1>
        <p className="mt-5 text-neutral-600 text-sm md:text-base break-keep max-w-2xl mx-auto">
          랜딩페이지 자동생성 · SMS 마케팅 캠페인 · 치료노트 카드뉴스 변환.
          <br className="hidden md:block" />
          행정 자동화는 무료로, 마케팅 스튜디오는 월 ₩39,000 (베타 ₩19,500).
        </p>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex gap-2 p-1 rounded-full border border-neutral-200 bg-neutral-50 w-fit mx-auto">
          {[
            { id: "landing" as const, label: "랜딩페이지 생성", icon: FileText },
            { id: "sms" as const, label: "SMS 캠페인", icon: Send },
            { id: "card" as const, label: "치료노트 → 카드뉴스", icon: ImageIcon },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-medium transition ${
                  active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {tab === "landing" && <LandingDemo />}
        {tab === "sms" && <SmsDemo />}
        {tab === "card" && <CardDemo />}
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <p className="text-[11px] tracking-[0.3em] mb-3" style={{ color: GOLD }}>BETA EARLY-BIRD · 10곳 한정</p>
          <h3 className="text-xl md:text-2xl font-semibold mb-3">첫 3개월 ₩19,500 · 평생 고정</h3>
          <p className="text-sm text-neutral-600 break-keep">
            행정 자동화 무료 + 마케팅 스튜디오까지. 카드 등록은 정식 출시일(2026-09-01)에.
            <br />위약금 없음 · 언제든 해지 가능.
          </p>
          <p className="mt-5 text-xs text-neutral-500">문의 · kijung_kku@naver.com</p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------- A. Landing Generator -------------------- */
function LandingDemo() {
  const [name, setName] = useState("햇살 발달치료센터");
  const [specialties, setSpecialties] = useState<string[]>(["언어치료", "감각통합"]);
  const [phone, setPhone] = useState("010-0000-0000");
  const [template, setTemplate] = useState<0 | 1 | 2>(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const allSpecs = ["언어치료", "감각통합", "미술치료", "특수체육", "심리상담", "놀이치료", "인지학습"];

  function toggle(s: string) {
    setSpecialties((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));
  }

  function generate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1800);
  }

  const slug = name.replace(/\s+/g, "").toLowerCase().replace(/[^a-z0-9가-힣]/g, "") || "center";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6">
        <p className="text-[10px] tracking-widest text-neutral-400 mb-4">STEP 01 · 기관 정보 입력</p>

        <label className="block text-xs text-neutral-600 mb-1.5">센터명</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 mb-4"
        />

        <label className="block text-xs text-neutral-600 mb-1.5">전문 분야 (복수 선택)</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {allSpecs.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                specialties.includes(s)
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <label className="block text-xs text-neutral-600 mb-1.5">대표 전화</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 mb-4"
        />

        <label className="block text-xs text-neutral-600 mb-2">템플릿 선택</label>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(["미니멀", "따뜻한", "전문가"] as const).map((label, i) => (
            <button
              key={label}
              onClick={() => setTemplate(i as 0 | 1 | 2)}
              className={`aspect-[3/4] rounded-xl border text-[11px] font-medium transition ${
                template === i ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200"
              }`}
              style={{
                background:
                  i === 0
                    ? "linear-gradient(180deg, #fff 0%, #f8f8f6 100%)"
                    : i === 1
                    ? "linear-gradient(180deg, #fff8ef 0%, #faeed8 100%)"
                    : "linear-gradient(180deg, #1a1a1a 0%, #2b2b2b 100%)",
                color: i === 2 ? "#fff" : "#111",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={generating}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {generating ? "AI가 페이지를 그리는 중…" : "30초 안에 랜딩페이지 생성"}
        </button>
        <p className="text-[10px] text-neutral-400 mt-3 text-center">시연용 · 실제 생성 시 약 30~60초 소요</p>
      </div>

      {/* Preview */}
      <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between px-2 py-1 mb-3">
          <p className="text-[10px] tracking-widest text-neutral-400">PREVIEW</p>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-neutral-500">
            <ExternalLink className="w-3 h-3" /> aihpro.app/c/{slug}
          </div>
        </div>
        <div
          className="rounded-2xl overflow-hidden border border-neutral-200 aspect-[9/14] flex flex-col"
          style={{
            background:
              template === 0
                ? "#fff"
                : template === 1
                ? "linear-gradient(180deg, #fffaf2 0%, #faeed8 100%)"
                : "linear-gradient(180deg, #1a1a1a 0%, #2b2b2b 100%)",
            color: template === 2 ? "#fff" : "#111",
          }}
        >
          {generated ? (
            <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in duration-500">
              <div>
                <p className="text-[10px] tracking-[0.3em] mb-3" style={{ color: GOLD }}>
                  {specialties[0] ?? "발달치료"} · 전문
                </p>
                <h2 className="text-2xl font-semibold leading-tight break-keep" style={{ fontFamily: "Instrument Serif, serif" }}>
                  {name}
                </h2>
                <p className="text-xs mt-3 opacity-70 break-keep">
                  아이의 가능성을 단단하게.
                  <br />
                  매 회기마다 정성을 담습니다.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {specialties.slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-1 rounded-full text-[10px] border" style={{ borderColor: template === 2 ? "#444" : "#e5e5e5" }}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t" style={{ borderColor: template === 2 ? "#333" : "#eee" }}>
                  <p className="text-[10px] opacity-60">상담 문의</p>
                  <p className="text-sm font-medium tracking-wide">{phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs opacity-40">
              {generating ? "생성 중…" : "[생성] 버튼을 누르면 미리보기가 나타납니다"}
            </div>
          )}
        </div>
        {generated && (
          <p className="mt-3 text-center text-[11px] text-neutral-500">
            카톡 프로필 · 인스타 바이오에 이 주소를 붙여넣으세요
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------- B. SMS Campaign -------------------- */
function SmsDemo() {
  const segments = [
    { id: "all", label: "전체 보호자", count: 247 },
    { id: "dormant", label: "6개월 미방문", count: 127 },
    { id: "new", label: "신규 상담문의", count: 18 },
  ];
  const [seg, setSeg] = useState("dormant");
  const [body, setBody] = useState("안녕하세요 햇살센터입니다. 9월 한정 재방문 상담 30% 할인 안내드려요. 예약 문의 010-0000-0000");
  const [sent, setSent] = useState(false);

  const recipients = segments.find((s) => s.id === seg)?.count ?? 0;
  const len = body.length;
  const over = len > 70;
  const cost = recipients * 22;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6">
        <p className="text-[10px] tracking-widest text-neutral-400 mb-4">STEP 01 · 세그먼트 선택</p>
        <div className="space-y-2 mb-6">
          {segments.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeg(s.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition ${
                seg === s.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-xs text-neutral-500">{s.count}명</span>
            </button>
          ))}
        </div>

        <p className="text-[10px] tracking-widest text-neutral-400 mb-2">STEP 02 · 메시지 작성</p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-none"
        />
        <div className="flex items-center justify-between mt-1.5 text-[11px]">
          <span className={over ? "text-red-600 font-medium" : "text-neutral-500"}>
            {len} / 70자 {over && "· 분리 발송 위험"}
          </span>
          <span className="text-neutral-400">한국 SMS 안전 한도</span>
        </div>

        <button
          onClick={() => setSent(true)}
          disabled={sent}
          className="w-full mt-5 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
        >
          {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {sent ? `${recipients}명 발송 완료` : `${recipients}명에게 발송 · ₩${cost.toLocaleString()}`}
        </button>
        <p className="text-[10px] text-neutral-400 mt-3 text-center">시연용 · 실제 발송되지 않습니다</p>
      </div>

      {/* Phone Preview */}
      <div className="flex items-start justify-center">
        <div className="w-[280px] rounded-[2.5rem] border-[10px] border-neutral-900 bg-neutral-100 overflow-hidden shadow-xl">
          <div className="bg-neutral-900 text-white text-[10px] py-1.5 px-4 flex justify-between">
            <span>9:41</span>
            <span>● ●</span>
          </div>
          <div className="px-3 py-4 bg-neutral-50 min-h-[440px]">
            <p className="text-[10px] text-neutral-500 text-center mb-3">메시지 · 방금</p>
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <p className="text-[10px] text-neutral-400 mb-1">[국외발신]</p>
              <p className="text-xs leading-relaxed text-neutral-800 break-keep whitespace-pre-wrap">{body}</p>
              <p className="text-[10px] text-neutral-400 mt-2">수신거부 080-000-0000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- C. Card News from Therapy Note -------------------- */
function CardDemo() {
  const notes = [
    { id: 1, child: "김OO", program: "미술치료", week: "4회기", summary: "감각 자극에 대한 회피 감소, 자기 표현 시도 증가" },
    { id: 2, child: "이OO", program: "언어치료", week: "8회기", summary: "2어절 표현 안정화, 또래 호명 반응 시작" },
    { id: 3, child: "박OO", program: "특수체육", week: "6회기", summary: "균형 동작 지속 시간 1.5배 증가" },
  ];
  const [selected, setSelected] = useState(notes[0].id);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  function generate() {
    setGenerating(true);
    setDone(false);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 2200);
  }

  const cards = [card1, card2, card3];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-3">
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setSelected(n.id);
              setDone(false);
            }}
            className={`text-left p-4 rounded-2xl border transition ${
              selected === n.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <p className="text-[10px] text-neutral-400 mb-1">{n.program} · {n.week}</p>
            <p className="text-sm font-medium mb-1.5">{n.child} 아동</p>
            <p className="text-xs text-neutral-600 break-keep leading-relaxed">{n.summary}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] tracking-widest text-neutral-400 mb-1">SAFETY GATE</p>
            <p className="text-sm text-neutral-700 break-keep">
              AI가 이름·생년월일·구체 진단명을 1차 제거합니다.
              <br className="hidden md:block" />
              게시 전 원장님 검수가 반드시 필요합니다.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60 whitespace-nowrap"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "AI가 카드를 만드는 중…" : "익명화 + 3장 카드 생성"}
          </button>
        </div>

        {(generating || done) && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {cards.map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
                {generating ? (
                  <div className="aspect-square flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                  </div>
                ) : (
                  <>
                    <img src={src} alt={`샘플 카드 ${i + 1}`} loading="lazy" width={1024} height={1024} className="w-full h-auto" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-medium">
                      {i + 1} / 3
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {done && (
          <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div className="text-xs text-neutral-600 break-keep">
              <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />
              인스타·블로그·카톡 채널 어디든 바로 업로드 가능합니다.
            </div>
            <a
              href={cards[0]}
              download="aihpro-card-sample.jpg"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-xs font-medium hover:bg-white"
            >
              <Download className="w-3.5 h-3.5" /> 샘플 다운로드
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
