import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Building2 } from "lucide-react";
import InviteMemberPanel from "@/components/b2b-center/InviteMemberPanel";

interface Ctx { centerId: string; demo?: boolean }

export default function OrganizationPage() {
  const { centerId, demo } = useOutletContext<Ctx>();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Helmet><title>기관 정보 — AIHPRO 센터</title></Helmet>

      <div>
        <p className="text-xs tracking-widest text-neutral-500 mb-1">ADMIN</p>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#C8B88A]" />
          기관 정보
        </h1>
      </div>

      {demo ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">데모 모드에서는 구성원 초대를 사용할 수 없습니다. 실제 가입 후 본인 기관에서 사용해보세요.</p>
        </div>
      ) : (
        <InviteMemberPanel centerId={centerId} />
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h3 className="font-semibold mb-2">기관 정보·옵션 설정</h3>
        <p className="text-sm text-neutral-500">상호, 사업자번호, 운영 옵션, 결제 정보 — 곧 제공될 예정입니다.</p>
      </div>
    </div>
  );
}
