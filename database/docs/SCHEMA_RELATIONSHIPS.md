# Database Schema Relationships

## 🏗️ Core Quiz System (Base Tables)

```
profiles
├── quiz_sessions (user_id → profiles.id)
    ├── answers (session_id → quiz_sessions.id)
        └── question_pool (pool_question_id → question_pool.id)
            ├── question_translations (question_id → question_pool.id)
            └── decision_weights (gift + source + pclass → question_pool.gift/source/pclass)
```

## 📚 Enhanced Rich Data System

```
categories (key, locale)
├── spiritual_gifts (category_key, locale → categories.key, locale)
    ├── qualities (gift_key, locale → spiritual_gifts.gift_key, locale)
    ├── characteristics (gift_key, locale → spiritual_gifts.gift_key, locale)  
    ├── dangers (gift_key, locale → spiritual_gifts.gift_key, locale)
    └── misunderstandings (gift_key, locale → spiritual_gifts.gift_key, locale)

ministries (key, locale)
├── [Independent reference table]

manifestations (key, locale) 
├── [Independent reference table]

manifestation_principles (locale)
├── [Independent reference table]

biblical_activities (key, locale)
├── [Independent reference table]
```

## 🔗 Foreign Key Relationships

### Core System Relations:
- `quiz_sessions.user_id` → `profiles.id`
- `answers.session_id` → `quiz_sessions.id`
- `answers.pool_question_id` → `question_pool.id`
- `question_translations.question_id` → `question_pool.id`

### Enhanced System Relations:
- `spiritual_gifts.(category_key, locale)` → `categories.(key, locale)`
- `qualities.(gift_key, locale)` → `spiritual_gifts.(gift_key, locale)`
- `characteristics.(gift_key, locale)` → `spiritual_gifts.(gift_key, locale)`
- `dangers.(gift_key, locale)` → `spiritual_gifts.(gift_key, locale)`
- `misunderstandings.(gift_key, locale)` → `spiritual_gifts.(gift_key, locale)`

## 📊 Key Integration Points

### Quiz Results → Rich Data
The `calculate_quiz_result()` function returns `gift_key` values that link to:
- `spiritual_gifts.gift_key` (for detailed gift information)
- `qualities.gift_key` (for gift qualities)  
- `characteristics.gift_key` (for gift characteristics)
- `dangers.gift_key` (for potential dangers)
- `misunderstandings.gift_key` (for common misunderstandings)

### Multilingual Support
All rich data tables support multiple locales via composite foreign keys:
- `(gift_key, locale)` ensures data integrity across languages
- `(key, locale)` for reference tables like categories, ministries, manifestations

## 🗃️ Table Summary

### Core System (7 tables):
1. `profiles` - User profiles
2. `quiz_sessions` - Quiz sessions
3. `answers` - User responses  
4. `question_pool` - 140 structured questions
5. `question_translations` - Multilingual question text
6. `decision_weights` - Weight matrix for scoring
7. `migration_log` - System migration tracking

### Enhanced Rich Data (9 tables):
1. `categories` - Theological categories (Motivations, Ministries, Manifestations)
2. `spiritual_gifts` - Detailed gift information
3. `qualities` - Gift qualities (7 per gift)
4. `characteristics` - Gift characteristics  
5. `dangers` - Potential dangers to avoid
6. `misunderstandings` - Common misunderstandings
7. `ministries` - Biblical ministries
8. `manifestations` - Spiritual manifestations
9. `manifestation_principles` - Manifestation principles
10. `biblical_activities` - Related biblical activities

## 🎯 Usage Examples

### Get complete gift data:
```sql
SELECT * FROM get_gift_complete_data('A_PROPHECY', 'pt');
```

### Get quiz result with rich details:
```sql  
SELECT * FROM get_top_gift_details(session_id, 'pt');
```

### Get all categories:
```sql
SELECT * FROM get_categories_by_locale('pt');
```

## 🔍 Referential Integrity Features

✅ **Foreign Key Constraints**: Ensure data consistency
✅ **Composite Keys**: Support for multilingual data  
✅ **Unique Constraints**: Prevent duplicate entries
✅ **Performance Indexes**: Optimized query performance
✅ **Cascading Deletes**: Automatic cleanup of related data
✅ **Check Constraints**: Data validation at database level