-- System status function with admin guard
DROP FUNCTION IF EXISTS public.get_system_status();

CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result JSON;
  db_size TEXT;
  db_connections INTEGER;
  last_backup_time TIMESTAMPTZ;
  backup_status TEXT;
  system_health TEXT;
  uptime_days INTEGER;
  error_count INTEGER;
BEGIN
  IF NOT public.is_user_admin_safe() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;

  SELECT count(*) INTO db_connections 
  FROM pg_stat_activity 
  WHERE state = 'active';
  
  SELECT created_at INTO last_backup_time
  FROM public.audit_logs 
  WHERE action = 'Database backup' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF last_backup_time IS NULL THEN
    backup_status := 'No backup found';
  ELSIF last_backup_time >= NOW() - INTERVAL '24 hours' THEN
    backup_status := 'Recent backup available';
  ELSE
    backup_status := 'Backup overdue';
  END IF;
  
  SELECT COUNT(*) INTO error_count
  FROM public.audit_logs
  WHERE status = 'failed' 
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  IF error_count = 0 THEN
    system_health := 'Excellent';
  ELSIF error_count <= 5 THEN
    system_health := 'Good';
  ELSE
    system_health := 'Needs attention';
  END IF;
  
  SELECT EXTRACT(DAYS FROM (NOW() - MIN(created_at)))::INTEGER 
  INTO uptime_days
  FROM auth.users;
  
  SELECT JSON_BUILD_OBJECT(
    'systemHealth', JSON_BUILD_OBJECT(
      'status', system_health,
      'message', CASE 
        WHEN error_count = 0 THEN 'All systems operational'
        WHEN error_count <= 5 THEN error_count || ' minor issues detected'
        ELSE error_count || ' issues need attention'
      END,
      'errorCount', error_count
    ),
    'backup', JSON_BUILD_OBJECT(
      'status', backup_status,
      'lastBackup', last_backup_time,
      'message', CASE 
        WHEN last_backup_time IS NULL THEN 'No backup history'
        WHEN last_backup_time >= NOW() - INTERVAL '1 hour' THEN 'Just completed'
        WHEN last_backup_time >= NOW() - INTERVAL '24 hours' THEN 'Today'
        ELSE 'More than 24h ago'
      END
    ),
    'server', JSON_BUILD_OBJECT(
      'status', 'Online',
      'uptime', uptime_days || ' days',
      'connections', db_connections,
      'dbSize', db_size
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_system_status() TO authenticated;
