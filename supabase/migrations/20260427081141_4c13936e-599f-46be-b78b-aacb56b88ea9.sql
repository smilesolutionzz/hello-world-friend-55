-- 전문가 화상 상담 도구 정보
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS preferred_meeting_tool TEXT NOT NULL DEFAULT 'google_meet',
  ADD COLUMN IF NOT EXISTS meeting_room_url TEXT,
  ADD COLUMN IF NOT EXISTS meeting_handle TEXT,
  ADD COLUMN IF NOT EXISTS meeting_tool_note TEXT;

-- 허용 값 검증 (트리거 사용 — CHECK 제약은 추후 도구 추가 유연성 위해 회피)
CREATE OR REPLACE FUNCTION public.validate_expert_meeting_tool()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.preferred_meeting_tool NOT IN (
    'google_meet', 'zoom', 'kakao_video', 'phone', 'in_person', 'custom'
  ) THEN
    RAISE EXCEPTION 'preferred_meeting_tool 값이 유효하지 않습니다: %', NEW.preferred_meeting_tool;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_expert_meeting_tool ON public.experts;
CREATE TRIGGER trg_validate_expert_meeting_tool
  BEFORE INSERT OR UPDATE OF preferred_meeting_tool ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_expert_meeting_tool();

COMMENT ON COLUMN public.experts.preferred_meeting_tool IS '전문가가 선호하는 화상 상담 도구: google_meet | zoom | kakao_video | phone | in_person | custom';
COMMENT ON COLUMN public.experts.meeting_room_url IS '전문가의 고정 상담실 URL (Zoom 개인 회의실, 자체 도구 링크 등). NULL이면 예약마다 동적 생성.';
COMMENT ON COLUMN public.experts.meeting_handle IS '카카오 ID, 전화번호 등 도구별 식별자';
COMMENT ON COLUMN public.experts.meeting_tool_note IS '상담 도구 관련 사용자 안내 문구 (예: "예약 10분 전 카톡으로 링크 발송")';