# Steps to Apply Migration via Supabase CLI

## One-Time Setup (If Not Already Done)

You need to authenticate the Supabase CLI with your account:

```bash
npx supabase login
```

This will:
1. Open your browser
2. Ask you to log in to Supabase
3. Generate an access token (`sbp_...`)
4. Store it locally for future CLI commands

**Alternative (headless/CI):** If you have an access token already:
```bash
npx supabase login --token sbp_your_token_here
```

You can get an access token from:
https://supabase.com/dashboard/account/tokens

---

## Applying This Migration

Once logged in, simply run:

```bash
npx supabase db push
```

This will:
- ✅ Connect to your remote Supabase database
- ✅ Detect the new migration: `20260106150000_fix_recent_activity_duplicates.sql`
- ✅ Apply it automatically
- ✅ Update the migration tracking

---

## Verification

After the migration succeeds:

```bash
# Check the admin dashboard
open https://your-app-url/admin

# Or verify in Supabase directly
npx supabase db remote changes
```

You should see:
- No duplicate login activities
- Recent Activity shows a clean list
- Mix of activity types (login, quiz_complete, etc.)

---

## Troubleshooting

### "Invalid access token format"
→ Run `npx supabase login` first

### "password authentication failed"
→ You need to use `npx supabase login`, not database passwords

### "Access denied: Admin privileges required"
→ The migration includes admin-only functions, this is expected and correct

### Migration already applied
→ Safe to ignore, Supabase tracks which migrations have run

---

## What This Migration Does

1. **Fixes `get_recent_activity()`** - Now queries `user_activities` instead of `quiz_sessions`
2. **Cleans up duplicates** - Removes duplicate login/activity records
3. **Prevents future duplicates** - Works with existing `log_user_activity()` prevention logic

See `FIX_DUPLICATES.md` for full technical details.
