insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read vehicle images" on storage.objects;
create policy "Public can read vehicle images"
on storage.objects
for select
to public
using (bucket_id = 'vehicle-images');

drop policy if exists "Admins can upload vehicle images" on storage.objects;
create policy "Admins can upload vehicle images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vehicle-images'
  and public.is_admin_user()
);

drop policy if exists "Admins can update vehicle images" on storage.objects;
create policy "Admins can update vehicle images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vehicle-images'
  and public.is_admin_user()
)
with check (
  bucket_id = 'vehicle-images'
  and public.is_admin_user()
);

drop policy if exists "Admins can delete vehicle images" on storage.objects;
create policy "Admins can delete vehicle images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vehicle-images'
  and public.is_admin_user()
);
