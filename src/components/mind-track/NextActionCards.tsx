import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const NextActionCards = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: ClipboardCheck,
      title: "검사 더 하기",
      desc: "데이터를 추가해 분석 정확도를 높여요",
      cta: "검사 보러가기",
      onClick: () => navigate("/assessment"),
      gradient: "from-blue-500 to-cyan-500",
      bg: "from-blue-50 to-cyan-50",
    },
    {
      icon: FileText,
      title: "종합 리포트 만들기",
      desc: "지금까지의 데이터를 박사급 리포트로",
      cta: "리포트 생성하기",
      onClick: () => navigate("/report-generator-pro?origin=" + encodeURIComponent("마음트랙 워크북")),
      gradient: "from-purple-500 to-pink-500",
      bg: "from-purple-50 to-pink-50",
    },
    {
      icon: Users,
      title: "전문가 상담 받기",
      desc: "내 데이터를 기반으로 맞춤 매칭해드려요",
      cta: "전문가 매칭",
      onClick: () => navigate("/expert-hiring"),
      gradient: "from-emerald-500 to-teal-500",
      bg: "from-emerald-50 to-teal-50",
    },
  ];

  return (
    <Card className="p-5 bg-white border-slate-200">
      <h3 className="font-bold text-slate-900 mb-3 text-sm">다음에 해볼 것</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        {actions.map((a, i) => (
          <motion.button
            key={a.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={a.onClick}
            className={`text-left p-4 rounded-xl bg-gradient-to-br ${a.bg} border border-slate-200/50 hover:shadow-md transition-all group`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.gradient} flex items-center justify-center mb-3 shadow-sm`}>
              <a.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1 break-keep">{a.title}</h4>
            <p className="text-xs text-slate-600 mb-3 break-keep leading-relaxed">{a.desc}</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-primary transition-colors">
              {a.cta} <ArrowRight className="w-3 h-3" />
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
};

export default NextActionCards;
