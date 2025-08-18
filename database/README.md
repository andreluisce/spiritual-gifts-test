# 🗄️ Database Structure

This directory contains all database-related files organized for clarity and maintainability.

## 📁 Directory Structure

```
database/
├── core/           # Essential setup files
├── archive/        # Legacy and obsolete files  
├── docs/          # Database documentation
├── migrations/    # Supabase migrations
└── README.md      # This file
```

## 🚀 Quick Setup

To set up the database from scratch:

```bash
cd database/core
psql -d your_database -f 01_CLEAN_complete_system.sql
psql -d your_database -f 02_CLEAN_load_data.sql
psql -d your_database -f 03_CLEAN_load_questions.sql
psql -d your_database -f 04_CLEAN_english_translations.sql
psql -d your_database -f 05_CLEAN_spanish_translations.sql
psql -d your_database -f enhanced_spiritual_gifts_schema.sql
psql -d your_database -f 08_QUIZ_FUNCTIONS.sql
psql -d your_database -f 09_COMPREHENSIVE_RLS.sql
psql -d your_database -f 15_SYSTEM_SETTINGS.sql
psql -d your_database -f 22_USER_DEMOGRAPHICS.sql
```

## 📋 Core Files

| File | Purpose |
|------|---------|
| `01_CLEAN_complete_system.sql` | Base system setup |
| `02_CLEAN_load_data.sql` | Essential data |
| `03_CLEAN_load_questions.sql` | Quiz questions |
| `04_CLEAN_english_translations.sql` | English translations |
| `05_CLEAN_spanish_translations.sql` | Spanish translations |
| `enhanced_spiritual_gifts_schema.sql` | Rich gift data |
| `08_QUIZ_FUNCTIONS.sql` | Quiz logic functions |
| `09_COMPREHENSIVE_RLS.sql` | Security policies |
| `15_SYSTEM_SETTINGS.sql` | System configuration |
| `22_USER_DEMOGRAPHICS.sql` | User demographics |

## 🗃️ Archive

The `archive/` directory contains legacy files that are no longer needed but kept for reference:
- Old migration attempts
- Temporary fixes
- Obsolete schemas
- Debug scripts

## 📚 Documentation

See `docs/` directory for:
- Schema relationships
- Setup guides
- API documentation
- Troubleshooting guides

