INSERT INTO public.user_roles (user_id, role)
VALUES ('5b33a1a3-2670-4bf7-91a5-aa486d37b7cd', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;