
-- 1) Dedupe: keep therapist with most sessions per (center_id, name); merge sessions to winner; delete losers.
WITH ranked AS (
  SELECT t.id, t.center_id, t.name,
         COALESCE((SELECT COUNT(*) FROM public.center_sessions s WHERE s.therapist_id = t.id), 0) AS sess_count,
         t.created_at
  FROM public.center_therapists t
),
winners AS (
  SELECT DISTINCT ON (center_id, name) id AS winner_id, center_id, name
  FROM ranked
  ORDER BY center_id, name, sess_count DESC, created_at ASC
),
losers AS (
  SELECT r.id AS loser_id, w.winner_id
  FROM ranked r
  JOIN winners w ON w.center_id = r.center_id AND w.name = r.name
  WHERE r.id <> w.winner_id
)
UPDATE public.center_sessions s
SET therapist_id = l.winner_id
FROM losers l
WHERE s.therapist_id = l.loser_id;

-- Delete duplicate therapist rows (keep winner per center+name)
WITH ranked AS (
  SELECT t.id, t.center_id, t.name,
         COALESCE((SELECT COUNT(*) FROM public.center_sessions s WHERE s.therapist_id = t.id), 0) AS sess_count,
         t.created_at
  FROM public.center_therapists t
),
winners AS (
  SELECT DISTINCT ON (center_id, name) id AS winner_id
  FROM ranked
  ORDER BY center_id, name, sess_count DESC, created_at ASC
)
DELETE FROM public.center_therapists t
WHERE t.id NOT IN (SELECT winner_id FROM winners);

-- 2) Prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS uq_center_therapists_center_name
  ON public.center_therapists (center_id, name);
