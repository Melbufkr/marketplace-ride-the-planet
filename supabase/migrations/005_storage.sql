-- ─────────────────────────────────────────────
-- 005: Supabase Storage buckets para media
-- ─────────────────────────────────────────────

-- Bucket público para fotos y videos de publicaciones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings-media',
  'listings-media',
  true,
  104857600, -- 100 MB (mayor limitante es la validación en API route)
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ]
) ON CONFLICT (id) DO NOTHING;

-- ─── RLS Storage ───
CREATE POLICY "listings_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings-media');

CREATE POLICY "listings_media_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings-media'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "listings_media_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
-- Convención de path: {user_id}/{listing_id}/{filename}
