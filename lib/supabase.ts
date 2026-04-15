import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'guest' | 'user' | 'admin';
  division: string | null;
  position: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Division = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  created_at: string;
};

export type Member = {
  id: string;
  profile_id: string | null;
  name: string;
  position: string;
  division_id: string | null;
  image_url: string | null;
  social_links: Record<string, string>;
  is_core_team: boolean;
  order_index: number;
  year: string | null;
  skills: string[];
  created_at: string;
  // Joined relations
  division?: Division;
  profile?: Profile;
};

export type News = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  author?: Profile;
};

export type Achievement = {
  id: string;
  title: string;
  competition_name: string;
  achievement_level: string;
  description: string | null;
  image_url: string | null;
  date: string | null;
  team_members: string[];
  created_at: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  collaboration_type: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
};

export type Knowledge = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  author?: Profile;
};

export type MemberApplication = {
  id: string;
  profile_id: string;
  
  // Personal Info
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  
  // Academic Info
  nim: string | null;
  year: string | null;
  
  // Division & Position
  division_id: string | null;
  position: string;
  
  // Application Details
  division_reason: string | null;
  skills: string[] | null;
  experience: string | null;
  motivation: string | null;
  portfolio_url: string | null;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  rejected_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Joined relations
  division?: Division;
  profile?: Profile;
};

// ============================================================================
// HELPER TYPES
// ============================================================================

// For creating new records (omit auto-generated fields)
export type NewMemberApplication = Omit<
  MemberApplication,
  'id' | 'created_at' | 'updated_at' | 'reviewed_at' | 'reviewed_by' | 'division' | 'profile'
>;

export type NewContact = Omit<Contact, 'id' | 'created_at' | 'status'>;

export type NewNews = Omit<News, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'author'>;

export type NewAchievement = Omit<Achievement, 'id' | 'created_at'>;

export type NewGalleryItem = Omit<GalleryItem, 'id' | 'created_at'>;

export type NewKnowledge = Omit<Knowledge, 'id' | 'created_at' | 'updated_at' | 'author'>;

// ============================================================================
// DATABASE RESPONSE TYPES
// ============================================================================

// Generic database response
export type DbResult<T> = {
  data: T | null;
  error: Error | null;
};

export type DbResultList<T> = {
  data: T[] | null;
  error: Error | null;
  count?: number | null;
};