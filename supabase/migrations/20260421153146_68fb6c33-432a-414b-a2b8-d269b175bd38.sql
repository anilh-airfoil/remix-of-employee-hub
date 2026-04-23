-- Allow admins and owners to update any user record (for role changes)
CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_user_role) OR has_role(auth.uid(), 'owner'::app_user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_user_role) OR has_role(auth.uid(), 'owner'::app_user_role));