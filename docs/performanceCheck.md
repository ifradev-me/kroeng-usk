# Panduan Performance Check — KROENG Website

Checklist dan tools untuk mengukur dan meningkatkan performa website KROENG USK (Next.js 13.5 + Supabase).

---

## Daftar Isi

1. [Core Web Vitals](#1-core-web-vitals)
2. [Lighthouse](#2-lighthouse)
3. [Bundle Analyzer](#3-bundle-analyzer)
4. [Network & Image Audit](#4-network--image-audit)
5. [Database & API Performance](#5-database--api-performance)
6. [Checklist Sebelum Deploy](#6-checklist-sebelum-deploy)
7. [Target Score](#7-target-score)

---

## 1. Core Web Vitals

Tiga metrik utama yang diukur Google untuk ranking SEO:

| Metrik | Keterangan | Target Baik |
|--------|-----------|------------|
| **LCP** (Largest Contentful Paint) | Seberapa cepat konten utama muncul | ≤ 2.5 detik |
| **CLS** (Cumulative Layout Shift) | Seberapa stabil layout saat loading | ≤ 0.1 |
| **INP** (Interaction to Next Paint) | Seberapa responsif terhadap klik/tap | ≤ 200 ms |

### Cara cek di Chrome

1. Buka DevTools → tab **Performance** → klik **Record**
2. Refresh halaman → stop recording
3. Lihat bagian **Web Vitals** di timeline

### Cara cek via PageSpeed Insights

Buka: [pagespeed.web.dev](https://pagespeed.web.dev) → masukkan URL KROENG

---

## 2. Lighthouse

Lighthouse adalah tool audit bawaan Chrome yang mengukur Performance, Accessibility, Best Practices, dan SEO sekaligus.

### Cara menjalankan

**Via Chrome DevTools:**
1. Buka halaman yang ingin diaudit
2. DevTools → tab **Lighthouse**
3. Pilih kategori: Performance + Accessibility + Best Practices + SEO
4. Device: **Mobile** (lebih ketat, lebih berguna) dan **Desktop**
5. Klik **Analyze page load**

**Via CLI (lebih akurat, tanpa ekstensi):**
```bash
npx lighthouse http://localhost:3000 \
  --view \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless"
```

**Via CI (untuk setiap PR):**
```bash
npx lighthouse http://localhost:3000 \
  --output json \
  --output-path ./lh-result.json
  
# Cek score performance minimal 80
node -e "
  const r = require('./lh-result.json');
  const score = r.categories.performance.score * 100;
  console.log('Performance score:', score);
  if (score < 80) process.exit(1);
"
```

### Halaman yang wajib di-audit

| Halaman | URL | Prioritas |
|---------|-----|-----------|
| Home | `/` | Tinggi |
| News list | `/news` | Tinggi |
| News detail | `/news/[slug]` | Tinggi |
| Gallery | `/gallery` | Tinggi |
| Contact | `/contact` | Sedang |
| Profile/Auth | `/profile` | Sedang |

### Interpretasi hasil Lighthouse

```
90-100 = Hijau  (bagus)
50-89  = Oranye (perlu perbaikan)
0-49   = Merah  (bermasalah)
```

---

## 3. Bundle Analyzer

Memperlihatkan ukuran setiap module dalam bundle JavaScript.

### Setup

```bash
npm install --save-dev @next/bundle-analyzer
```

Tambahkan ke `next.config.js`:
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Atau tanpa mengubah `next.config.js` secara permanen:
```bash
# Tambahkan script ke package.json
"analyze": "ANALYZE=true next build"
```

### Cara menjalankan

```bash
npm run analyze
# Atau langsung:
ANALYZE=true npm run build
```

Akan terbuka dua file HTML di browser:
- `client.html` — bundle yang dikirim ke browser
- `server.html` — bundle untuk SSR

### Yang perlu dicari

| Tanda | Artinya |
|-------|---------|
| Blok besar tapi jarang dipakai | Kandidat untuk `dynamic import` |
| Library duplikat | Versi berbeda ter-bundle dua kali |
| `node_modules` > 60% total | Terlalu banyak dependency berat |

### Optimasi umum untuk project ini

```ts
// Ganti import statis untuk komponen berat
import dynamic from 'next/dynamic';

// Contoh: ReactMarkdown hanya dipakai di halaman news
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <p>Loading...</p>,
});

// Recharts (grafik) hanya di admin dashboard
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart));
```

---

## 4. Network & Image Audit

### Cek render-blocking resources

Di Lighthouse, bagian **"Eliminate render-blocking resources"** menampilkan CSS/JS yang menunda render pertama.

**Untuk project ini**, pastikan tidak ada `@import url(fonts.googleapis.com)` di CSS — gunakan `next/font/google` (sudah diterapkan).

### Audit gambar

```bash
# Cek gambar yang tidak dioptimasi
# Di Lighthouse: "Properly size images" dan "Serve images in next-gen formats"
```

**Checklist gambar:**
- [ ] Semua gambar upload via ImageUpload component (auto-konversi ke WebP)
- [ ] Tidak ada `<img>` dengan ukuran asli > 500KB
- [ ] Gambar hero/banner menggunakan dimensi yang sesuai viewport
- [ ] `alt` text diisi untuk semua gambar

### Cek di Chrome DevTools → Network tab

1. Refresh dengan Ctrl+Shift+R (hard refresh)
2. Filter: **Img** → lihat ukuran semua gambar
3. Filter: **JS** → lihat chunk terbesar
4. Cek kolom **Size** vs **Transfer Size** (perbedaan = compression)

---

## 5. Database & API Performance

### Cek query lambat di Supabase

**Via Supabase Studio (self-hosted / Docker):**
1. Buka `http://localhost:3001` (atau `http://<IP_PI>:3001`)
2. Buka **SQL Editor**
3. Jalankan query di bawah

**Via Supabase Cloud Dashboard:**
1. Buka project → **Database** → **Query Performance**
2. Lihat query dengan execution time tinggi

**Via SQL:**
```sql
-- Query yang paling lama dieksekusi
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Index yang sudah ada (project ini)

```sql
-- Cek semua index di tabel utama
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Optimasi query umum

```ts
// ❌ Ambil semua kolom
const { data } = await supabase.from('news').select('*')

// ✅ Ambil kolom yang dibutuhkan saja
const { data } = await supabase
  .from('news')
  .select('id, title, slug, excerpt, cover_image, published_at')
  .eq('published', true)
  .order('published_at', { ascending: false })
  .limit(10)
```

### Cek N+1 queries

Perhatikan pola yang memanggil API berulang di dalam loop — ganti dengan satu query dengan `JOIN` atau `select` nested.

---

## 6. Checklist Sebelum Deploy

### Build check
```bash
# Pastikan build berhasil tanpa error
npm run build

# Cek TypeScript
npm run typecheck

# Cek lint
npm run lint

# Test produksi lokal (tanpa Docker)
npm start
```

**Jika deploy via Docker**, gunakan perintah ini sebagai gantinya:
```bash
# Build dan jalankan seluruh stack
docker compose --env-file .env.docker up -d --build

# Cek log app untuk error
docker compose --env-file .env.docker logs -f app
```

### Performance checklist

- [ ] `npm run build` selesai tanpa warning ukuran bundle (> 500KB = warning)
- [ ] Tidak ada `@import` Google Fonts di CSS (render-blocking)
- [ ] Gambar menggunakan WebP (sudah otomatis via ImageUpload)
- [ ] Tidak ada `console.log` yang tersisa di production code
- [ ] Loading state ada di semua halaman yang fetch data
- [ ] Error state ada untuk kegagalan fetch
- [ ] Pagination/limit ada untuk list yang bisa panjang (news, gallery, dll)

### Lighthouse target sebelum deploy

```
Performance  ≥ 80
Accessibility ≥ 90
Best Practices ≥ 90
SEO          ≥ 90
```

---

## 7. Target Score

### Halaman publik (prioritas tinggi)

| Halaman | Performance | Notes |
|---------|------------|-------|
| `/` (Home) | ≥ 85 | Hero image = LCP, harus cepat |
| `/news` | ≥ 85 | List view, lazy load gambar |
| `/news/[slug]` | ≥ 80 | Markdown render, banyak teks |
| `/gallery` | ≥ 75 | Banyak gambar, wajar lebih rendah |

### Catatan khusus untuk Raspberry Pi

Jika di-deploy ke Pi via Docker, test performa dari device lain di jaringan yang sama untuk mendapat gambaran yang akurat. Pi 4 dengan RAM 4GB+ umumnya cukup untuk traffic kecil-menengah.

---

*Terakhir diperbarui: April 2026*
