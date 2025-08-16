# 🗄️ Database Organization Guide

## 📁 Current Database Structure

**Total Tables:** 31  
**Total SQL Files:** 35  
**RLS Status:** ✅ 100% Protected  

## 🎯 Core SQL Files (Production Ready)

### 📋 PHASE 1: Core System Setup
| File | Purpose | Status |
|------|---------|--------|
| `00_MASTER_REBUILD_COMPLETE.sql` | **Master rebuild script** | ✅ Ready |
| `01_CLEAN_complete_system.sql` | Core tables and structure | ✅ Ready |
| `08_QUIZ_FUNCTIONS.sql` | Quiz engine functions | ✅ Ready |
| `15_SYSTEM_SETTINGS.sql` | System configuration | ✅ Ready |

### 📁 PHASE 2: Data Loading
| File | Purpose | Status |
|------|---------|--------|
| `02_CLEAN_load_data.sql` | Base data (gifts, categories) | ✅ Ready |
| `03_CLEAN_load_questions.sql` | Quiz questions in Portuguese | ✅ Ready |
| `04_CLEAN_english_translations.sql` | English translations | ✅ Ready |
| `05_CLEAN_spanish_translations.sql` | Spanish translations | ✅ Ready |

### 🔒 PHASE 3: Security & Permissions
| File | Purpose | Status |
|------|---------|--------|
| `09_COMPREHENSIVE_RLS.sql` | Core RLS policies | ✅ Ready |
| `29_FIX_MISSING_RLS.sql` | **Fix missing RLS** | ✅ Ready |

### ⚡ PHASE 4: Advanced Features
| File | Purpose | Status |
|------|---------|--------|
| `25_CREATE_GIFT_COMPATIBILITY_TABLES.sql` | Dynamic compatibility | ✅ Ready |
| `26_POPULATE_COMPATIBILITY_DATA.sql` | Compatibility data | ✅ Ready |
| `28_CREATE_AI_ANALYSIS_CACHE_SYSTEM.sql` | **AI cache system** | ✅ Ready |

### 👑 PHASE 5: Admin & Monitoring
| File | Purpose | Status |
|------|---------|--------|
| `12_AUDIT_SYSTEM.sql` | Audit trails | ✅ Ready |
| `14_USER_ACTIVITIES.sql` | User activity tracking | ✅ Ready |
| `22_USER_DEMOGRAPHICS.sql` | Demographics support | ✅ Ready |
| `23_ADD_DEMOGRAPHICS_COLUMNS.sql` | Demographics enhancement | ✅ Ready |

### ⚙️ PHASE 6: Functions & Procedures
| File | Purpose | Status |
|------|---------|--------|
| `11_REAL_ADMIN_FUNCTIONS.sql` | Admin dashboard functions | ✅ Ready |
| `15_ADMIN_RPC_FUNCTIONS.sql` | Admin RPC endpoints | ✅ Ready |
| `16_AUDIT_RPC_FUNCTIONS.sql` | Audit RPC endpoints | ✅ Ready |
| `27_UPDATE_QUIZ_FUNCTION_WITH_DEBUG.sql` | **Enhanced quiz debug** | ✅ Ready |

## 🗃️ Legacy/Archive Files

These files were used during development but are superseded:

| File | Status | Notes |
|------|--------|-------|
| `backup.sql` | Archive | Old backup |
| `complete_characteristics.sql` | Archive | Merged into main files |
| `enhanced_spiritual_gifts_schema.sql` | Archive | Old schema |
| `DISABLE_RLS_TEMPORARILY.sql` | Archive | Development only |
| `FIX_*.sql` | Archive | Individual fixes merged |

## 🚀 Deployment Instructions

### Fresh Install (New Database)
```bash
# Execute master rebuild script
psql -f database/00_MASTER_REBUILD_COMPLETE.sql

# Verify everything is working
psql -c "SELECT COUNT(*) FROM spiritual_gifts;"
```

### Production Update (Existing Database)
```bash
# Apply latest changes only
psql -f database/29_FIX_MISSING_RLS.sql
psql -f database/28_CREATE_AI_ANALYSIS_CACHE_SYSTEM.sql
```

## 🔍 Database Security Status

### ✅ All Tables Protected with RLS

| Category | Tables | RLS Status |
|----------|--------|------------|
| **Core System** | 8 tables | ✅ Protected |
| **Quiz Engine** | 6 tables | ✅ Protected |
| **Gift Analysis** | 8 tables | ✅ Protected |
| **Admin/Audit** | 4 tables | ✅ Protected |
| **AI System** | 1 table | ✅ Protected |
| **Compatibility** | 4 tables | ✅ Protected |

### 🛡️ Security Policies Applied

- **User Data**: Users can only access their own data
- **Reference Data**: Read-only access for authenticated users
- **Admin Data**: Restricted to admin roles
- **Audit Logs**: Append-only with time-based access
- **AI Cache**: User-scoped with automatic cleanup

## 📊 Database Statistics

```sql
-- Quick health check
SELECT 
  (SELECT COUNT(*) FROM spiritual_gifts) as gifts,
  (SELECT COUNT(*) FROM question_pool) as questions,
  (SELECT COUNT(*) FROM quiz_sessions) as sessions,
  (SELECT COUNT(*) FROM ai_analysis_cache) as ai_analyses;
```

## 🔧 Maintenance Tasks

### Weekly
- [ ] Check database performance metrics
- [ ] Verify RLS policies are working
- [ ] Review AI cache hit rates

### Monthly  
- [ ] Analyze quiz completion rates
- [ ] Review user activity patterns
- [ ] Clean up old audit logs (if needed)
- [ ] Update compatibility data if required

### Quarterly
- [ ] Full database backup
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Schema evolution planning

## 🆘 Troubleshooting

### Common Issues

1. **RLS Errors**: Check if user has proper authentication
2. **Missing Functions**: Re-run Phase 6 scripts
3. **Data Issues**: Verify data loading Phase 2 scripts
4. **AI Cache Misses**: Check API keys and network connectivity

### Emergency Recovery

```bash
# Full rebuild from scratch
psql -f database/00_MASTER_REBUILD_COMPLETE.sql

# Verify critical functions
psql -c "SELECT * FROM get_admin_stats() LIMIT 1;"
```

## 📋 Change Log

### 2025-01-16
- ✅ Fixed RLS on 11 missing tables
- ✅ Created AI analysis cache system  
- ✅ Organized all SQL files
- ✅ Created master rebuild script

### Previous
- Various fixes and enhancements
- Multiple migrations and updates
- Feature additions and bug fixes

---

**🎯 Production Ready**: This database structure is now production-ready with comprehensive security, organized structure, and complete rebuild capabilities.