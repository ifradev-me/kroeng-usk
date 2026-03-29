# KROENG Website - Supabase Setup Guide

## 📁 Files Overview

| File | Description |
|------|-------------|
| `supabase-setup.sql` | Complete setup script (tables, RLS, triggers, seed data) |
| `supabase-reset.sql` | Reset/cleanup script (deletes all data) |

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Run Setup Script

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the entire content of `supabase-setup.sql`
4. Click **Run** (or press Ctrl+Enter)

### 3. Create Admin User

1. Go to **Authentication** > **Users**
2. Click **Add User** and create your admin account
3. Go to **SQL Editor** and run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 4. Configure Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these in **Settings** > **API** in your Supabase dashboard.

## 📊 Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends Supabase Auth) |
| `divisions` | Organization divisions |
| `members` | Team members |
| `news` | News articles |
| `achievements` | Competition achievements |
| `gallery` | Photo gallery |
| `knowledge` | Knowledge base articles |
| `contacts` | Contact form submissions |

### Views

| View | Description |
|------|-------------|
| `members_with_division` | Members with division info joined |
| `published_news` | Published news with author info |
| `published_knowledge` | Published articles with author info |
| `stats_summary` | Quick stats for dashboard |

## 🔒 Security (RLS Policies)

### Public Access (No Auth Required)
- ✅ Read divisions
- ✅ Read members
- ✅ Read achievements
- ✅ Read gallery
- ✅ Read published news
- ✅ Read published knowledge
- ✅ Submit contact form

### User Access (Authenticated)
- ✅ Read/update own profile

### Admin Access
- ✅ Full CRUD on all tables
- ✅ View unpublished content
- ✅ Manage contact submissions

## 📦 Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | User profile pictures | Users can upload own avatar |
| `images` | General images | Admin only |

## 🔧 Useful Queries

### Make a user admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Get dashboard stats
```sql
SELECT * FROM stats_summary;
```

### Get all members with divisions
```sql
SELECT * FROM members_with_division;
```

### Get unread contact messages
```sql
SELECT * FROM contacts WHERE status = 'new' ORDER BY created_at DESC;
```

### Mark contact as read
```sql
UPDATE contacts SET status = 'read' WHERE id = 'contact-uuid';
```

## ⚠️ Reset Database

**WARNING: This will delete all data!**

1. Go to **SQL Editor**
2. Run `supabase-reset.sql`
3. Then run `supabase-setup.sql` again

## 🔄 Auto-generated Features

The setup includes these automatic features:

1. **Auto slug generation** - News and knowledge articles get slugs from titles
2. **Auto timestamps** - `updated_at` is automatically updated
3. **Auto published_at** - Set when article is first published
4. **Auto profile creation** - Profile created when user signs up

## 📝 Notes

- All tables use UUID primary keys
- JSON columns use JSONB for better performance
- Indexes are created for common query patterns
- Triggers handle automatic data updates

## 🆘 Troubleshooting

### "permission denied" errors
- Make sure RLS is enabled and policies are created
- Check if the user has the correct role

### Storage upload fails
- Verify bucket policies are set correctly
- Check if the bucket exists

### Trigger not working
- Make sure the trigger function exists
- Check if the trigger is attached to the correct table

---

For more help, check [Supabase Documentation](https://supabase.com/docs)