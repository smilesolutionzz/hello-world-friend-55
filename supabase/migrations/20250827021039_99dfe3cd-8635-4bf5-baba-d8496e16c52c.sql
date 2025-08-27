-- Grant admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('1ff30a0d-8b0c-4980-92b7-6cd7f9a254e0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;