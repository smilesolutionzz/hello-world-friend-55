-- chat-files 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- 파일 업로드 허용 정책
CREATE POLICY "Allow public upload to chat-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chat-files');

-- 파일 읽기 허용 정책
CREATE POLICY "Allow public read from chat-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-files');