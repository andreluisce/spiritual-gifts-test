-- Promote the first (oldest) user to admin.
-- This is safe when there is only one user in the project.
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'No users found to promote to admin.';
        RETURN;
    END IF;

    UPDATE auth.users
    SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('is_admin', true, 'role', 'admin'),
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('is_admin', true, 'role', 'admin')
    WHERE id = target_user_id;

    RAISE NOTICE 'Promoted user % to admin.', target_user_id;
END;
$$;
