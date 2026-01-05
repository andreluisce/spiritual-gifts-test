CREATE OR REPLACE FUNCTION public.is_user_admin_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_rec RECORD;
    role_list TEXT[];
BEGIN
    SELECT raw_user_meta_data, raw_app_meta_data, email
    INTO user_rec
    FROM auth.users
    WHERE id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    IF user_rec.raw_user_meta_data ->> 'is_admin' = 'true'
       OR user_rec.raw_user_meta_data ->> 'role' = 'admin' THEN
        RETURN true;
    END IF;
    
    IF user_rec.raw_app_meta_data ->> 'is_admin' = 'true'
       OR user_rec.raw_app_meta_data ->> 'role' = 'admin' THEN
        RETURN true;
    END IF;
    
    IF user_rec.raw_app_meta_data ? 'roles' THEN
        role_list := ARRAY(
            SELECT json_array_elements_text(user_rec.raw_app_meta_data -> 'roles')
        );
        IF role_list IS NOT NULL AND 'admin' = ANY(role_list) THEN
            RETURN true;
        END IF;
    END IF;
    
    IF user_rec.email ILIKE '%@admin.%' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

grant execute on function public.is_user_admin_safe() to authenticated;
