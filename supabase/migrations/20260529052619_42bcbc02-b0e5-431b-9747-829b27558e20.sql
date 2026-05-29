insert into storage.buckets (id, name, public)
values ('game-bgm', 'game-bgm', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read game-bgm" on storage.objects;
create policy "Public read game-bgm"
on storage.objects
for select
using (bucket_id = 'game-bgm');

drop policy if exists "Service role manages game-bgm" on storage.objects;
create policy "Service role manages game-bgm"
on storage.objects
for all
to service_role
using (bucket_id = 'game-bgm')
with check (bucket_id = 'game-bgm');
