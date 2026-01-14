-- Seed some test audit log entries to verify the system is working

-- Insert sample audit events
INSERT INTO public.audit_logs (user_email, action, resource, details, status, created_at)
VALUES
    ('system@spiritual-gifts.com', 'system_migration', 'database', '{"migration": "audit_logs_recreated", "version": "20260115230000"}'::jsonb, 'success', NOW() - INTERVAL '5 minutes'),
    ('system@spiritual-gifts.com', 'system_startup', 'application', '{"event": "application_initialized"}'::jsonb, 'success', NOW() - INTERVAL '3 minutes'),
    ('system@spiritual-gifts.com', 'database_migration', 'schema', '{"migration": "unified_admin_permissions"}'::jsonb, 'success', NOW() - INTERVAL '1 minute');

-- Log this seeding action
INSERT INTO public.audit_logs (user_email, action, resource, details, status, created_at)
VALUES
    ('system@spiritual-gifts.com', 'seed_data', 'audit_logs', '{"count": 3, "purpose": "testing"}'::jsonb, 'success', NOW());

-- Verify
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.audit_logs;
    RAISE NOTICE '✓ Seeded % audit log entries', v_count;
END $$;
