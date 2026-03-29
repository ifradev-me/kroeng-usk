-- ============================================================================
-- KROENG WEBSITE - SUPABASE COMPLETE SETUP SCRIPT
-- ============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This will create all tables, policies, functions, triggers, and seed data
-- ============================================================================

-- ============================================================================
-- PART 1: ENABLE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 2: CREATE ENUM TYPES
-- ============================================================================

-- Profile roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Contact status
DO $$ BEGIN
    CREATE TYPE contact_status AS ENUM ('new', 'read', 'replied', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 3: CREATE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Profiles (extends Supabase Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    division TEXT,
    position TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Divisions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Members
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    image_url TEXT,
    social_links JSONB DEFAULT '{}',
    is_core_team BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- News
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Achievements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    competition_name TEXT NOT NULL,
    achievement_level TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    date DATE,
    team_members TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Gallery
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Knowledge Base
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Contacts (Form Submissions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    collaboration_type TEXT,
    status contact_status DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 4: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_members_division ON members(division_id);
CREATE INDEX IF NOT EXISTS idx_members_core_team ON members(is_core_team);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_published ON knowledge(published);
CREATE INDEX IF NOT EXISTS idx_knowledge_slug ON knowledge(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
CREATE INDEX IF NOT EXISTS idx_achievements_date ON achievements(date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_divisions_order ON divisions(order_index);

-- ============================================================================
-- PART 5: CREATE FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: Update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function: Handle new user registration
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN others THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Function: Generate slug from title
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(title),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function: Auto-generate slug for news
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_generate_news_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := generate_slug(NEW.title);
        final_slug := base_slug;
        
        WHILE EXISTS (SELECT 1 FROM news WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function: Auto-generate slug for knowledge
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_generate_knowledge_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := generate_slug(NEW.title);
        final_slug := base_slug;
        
        WHILE EXISTS (SELECT 1 FROM knowledge WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function: Set published_at when publishing news
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.published = TRUE AND OLD.published = FALSE THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Apply Triggers
-- ----------------------------------------------------------------------------

-- Drop existing triggers first (to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
DROP TRIGGER IF EXISTS update_knowledge_updated_at ON knowledge;
DROP TRIGGER IF EXISTS auto_slug_news ON news;
DROP TRIGGER IF EXISTS auto_slug_knowledge ON knowledge;
DROP TRIGGER IF EXISTS set_news_published_at ON news;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at
    BEFORE UPDATE ON knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER auto_slug_news
    BEFORE INSERT OR UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION auto_generate_news_slug();

CREATE TRIGGER auto_slug_knowledge
    BEFORE INSERT OR UPDATE ON knowledge
    FOR EACH ROW EXECUTE FUNCTION auto_generate_knowledge_slug();

CREATE TRIGGER set_news_published_at
    BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- ============================================================================
-- PART 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Helper function to check if user is admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Profiles Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do everything on profiles"
    ON profiles FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Divisions Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Divisions are viewable by everyone" ON divisions;
DROP POLICY IF EXISTS "Admins can manage divisions" ON divisions;

CREATE POLICY "Divisions are viewable by everyone"
    ON divisions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage divisions"
    ON divisions FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Members Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members are viewable by everyone" ON members;
DROP POLICY IF EXISTS "Admins can manage members" ON members;

CREATE POLICY "Members are viewable by everyone"
    ON members FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage members"
    ON members FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- News Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Published news are viewable by everyone" ON news;
DROP POLICY IF EXISTS "Admins can view all news" ON news;
DROP POLICY IF EXISTS "Admins can manage news" ON news;

CREATE POLICY "Published news are viewable by everyone"
    ON news FOR SELECT
    USING (published = true);

CREATE POLICY "Admins can view all news"
    ON news FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage news"
    ON news FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Achievements Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;

CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage achievements"
    ON achievements FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Gallery Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Gallery is viewable by everyone" ON gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery;

CREATE POLICY "Gallery is viewable by everyone"
    ON gallery FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage gallery"
    ON gallery FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Knowledge Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Published knowledge are viewable by everyone" ON knowledge;
DROP POLICY IF EXISTS "Admins can view all knowledge" ON knowledge;
DROP POLICY IF EXISTS "Admins can manage knowledge" ON knowledge;

CREATE POLICY "Published knowledge are viewable by everyone"
    ON knowledge FOR SELECT
    USING (published = true);

CREATE POLICY "Admins can view all knowledge"
    ON knowledge FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage knowledge"
    ON knowledge FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Contacts Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contacts;
DROP POLICY IF EXISTS "Admins can view and manage contacts" ON contacts;

CREATE POLICY "Anyone can submit contact form"
    ON contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage contacts"
    ON contacts FOR ALL
    USING (is_admin());

-- ============================================================================
-- PART 7: STORAGE SETUP
-- ============================================================================

-- Create storage buckets (run these separately if they error)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for images bucket
DROP POLICY IF EXISTS "Public images are accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

CREATE POLICY "Public images are accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'images'
        AND is_admin()
    );

CREATE POLICY "Admins can update images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'images'
        AND is_admin()
    );

CREATE POLICY "Admins can delete images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'images'
        AND is_admin()
    );

-- -- ============================================================================
-- -- PART 8: SEED DATA
-- -- ============================================================================

-- ----------------------------------------------------------------------------
-- Seed Divisions
-- ----------------------------------------------------------------------------
INSERT INTO divisions (name, slug, description, icon, order_index)
VALUES
    ('Electrical Division', 'electrical', 'Fokus pada rangkaian elektronik, sistem listrik, dan hardware robot. Kalau ada yang perlu disolder, divisi ini yang turun tangan.', 'zap', 1),
    ('Programmer Division', 'programmer', 'Software development, embedded systems, AI, dan sistem robotika. Kode adalah bahasa kedua kami.', 'code', 2),
    ('Designer Division', 'designer', 'Desain produk, komponen mekanik, visual teknologi, dan 3D modeling. Kalau robot butuh tampil keren, ini orangnya.', 'palette', 3),
    ('Non Technical Division', 'non-technical', 'Manajemen komunitas, event organizing, dan urusan organisasi. Tanpa divisi ini, KROENG tidak akan berjalan.', 'users', 4)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index;

-- ----------------------------------------------------------------------------
-- Seed Sample Achievements
-- ----------------------------------------------------------------------------
INSERT INTO achievements (title, competition_name, achievement_level, description, date, team_members)
VALUES
    ('Juara 1 Kategori Line Follower', 'Kontes Robot Indonesia', 'Juara 1 / Gold', 'Tim KROENG berhasil meraih juara 1 dalam kategori Line Follower Robot di ajang Kontes Robot Indonesia tingkat nasional.', '2024-09-15', ARRAY['Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi']),
    ('Finalist IoT Innovation Challenge', 'International IoT Olympiad', 'Finalist', 'Proyek Smart Agriculture Monitoring System berhasil masuk babak final kompetisi internasional.', '2024-08-20', ARRAY['Dian Pratama', 'Eka Putri', 'Fajar Rahman']),
    ('Top 10 Best Innovation', 'Pekan Kreativitas Mahasiswa', 'Top 10', 'Inovasi sistem monitoring kualitas air berbasis IoT mendapat pengakuan sebagai salah satu dari 10 inovasi terbaik.', '2024-07-10', ARRAY['Gita Anjani', 'Hendra Wijaya']),
    ('Juara 2 Drone Racing', 'Inovasi Drone Indonesia', 'Juara 2 / Silver', 'Tim drone racing KROENG meraih posisi runner-up dalam kompetisi drone racing nasional.', '2024-06-25', ARRAY['Irfan Hakim', 'Joko Widodo', 'Kartika Sari']),
    ('Best Technical Implementation', 'PLN ICE', 'Special Award', 'Penghargaan khusus untuk implementasi teknis terbaik dalam kompetisi inovasi energi.', '2024-05-12', ARRAY['Lina Marlina', 'Mahendra Putra'])
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Sample Gallery
-- ----------------------------------------------------------------------------
INSERT INTO gallery (title, description, image_url, category)
VALUES
    ('Robot Line Follower V3', 'Robot line follower terbaru dengan sensor array 8 channel', 'https://images.pexels.com/photos/2085832/pexels-photo-2085832.jpeg', 'robotics'),
    ('Workshop IoT Development', 'Kegiatan workshop pengembangan sistem IoT untuk anggota baru', 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg', 'workshop'),
    ('Tim KRI 2024', 'Foto bersama tim Kontes Robot Indonesia 2024', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg', 'team'),
    ('Drone Racing Setup', 'Persiapan tim drone racing sebelum kompetisi', 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg', 'competition'),
    ('3D Printing Lab', 'Fasilitas 3D printing untuk prototyping komponen robot', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg', 'facility'),
    ('PCB Design Workshop', 'Pelatihan desain PCB menggunakan software profesional', 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg', 'workshop')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Sample News
-- ----------------------------------------------------------------------------
INSERT INTO news (title, slug, excerpt, content, cover_image, published, published_at)
VALUES
    (
        'KROENG Raih Juara 1 di Kontes Robot Indonesia 2024',
        'kroeng-juara-1-kri-2024',
        'Tim KROENG berhasil membawa pulang trofi juara pertama kategori Line Follower Robot di ajang KRI 2024.',
        '<p>Dengan bangga kami mengumumkan bahwa tim KROENG berhasil meraih posisi juara pertama dalam Kontes Robot Indonesia 2024 kategori Line Follower Robot.</p><p>Kompetisi yang diselenggarakan di Jakarta ini diikuti oleh lebih dari 50 tim dari berbagai universitas di Indonesia. Tim kami yang terdiri dari Ahmad Fauzi, Budi Santoso, dan Citra Dewi berhasil menunjukkan performa luar biasa dengan robot yang mampu menyelesaikan track dalam waktu tercepat.</p><p>Prestasi ini merupakan hasil dari kerja keras dan dedikasi seluruh anggota KROENG selama 6 bulan persiapan intensif.</p>',
        'https://images.pexels.com/photos/2085832/pexels-photo-2085832.jpeg',
        true,
        NOW() - INTERVAL '3 days'
    ),
    (
        'Workshop Arduino untuk Pemula Batch 2024',
        'workshop-arduino-pemula-2024',
        'KROENG membuka pendaftaran workshop Arduino untuk mahasiswa yang ingin belajar embedded systems.',
        '<p>KROENG kembali mengadakan workshop Arduino untuk pemula! Workshop ini ditujukan bagi mahasiswa yang ingin memulai perjalanan mereka di dunia embedded systems dan robotika.</p><p>Workshop akan mencakup pengenalan Arduino, pemrograman dasar, interfacing dengan sensor, dan proyek mini membuat sistem monitoring sederhana.</p><p>Pendaftaran dibuka mulai tanggal 1 hingga 15 bulan ini. Kuota terbatas untuk 30 peserta.</p>',
        'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
        true,
        NOW() - INTERVAL '7 days'
    ),
    (
        'Rekrutmen Anggota Baru KROENG 2024',
        'rekrutmen-anggota-baru-2024',
        'Kesempatan bergabung dengan komunitas robotika terbesar di Teknik Elektro!',
        '<p>KROENG membuka kesempatan bagi mahasiswa Teknik Elektro untuk bergabung menjadi anggota baru periode 2024/2025.</p><p>Kami mencari individu yang memiliki passion di bidang robotika, IoT, programming, atau engineering secara umum. Tidak perlu pengalaman sebelumnya - yang penting adalah semangat belajar!</p><p>Pendaftaran akan dibuka pada minggu pertama semester baru. Stay tuned untuk informasi lebih lanjut!</p>',
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
        true,
        NOW() - INTERVAL '14 days'
    )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Sample Knowledge Articles
-- ----------------------------------------------------------------------------
INSERT INTO knowledge (title, slug, excerpt, content, category, tags, published)
VALUES
    (
        'Pengenalan Arduino untuk Pemula',
        'pengenalan-arduino-pemula',
        'Panduan lengkap memulai dengan Arduino untuk pemula yang ingin belajar embedded systems.',
        '<h2>Apa itu Arduino?</h2><p>Arduino adalah platform open-source untuk membuat proyek elektronik interaktif. Platform ini terdiri dari board mikrokontroler dan software IDE untuk pemrograman.</p><h2>Mengapa Arduino?</h2><p>Arduino sangat populer karena mudah dipelajari, dokumentasi lengkap, dan komunitas yang besar. Cocok untuk pemula yang ingin belajar embedded systems.</p><h2>Memulai dengan Arduino</h2><p>Untuk memulai, kamu membutuhkan Arduino board (seperti Arduino Uno), kabel USB, dan Arduino IDE yang bisa diunduh gratis dari website resmi Arduino.</p>',
        'tutorial',
        ARRAY['arduino', 'beginner', 'embedded'],
        true
    ),
    (
        'Dasar-dasar Pemrograman Robot Line Follower',
        'pemrograman-robot-line-follower',
        'Tutorial pemrograman robot line follower menggunakan sensor infrared.',
        '<h2>Konsep Line Follower</h2><p>Robot line follower adalah robot yang dapat mengikuti garis (biasanya hitam) di atas permukaan (biasanya putih). Robot ini menggunakan sensor infrared untuk mendeteksi garis.</p><h2>Komponen yang Dibutuhkan</h2><ul><li>Arduino Uno</li><li>Sensor IR Array</li><li>Motor Driver L298N</li><li>Motor DC</li><li>Chassis robot</li></ul><h2>Algoritma Dasar</h2><p>Algoritma PID (Proportional-Integral-Derivative) adalah metode paling umum untuk mengontrol robot line follower agar bergerak smooth mengikuti garis.</p>',
        'tutorial',
        ARRAY['robotics', 'line-follower', 'programming'],
        true
    ),
    (
        'Pengantar IoT dengan ESP32',
        'pengantar-iot-esp32',
        'Memahami dasar Internet of Things menggunakan mikrokontroler ESP32.',
        '<h2>Apa itu IoT?</h2><p>Internet of Things (IoT) adalah konsep di mana perangkat fisik terhubung ke internet dan dapat berkomunikasi satu sama lain. ESP32 adalah salah satu mikrokontroler populer untuk proyek IoT.</p><h2>Keunggulan ESP32</h2><ul><li>Built-in WiFi dan Bluetooth</li><li>Dual-core processor</li><li>Banyak GPIO pins</li><li>Harga terjangkau</li></ul><h2>Proyek IoT Sederhana</h2><p>Proyek IoT pertama yang bisa kamu coba adalah monitoring suhu dan kelembaban menggunakan sensor DHT22 yang datanya dikirim ke platform cloud seperti ThingSpeak atau Blynk.</p>',
        'tutorial',
        ARRAY['iot', 'esp32', 'wifi'],
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PART 9: CREATE VIEWS (Optional but useful)
-- ============================================================================

-- View for members with division info
CREATE OR REPLACE VIEW members_with_division AS
SELECT
    m.*,
    d.name as division_name,
    d.slug as division_slug
FROM members m
LEFT JOIN divisions d ON m.division_id = d.id
ORDER BY m.is_core_team DESC, m.order_index ASC;

-- View for published news with author
CREATE OR REPLACE VIEW published_news AS
SELECT
    n.*,
    p.full_name as author_name,
    p.avatar_url as author_avatar
FROM news n
LEFT JOIN profiles p ON n.author_id = p.id
WHERE n.published = true
ORDER BY n.published_at DESC;

-- View for published knowledge with author
CREATE OR REPLACE VIEW published_knowledge AS
SELECT
    k.*,
    p.full_name as author_name,
    p.avatar_url as author_avatar
FROM knowledge k
LEFT JOIN profiles p ON k.author_id = p.id
WHERE k.published = true
ORDER BY k.created_at DESC;

-- View for stats summary
CREATE OR REPLACE VIEW stats_summary AS
SELECT
    (SELECT COUNT(*) FROM members) as total_members,
    (SELECT COUNT(*) FROM achievements) as total_achievements,
    (SELECT COUNT(*) FROM gallery) as total_gallery,
    (SELECT COUNT(*) FROM knowledge WHERE published = true) as total_articles,
    (SELECT COUNT(*) FROM news WHERE published = true) as total_news,
    (SELECT COUNT(*) FROM contacts WHERE status = 'new') as unread_contacts;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Supabase database is now set up with:
-- ✅ All required tables
-- ✅ Indexes for better performance
-- ✅ Functions and triggers for automation
-- ✅ Row Level Security policies
-- ✅ Storage buckets for images
-- ✅ Sample seed data
-- ✅ Useful views
--
-- Next steps:
-- 1. Create your first admin user through Supabase Auth
-- 2. Update that user's role to 'admin' in the profiles table:
--    UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- 3. Configure your environment variables in your Next.js app
-- ============================================================================

-- ============================================================================
-- KROENG - MEMBER APPLICATIONS TABLE
-- ============================================================================
-- Run this after the main supabase-setup.sql
-- Or add this to the main setup file
-- ============================================================================
-- ============================================================================
-- KROENG - MEMBER APPLICATIONS TABLE
-- ============================================================================
-- Run this after the main supabase-setup.sql
-- Or add this to the main setup file
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Member Applications Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Personal Info
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    
    -- Academic Info
    nim TEXT,
    year TEXT,
    
    -- Division & Position
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    position TEXT NOT NULL DEFAULT 'Member',
    
    -- Application Details
    division_reason TEXT,          -- Alasan pilih divisi tersebut
    skills TEXT[],                 -- Array of skills
    experience TEXT,               -- Pengalaman sebelumnya
    motivation TEXT,               -- Motivasi gabung KROENG
    portfolio_url TEXT,            -- Link portfolio (optional)
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejected_reason TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_member_applications_profile ON member_applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_member_applications_status ON member_applications(status);
CREATE INDEX IF NOT EXISTS idx_member_applications_division ON member_applications(division_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_member_applications_updated_at ON member_applications;
CREATE TRIGGER update_member_applications_updated_at
    BEFORE UPDATE ON member_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- RLS Policies
-- ----------------------------------------------------------------------------
ALTER TABLE member_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
DROP POLICY IF EXISTS "Users can view own applications" ON member_applications;
CREATE POLICY "Users can view own applications"
    ON member_applications FOR SELECT
    USING (auth.uid() = profile_id);

-- Users can create applications for themselves
DROP POLICY IF EXISTS "Users can create own applications" ON member_applications;
CREATE POLICY "Users can create own applications"
    ON member_applications FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage applications" ON member_applications;
CREATE POLICY "Admins can manage applications"
    ON member_applications FOR ALL
    USING (is_admin());

-- ----------------------------------------------------------------------------
-- Function to auto-update reviewed_at when status changes
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_application_reviewed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
        NEW.reviewed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_application_reviewed ON member_applications;
CREATE TRIGGER set_application_reviewed
    BEFORE UPDATE ON member_applications
    FOR EACH ROW EXECUTE FUNCTION update_application_reviewed();

-- ============================================================================
-- DONE!
-- ============================================================================