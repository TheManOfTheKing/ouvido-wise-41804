-- Policy: Allow OUVIDOR to read all user profiles
CREATE POLICY "usuarios_ouvidor_read_all" ON "public"."usuarios"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (public.is_ouvidor());