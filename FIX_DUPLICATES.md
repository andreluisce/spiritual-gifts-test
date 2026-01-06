# Fix for Duplicate Recent Activities

## Problem Identified

The "Recent Activity" section was showing duplicate login entries for the same user:
```
Marina Pereira da Silva
login • 1 hours ago

Marina Pereira da Silva
login • 1 hours ago

Andre Evangelista
login • 47 min ago

Andre Evangelista
login • 1 hours ago
```

## Root Cause

1. **Wrong data source**: The `get_recent_activity()` function was querying the `quiz_sessions` table instead of the `user_activities` table
2. **Duplicate inserts**: Multiple `SIGNED_IN` auth events can fire when users refresh pages or reconnect, causing duplicate login records
3. **No deduplication**: The old implementation didn't have proper duplicate prevention

## The Solution

Created migration: `supabase/migrations/20260106150000_fix_recent_activity_duplicates.sql`

This migration does 3 things:

### 1. Updates `get_recent_activity()` Function
- Now queries from `user_activities` table (not `quiz_sessions`)
- Maps activity types correctly:
  - `login`, `logout`, `account_created` → `user` type
  - `quiz_start`, `quiz_complete` → `quiz` type
  - `profile_update`, `password_change` → `user` type
  - Everything else → `system` type

### 2. Cleans Up Existing Duplicates
- Removes duplicate activities within 60-second windows
- Keeps only the most recent activity for each user+type combination

### 3. Relies on Existing Prevention
- The `log_user_activity()` function (from migration `20260106141100_prevent_duplicate_activities.sql`) already prevents new duplicates
- It checks if an activity was logged within the last 60 seconds before inserting

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/vttkurdzstlkybojigry/sql/new
2. Copy the contents of `supabase/migrations/20260106150000_fix_recent_activity_duplicates.sql`
3. Paste into the SQL editor
4. Click **RUN** to execute

### Option 2: Command Line (if you have access token)
```bash
npx supabase link --project-ref vttkurdzstlkybojigry
npx supabase db push
```

### Option 3: Direct psql (if you have connection string)
```bash
psql "your-database-connection-string" < supabase/migrations/20260106150000_fix_recent_activity_duplicates.sql
```

## Verification

After applying the migration:

1. **Refresh the admin dashboard** (clear browser cache if needed)
2. **Check Recent Activity** - you should see:
   - No duplicate login entries for the same user
   - Mix of different activity types (login, quiz completion, etc.)
   - Only the most recent activity entries

3. **Test login** a few times:
   - Login
   - Wait 10 seconds
   - Refresh page
   - Check that only ONE new login activity appears

## Technical Details

### Duplicate Prevention Strategy
- **At Insert**: `log_user_activity()` checks for activities within 60 seconds before inserting
- **At Cleanup**: Migration removes any existing duplicates from before the fix
- **At Query**: `get_recent_activity()` simply orders by `created_at DESC` (no need for DISTINCT)

### Activity Type Mapping
```sql
CASE
  WHEN ua.activity_type IN ('login', 'logout', 'account_created') THEN 'user'
  WHEN ua.activity_type IN ('quiz_start', 'quiz_complete') THEN 'quiz'
  WHEN ua.activity_type IN ('profile_update', 'password_change') THEN 'user'
  ELSE 'system'
END
```

## Related Files

- **Migration**: `supabase/migrations/20260106150000_fix_recent_activity_duplicates.sql`
- **Previous duplicate prevention**: `supabase/migrations/20260106141100_prevent_duplicate_activities.sql`
- **Activity tracking**: `src/hooks/useActivityTracking.ts`
- **Auth context**: `src/context/AuthContext.tsx` (lines 106-116)
- **Admin hook**: `src/hooks/useAdminData.ts` (lines 268-308)
- **Admin UI**: `src/app/[locale]/admin/page.tsx` (lines 217-259)

## What Changed

| Before | After |
|--------|-------|
| `get_recent_activity()` queries `quiz_sessions` | Now queries `user_activities` |
| Shows only quiz-related activities | Shows all user activities (login, logout, quiz, etc.) |
| Duplicates possible | Duplicates prevented (60s threshold) |
| Returns quiz data format | Returns proper activity data format |

## Prevention for Future

The following is now in place to prevent duplicates:

1. ✅ `should_log_activity()` function checks for recent duplicates
2. ✅ `log_user_activity()` uses the check before inserting
3. ✅ 60-second threshold prevents rapid duplicate entries
4. ✅ Migration cleanup removes old duplicates
5. ✅ `get_recent_activity()` queries the right table

You should not see duplicate activities anymore! 🎉
