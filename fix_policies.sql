-- FIX STORAGE POLICIES
-- Allow authenticated users to upload files to 'properties' bucket
create policy "Authenticated users can upload files"
on storage.objects for insert
with check (
  bucket_id = 'properties' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update files (if needed)
create policy "Authenticated users can update files"
on storage.objects for update
with check (
  bucket_id = 'properties' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files
create policy "Authenticated users can delete files"
on storage.objects for delete
using (
  bucket_id = 'properties' AND
  auth.role() = 'authenticated'
);

-- Make files publicly accessible (read-only)
create policy "Public can view files"
on storage.objects for select
using ( bucket_id = 'properties' );


-- REINFORCE TABLE POLICIES
-- Ensure properties table allows updates
drop policy if exists "Authenticated users can modify properties" on public.properties;
create policy "Authenticated users can modify properties"
  on public.properties for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- Ensure property_media table allows inserts
drop policy if exists "Authenticated users can insert media" on public.property_media;
create policy "Authenticated users can insert media"
  on public.property_media for insert
  with check ( auth.role() = 'authenticated' );

-- Ensure property_media table allows deletes
drop policy if exists "Authenticated users can delete media" on public.property_media;
create policy "Authenticated users can delete media"
  on public.property_media for delete
  using ( auth.role() = 'authenticated' );
