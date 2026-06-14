
-- 치료사가 본인 일정/담당 이용자만 보도록 RLS 강화
-- 기존 broad 정책(is_center_member) → owner/admin/viewer 전용으로 축소
-- 치료사(therapist 역할)는 이미 존재하는 "본인 세션/담당 이용자" 정책으로만 접근

DROP POLICY IF EXISTS center_sessions_select ON public.center_sessions;
CREATE POLICY center_sessions_select_admin ON public.center_sessions
  FOR SELECT
  USING (has_center_role(center_id, ARRAY['owner'::center_role, 'admin'::center_role, 'viewer'::center_role]));

DROP POLICY IF EXISTS center_clients_select ON public.center_clients;
CREATE POLICY center_clients_select_admin ON public.center_clients
  FOR SELECT
  USING (has_center_role(center_id, ARRAY['owner'::center_role, 'admin'::center_role, 'viewer'::center_role]));

-- 치료사는 본인 일정 상태(완료/취소/되돌리기)만 변경 가능 — 기존 정책 유지 확인
-- 동료 치료사 프로필 노출은 일정 컨텍스트상 필요해 유지(center_therapists_select)
