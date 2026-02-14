# @labipaistvus/database

Shared database package providing type-safe Supabase client and TypeScript types for the entire monorepo.

## Architecture

This package follows a **GUI-first workflow** using Supabase Studio:

1. Make schema changes in **Supabase Studio** (visual table editor)
2. Generate migration from database changes
3. Generate TypeScript types from database
4. Share types across frontend and crawler

## Setup

```bash
# Install dependencies
pnpm install

# Generate initial types
pnpm generate-types
```

## Workflow: Making Schema Changes

### Step 1: Open Supabase Studio
```bash
# Ensure Supabase is running locally
supabase status

# Open Supabase Studio in browser
open http://localhost:54323
```

### Step 2: Make Changes Visually
- Navigate to Table Editor
- Add/modify tables, columns, constraints
- Click Save

### Step 3: Generate Migration
```bash
# From repository root
supabase db diff <migration_name>

# Example:
supabase db diff add_tags_column

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_tags_column.sql
```

### Step 4: Regenerate TypeScript Types
```bash
# From this package directory
pnpm generate-types

# Or from repository root
pnpm --filter @labipaistvus/database generate-types
```

### Step 5: Commit Both Files
```bash
git add supabase/migrations/ packages/database/src/types/
git commit -m "Add tags column to articles"
```

## Usage

### In Crawler (Node.js)
```typescript
import { supabase, type Tables } from '@labipaistvus/database';

// Type-safe insert
type ArticleInsert = Tables<'articles'>['Insert'];

const article: ArticleInsert = {
  article_id: 123,
  media_id: 2,
  url: 'https://example.com',
  title: 'Article Title',
  date_time: new Date().toISOString(),
  paywall: false,
  body: 'Article content',
};

const { data, error } = await supabase
  .from('articles')
  .insert(article)
  .select()
  .single();
```

### In Frontend (Next.js)
```typescript
import { supabase } from '@labipaistvus/database';

// Type-safe query with full IntelliSense
const { data: articles } = await supabase
  .from('articles')
  .select('*')
  .eq('media_id', 2)
  .order('date_time', { ascending: false })
  .limit(10);

// articles is typed as Tables<'articles'>['Row'][]
```

## Environment Variables

```env
# Local development
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<from_supabase_status>

# Production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from_supabase_dashboard>
```

## Type System

The generated `database.types.ts` includes:

- `Database` - Complete database schema interface
- `Tables<'table_name'>` - Table-specific types:
  - `Row` - Complete row from SELECT
  - `Insert` - Data for INSERT operations
  - `Update` - Data for UPDATE operations
- `Enums` - All database enums

## Benefits

✅ Single source of truth (the database itself)
✅ Visual schema editing (no code needed)
✅ Auto-generated types (no manual sync)
✅ Auto-generated migrations (no manual SQL)
✅ Type safety everywhere
✅ Shared types between frontend and backend
✅ Full Supabase features (RLS, realtime, storage)
✅ No ORM abstraction - direct Supabase client

## Files

- `src/client.ts` - Supabase client singleton with type parameter
- `src/types/database.types.ts` - **Auto-generated** (DO NOT EDIT manually)
- `src/index.ts` - Public API exports
