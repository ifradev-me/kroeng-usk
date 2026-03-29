# Panduan SEO untuk KROENG Website (Next.js 13.5)

Dokumentasi lengkap untuk mengoptimalkan SEO website KROENG USK.

---

## Daftar Isi

1. [Struktur File SEO](#1-struktur-file-seo)
2. [Setup Awal](#2-setup-awal)
3. [Metadata Per Halaman](#3-metadata-per-halaman)
4. [Halaman Dinamis](#4-halaman-dinamis)
5. [JSON-LD Structured Data](#5-json-ld-structured-data)
6. [Client Components](#6-client-components)
7. [Optimasi Gambar](#7-optimasi-gambar)
8. [Internal Linking](#8-internal-linking)
9. [Checklist Deployment](#9-checklist-deployment)
10. [Tools & Monitoring](#10-tools--monitoring)

---


---

## 2. Setup Awal

### 2.1 Install Dependencies

Tidak perlu install tambahan — semua menggunakan fitur bawaan Next.js.

### 2.2 Buat File `lib/seo.ts`

```typescript
import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kroeng.com';
const siteName = 'KROENG';
const defaultImage = '/images/og-img.png';

// ================================
// PAGE METADATA (halaman statis)
// ================================
interface PageSEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  path?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image = defaultImage,
  path = '',
  noIndex = false,
}: PageSEOProps): Metadata {
  const url = `${baseUrl}${path}`;
  const ogImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: ['KROENG', 'robotika', 'teknik elektro', 'USK', ...keywords],
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url,
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

// ================================
// ARTICLE METADATA (news, knowledge)
// ================================
interface ArticleSEOProps extends PageSEOProps {
  publishedTime: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function generateArticleMetadata({
  title,
  description,
  keywords = [],
  image = defaultImage,
  path = '',
  publishedTime,
  modifiedTime,
  authors = ['KROENG Team'],
  tags = [],
}: ArticleSEOProps): Metadata {
  const url = `${baseUrl}${path}`;
  const ogImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: ['KROENG', ...keywords, ...tags],
    authors: authors.map((name) => ({ name })),
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url,
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

// ================================
// JSON-LD GENERATORS
// ================================

export function generateArticleJsonLd({
  title,
  description,
  image,
  path,
  publishedTime,
  modifiedTime,
  authors = ['KROENG Team'],
}: {
  title: string;
  description: string;
  image: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  authors?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image.startsWith('http') ? image : `${baseUrl}${image}`,
    url: `${baseUrl}${path}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: authors.map((name) => ({ '@type': 'Person', name })),
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/images/kroengusk-icon.png` },
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

// ================================
// JSON-LD COMPONENT
// ================================
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 2.3 Buat `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kroeng.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Halaman statis
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/achievements`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/knowledge`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/structure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Halaman dinamis - News
  const { data: news } = await supabase
    .from('news')
    .select('slug, published_at')
    .eq('published', true);

  const newsEntries = (news || []).map((item) => ({
    url: `${baseUrl}/news/${item.slug}`,
    lastModified: new Date(item.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Halaman dinamis - Knowledge
  const { data: knowledge } = await supabase
    .from('knowledge')
    .select('slug, created_at')
    .eq('published', true);

  const knowledgeEntries = (knowledge || []).map((item) => ({
    url: `${baseUrl}/knowledge/${item.slug}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...newsEntries, ...knowledgeEntries];
}
```

### 2.4 Buat `app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kroeng.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/profile/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 3. Metadata Per Halaman

### Halaman Server Component (Biasa)

```typescript
// app/achievements/page.tsx
import { Metadata } from 'next';
import { generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

// ✅ Export metadata langsung
export const metadata: Metadata = {
  title: 'Prestasi & Penghargaan',
  description: 'Daftar prestasi KROENG USK dalam kompetisi robotika nasional...',
  keywords: ['prestasi', 'juara', 'KRI', 'kompetisi'],
};

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Prestasi', path: '/achievements' },
]);

export default function AchievementsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <main>
        <h1>Prestasi & Penghargaan</h1>
        {/* ... */}
      </main>
    </>
  );
}
```

---

## 4. Halaman Dinamis

Untuk halaman dengan `[slug]`, gunakan `generateMetadata()`:

```typescript
// app/news/[slug]/page.tsx
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateArticleMetadata, generateArticleJsonLd, JsonLd } from '@/lib/seo';

interface PageProps {
  params: { slug: string };
}

// Fetch data
async function getNews(slug: string) {
  const { data } = await supabase
    .from('news')
    .select('*, author:profiles(full_name)')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return data;
}

// ✅ Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const news = await getNews(params.slug);
  
  if (!news) return { title: 'Not Found' };

  return generateArticleMetadata({
    title: news.title,
    description: news.excerpt || '',
    path: `/news/${news.slug}`,
    image: news.cover_image,
    publishedTime: news.published_at,
  });
}

// ✅ Static params untuk build time (opsional, bagus untuk performa)
export async function generateStaticParams() {
  const { data } = await supabase.from('news').select('slug').eq('published', true);
  return (data || []).map((item) => ({ slug: item.slug }));
}

export default async function NewsDetailPage({ params }: PageProps) {
  const news = await getNews(params.slug);
  
  const articleJsonLd = generateArticleJsonLd({
    title: news.title,
    description: news.excerpt,
    image: news.cover_image,
    path: `/news/${news.slug}`,
    publishedTime: news.published_at,
  });

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <article>
        <h1>{news.title}</h1>
        {/* ... */}
      </article>
    </>
  );
}
```

---

## 5. JSON-LD Structured Data

### Tipe JSON-LD yang Tersedia

| Tipe | Fungsi | Gunakan di |
|------|--------|-----------|
| `Organization` | Info organisasi | `layout.tsx` (sudah ada) |
| `Article` | Artikel/berita | `news/[slug]`, `knowledge/[slug]` |
| `BreadcrumbList` | Navigasi breadcrumb | Semua halaman |
| `ImageGallery` | Galeri foto | `gallery/page.tsx` |
| `FAQPage` | Halaman FAQ | Jika ada halaman FAQ |

### Contoh Implementasi

```typescript
// Breadcrumb (semua halaman)
const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Berita', path: '/news' },
  { name: 'Judul Artikel', path: '/news/judul-artikel' },
]);

// Article (news & knowledge)
const article = generateArticleJsonLd({
  title: 'Judul Artikel',
  description: 'Deskripsi...',
  image: '/images/cover.jpg',
  path: '/news/judul-artikel',
  publishedTime: '2024-01-15T00:00:00Z',
});

// Di component
<>
  <JsonLd data={breadcrumb} />
  <JsonLd data={article} />
  <article>...</article>
</>
```

---

## 6. Client Components

Untuk halaman dengan `'use client'`, metadata tidak bisa di-export dari file yang sama. Solusinya:

### Opsi 1: Buat `layout.tsx` (Recommended)

```typescript
// app/contact/layout.tsx
import { Metadata } from 'next';
import { generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Hubungi KROENG USK untuk kolaborasi dan pertanyaan.',
};

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Kontak', path: '/contact' },
]);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
```

```typescript
// app/contact/page.tsx
'use client';

export default function ContactPage() {
  // Client component, tidak ada metadata di sini
  return <div>...</div>;
}
```

### Opsi 2: Pisahkan Content ke Client Component

```typescript
// app/contact/page.tsx (Server Component)
import { Metadata } from 'next';
import ContactForm from './contact-form'; // Client component

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: '...',
};

export default function ContactPage() {
  return <ContactForm />;
}
```

```typescript
// app/contact/contact-form.tsx
'use client';

export default function ContactForm() {
  // Semua logic client di sini
  return <form>...</form>;
}
```

---

## 7. Optimasi Gambar

### Gunakan next/image

```tsx
import Image from 'next/image';

// ✅ BENAR
<Image
  src="/images/robot.jpg"
  alt="Robot line follower KROENG juara KRI 2024"
  width={800}
  height={600}
  priority  // untuk gambar above the fold
/>

// ❌ SALAH - alt tidak deskriptif
<Image src="/images/robot.jpg" alt="gambar" />

// ❌ SALAH - pakai tag img biasa
<img src="/images/robot.jpg" alt="Robot" />
```

### Tips Alt Text

| Buruk | Baik |
|-------|------|
| `alt="gambar"` | `alt="Robot line follower KROENG"` |
| `alt="foto"` | `alt="Tim KROENG menerima trophy juara 1 KRI 2024"` |
| `alt="cover"` | `alt="Workshop IoT dengan ESP32 di Lab Robotika USK"` |

---

## 8. Internal Linking

Hubungkan halaman-halaman yang relevan:

```tsx
// Di halaman news, link ke achievements
<p>
  Prestasi ini menambah koleksi{' '}
  <Link href="/achievements" className="text-electric-600 hover:underline">
    penghargaan KROENG
  </Link>{' '}
  tahun ini.
</p>

// Di halaman achievements, link ke news
<p>
  Baca{' '}
  <Link href="/news/juara-kri-2024">
    berita lengkapnya
  </Link>.
</p>

// Di halaman knowledge, link ke related articles
<div className="mt-8">
  <h2>Artikel Terkait</h2>
  <ul>
    <li><Link href="/knowledge/tutorial-esp32-dasar">Tutorial ESP32 Dasar</Link></li>
    <li><Link href="/knowledge/sensor-ultrasonic">Menggunakan Sensor Ultrasonic</Link></li>
  </ul>
</div>
```

---

## 9. Checklist Deployment

### Sebelum Deploy

- [ ] Semua halaman punya `title` unik
- [ ] Semua halaman punya `description` (120-160 karakter)
- [ ] Semua gambar punya `alt` deskriptif
- [ ] `sitemap.ts` include semua halaman
- [ ] `robots.ts` blokir `/admin/` dan `/api/`
- [ ] JSON-LD Organization di `layout.tsx`
- [ ] JSON-LD Breadcrumb di setiap halaman
- [ ] JSON-LD Article di news & knowledge

### Setelah Deploy

- [ ] Test `/sitemap.xml` bisa diakses
- [ ] Test `/robots.txt` bisa diakses
- [ ] Submit sitemap ke Google Search Console
- [ ] Submit sitemap ke Bing Webmaster Tools
- [ ] Test JSON-LD di Rich Results Test
- [ ] Test performa di PageSpeed Insights

---

## 10. Tools & Monitoring

### Google Search Console

1. Buka https://search.google.com/search-console
2. Tambahkan property `https://kroeng.com`
3. Verifikasi ownership
4. Submit sitemap: `https://kroeng.com/sitemap.xml`
5. Monitor:
   - Coverage (halaman yang diindex)
   - Performance (search queries)
   - Core Web Vitals

### Testing Tools

| Tool | URL | Gunakan untuk |
|------|-----|---------------|
| Rich Results Test | https://search.google.com/test/rich-results | Test JSON-LD |
| PageSpeed Insights | https://pagespeed.web.dev | Core Web Vitals |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly | Responsiveness |
| Schema Validator | https://validator.schema.org | Validate JSON-LD |

### Monitoring Rutin

| Frekuensi | Task |
|-----------|------|
| Mingguan | Cek Search Console untuk errors |
| Bulanan | Review Core Web Vitals |
| Per artikel | Pastikan metadata & JSON-LD lengkap |

---

## Quick Reference

### Metadata Wajib Per Halaman

```typescript
export const metadata: Metadata = {
  title: 'Judul Halaman',           // Wajib, unik
  description: 'Deskripsi...',       // Wajib, 120-160 char
  keywords: ['keyword1', 'keyword2'], // Opsional
};
```

### JSON-LD Minimum

```tsx
// Semua halaman
<JsonLd data={generateBreadcrumbJsonLd([...])} />

// Halaman artikel
<JsonLd data={generateArticleJsonLd({...})} />
```

### File Wajib

| File | Lokasi |
|------|--------|
| `sitemap.ts` | `app/sitemap.ts` |
| `robots.ts` | `app/robots.ts` |
| `seo.ts` | `lib/seo.ts` |

---

## Troubleshooting

### Metadata tidak muncul

1. Pastikan `export const metadata` (bukan `const metadata`)
2. Untuk client component, pindahkan ke `layout.tsx`
3. Clear cache: `rm -rf .next && npm run build`

### Sitemap error

1. Cek Supabase connection
2. Wrap database calls dalam try-catch
3. Return array kosong jika error

### JSON-LD tidak terdeteksi

1. Gunakan Rich Results Test
2. Pastikan format JSON valid
3. Cek apakah script ter-render di HTML

---

*Dokumentasi ini dibuat untuk KROENG USK. Update terakhir: 2024*