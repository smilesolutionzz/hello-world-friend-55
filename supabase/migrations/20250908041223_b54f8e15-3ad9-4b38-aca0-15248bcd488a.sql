-- 커뮤니티 댓글 테이블에 익명 닉네임 컬럼 추가
ALTER TABLE public.community_comments 
ADD COLUMN anonymous_nickname TEXT;