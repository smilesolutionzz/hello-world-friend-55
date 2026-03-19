import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Award, GraduationCap, Briefcase, Users } from 'lucide-react';

const ExpertTeamSection = () => {
  const experts = [
    {
      name: '이수석',
      role: 'CPO / 제품 총괄',
      credential: '아동발달 전문가',
      description: '현장 기반 발달검사 설계 및 AI 분석 시스템 구축',
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-400',
    },
    {
      name: '이일석',
      role: 'CTO / 기술 총괄',
      credential: '하버드/보스턴 20년',
      description: 'AI·데이터 아키텍처 설계, 글로벌 헬스테크 경험',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
    },
    {
      name: '김기정',
      role: '자문위원',
      credential: '여성가족부 협회장',
      description: '정부 정책 자문 및 기관 파트너십 총괄',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
    },
  ];

  const credentials = [
    { icon: GraduationCap, label: '심리학·발달학 석박사급 자문단' },
    { icon: Briefcase, label: '임상 현장 평균 15년 경력' },
    { icon: Users, label: '50+ 전문 기관 협력 네트워크' },
    { icon: Award, label: 'AI 기반 검증된 분석 엔진' },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-900/95">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-4 py-1.5 text-sm mb-6">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            전문가 팀
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">현장 전문가</span>가 직접 설계한 분석 시스템
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            아동발달·심리 분야의 실무 전문가들이 검사 문항부터 AI 분석 로직까지 직접 감수합니다
          </p>
        </motion.div>

        {/* Expert Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {experts.map((expert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${expert.gradient} backdrop-blur-sm p-6`}
            >
              <div className={`w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4`}>
                <GraduationCap className={`w-6 h-6 ${expert.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{expert.name}</h3>
              <p className="text-sm text-slate-300 font-medium mb-1">{expert.role}</p>
              <Badge className="bg-white/10 text-white/80 border-0 text-xs mb-3">{expert.credential}</Badge>
              <p className="text-sm text-slate-400 leading-relaxed">{expert.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Credentials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {credentials.map((cred, index) => {
            const Icon = cred.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                <Icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{cred.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ExpertTeamSection;
