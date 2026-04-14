# Panduan UI/UX Check — KROENG Website

Checklist desain, aksesibilitas, dan pengalaman pengguna untuk website KROENG USK. Cocok dijalankan sebelum deploy atau setelah perubahan UI signifikan.

---

## Daftar Isi

1. [Responsive Design](#1-responsive-design)
2. [Aksesibilitas (WCAG)](#2-aksesibilitas-wcag)
3. [Konsistensi Visual](#3-konsistensi-visual)
4. [User Flow & Navigasi](#4-user-flow--navigasi)
5. [Form & Input UX](#5-form--input-ux)
6. [Loading & Error States](#6-loading--error-states)
7. [Tools yang Digunakan](#7-tools-yang-digunakan)
8. [Checklist Per Halaman](#8-checklist-per-halaman)

---

## 1. Responsive Design

### Breakpoint yang dipakai (Tailwind default)

| Breakpoint | Lebar | Device |
|------------|-------|--------|
| `sm` | 640px | Smartphone landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### Cara test di browser

**Chrome DevTools:**
1. Buka DevTools → klik ikon **Toggle Device Toolbar** (Ctrl+Shift+M)
2. Test di preset device:
   - iPhone SE (375px) — paling kecil
   - iPhone 14 Pro (393px) — paling umum
   - iPad Air (820px) — tablet
   - Laptop 1280px — default desktop
3. Rotasi landscape juga perlu dicek untuk tablet

**Responsive Checker online:**
- [responsivedesignchecker.com](https://responsivedesignchecker.com)
- [screenfly.org](http://screenfly.org)

### Checklist responsive

**Mobile (< 768px):**
- [ ] Navbar collapse menjadi hamburger menu
- [ ] Teks tidak terpotong atau overflow horizontal
- [ ] Tombol minimal 44x44px (touch target yang nyaman)
- [ ] Form input tidak terlalu kecil untuk diketik
- [ ] Grid gallery berubah jadi 2 kolom
- [ ] Tabel admin bisa di-scroll horizontal
- [ ] Dialog/modal tidak overflow layar
- [ ] Tidak ada elemen yang melayang di posisi aneh

**Tablet (768px - 1024px):**
- [ ] Layout berubah dari mobile ke desktop dengan mulus
- [ ] Sidebar (jika ada) tampil dengan baik
- [ ] Grid gallery 3 kolom

**Desktop (> 1024px):**
- [ ] Konten tidak terlalu lebar / terlalu sempit di layar besar
- [ ] Max-width container konsisten
- [ ] Hover state pada tombol dan link berfungsi

---

## 2. Aksesibilitas (WCAG)

Target: **WCAG 2.1 Level AA**

### Kontras warna

Rasio kontras minimum:
- Teks normal: **4.5:1**
- Teks besar (≥ 18pt atau bold ≥ 14pt): **3:1**

**Cara cek:**
1. Chrome DevTools → Elements → klik elemen teks → di panel Styles klik kotak warna
2. DevTools akan otomatis menampilkan kontras ratio
3. Atau pakai [contrast-ratio.com](https://contrast-ratio.com)

**Warna utama project yang perlu dicek:**
```
Electric blue (#0ea5e9) di atas putih (#ffffff) → cek rasio
Navy (#1e3a5f) di atas putih → cek rasio
Teks abu (#6b7280) di atas putih → wajib ≥ 4.5:1
```

### Alt text pada gambar

```bash
# Cek semua <img> di halaman
# Di DevTools Console:
document.querySelectorAll('img:not([alt])').length
# Expected: 0
document.querySelectorAll('img[alt=""]').length
# Gambar dekoratif boleh alt="" tapi gambar konten harus punya deskripsi
```

### Keyboard navigation

Navigasikan seluruh halaman **hanya menggunakan keyboard** (tanpa mouse):

| Key | Fungsi |
|-----|--------|
| `Tab` | Pindah ke elemen fokus berikutnya |
| `Shift+Tab` | Kembali ke elemen sebelumnya |
| `Enter` / `Space` | Aktifkan tombol/link |
| `Esc` | Tutup dialog/modal |
| `Arrow keys` | Navigasi dalam dropdown/select |

**Checklist:**
- [ ] Setiap elemen interaktif bisa difokus dengan Tab
- [ ] Urutan Tab logis (kiri ke kanan, atas ke bawah)
- [ ] Fokus visible (ada outline/ring yang jelas)
- [ ] Dialog dapat ditutup dengan Esc
- [ ] Tidak ada "keyboard trap" (fokus terjebak di satu area)

### Fokus visible

```css
/* Pastikan tidak ada ini di globals.css (menghilangkan fokus) */
* { outline: none; }
*:focus { outline: none; }

/* Yang benar — gunakan custom style tapi jangan hapus */
*:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}
```

### ARIA labels

Elemen yang perlu ARIA label:
```tsx
// Icon-only button harus punya label
<Button aria-label="Hapus berita">
  <Trash2 className="w-4 h-4" />
</Button>

// Form field harus punya label yang terhubung
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Image dengan teks deskriptif
<img src={url} alt="Foto tim KROENG USK saat KRI 2025" />
```

### Skip link (aksesibilitas navigasi)

Untuk screen reader, idealnya ada "Skip to main content" link di awal halaman:
```tsx
// Di app/layout.tsx, tambahkan sebelum Navbar
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded"
>
  Skip to main content
</a>
```

---

## 3. Konsistensi Visual

### Typography yang digunakan

| Kelas Tailwind | Font | Penggunaan |
|----------------|------|-----------|
| `font-body` / default | Inter | Body text, paragraf |
| `font-heading` | Montserrat | Judul halaman, heading |
| `font-display` | Orbitron | Aksen, logo, elemen teknis |

**Checklist:**
- [ ] Heading halaman menggunakan `font-heading`
- [ ] Body text menggunakan `font-body` atau default
- [ ] Font size konsisten: `text-sm` untuk caption, `text-base` untuk body, `text-lg`+ untuk heading
- [ ] Line height cukup untuk legibility

### Warna yang konsisten

```bash
# Cek penggunaan warna hardcoded (harus diganti ke Tailwind classes)
grep -rn "style={{" app/ --include="*.tsx" | grep "color:"
# Idealnya tidak ada hardcoded color di style prop
```

**Palette yang dipakai:**
- Primary: `electric-500` (#0ea5e9) — tombol utama, aksen
- Secondary: `navy-900` (#1e3a5f) — heading, teks penting
- Muted: `gray-500/600` — teks sekunder, caption
- Danger: `red-600` — tombol delete, error state
- Success: `green-600` — published badge, success toast

### Komponen yang harus konsisten

- [ ] Semua tombol primary menggunakan `bg-electric-500 hover:bg-electric-600`
- [ ] Semua tombol destructive menggunakan `variant="destructive"`
- [ ] Toast notification menggunakan `sonner` (bukan alert bawaan browser)
- [ ] Loading state menggunakan skeleton (`animate-pulse`) bukan teks "Loading..."
- [ ] Card menggunakan komponen `<Card>` dari shadcn/ui

### Spacing konsisten

- [ ] Padding section halaman konsisten (biasanya `py-12` atau `py-16`)
- [ ] Gap antar card konsisten (`gap-4` atau `gap-6`)
- [ ] Tidak ada magic number spacing (misal `style={{marginTop: '13px'}}`)

---

## 4. User Flow & Navigasi

### Flow pengguna tamu (belum login)

```
Halaman Publik yang harus bisa diakses:
✓ / (home)
✓ /news
✓ /news/[slug]
✓ /gallery
✓ /knowledge
✓ /achievements
✓ /contact
✓ /structure
✓ /profile (form login/register)
✗ /admin/* → redirect ke /profile
```

**Test:**
1. Buka browser incognito
2. Navigasi ke setiap halaman di atas
3. Coba akses `/admin` → harus redirect

### Flow pengguna login

```
Tambahan yang bisa diakses:
✓ /profile (lihat/edit profil)
✓ Bisa apply jadi member
```

### Flow admin

```
Tambahan yang bisa diakses:
✓ /admin (dashboard)
✓ /admin/news
✓ /admin/gallery
✓ /admin/knowledge
✓ /admin/achievements
✓ /admin/contacts
✓ /admin/members
```

### Checklist navigasi

- [ ] Navbar menampilkan item yang sesuai role (guest vs user vs admin)
- [ ] Active state pada link navbar terlihat jelas
- [ ] Breadcrumb ada di halaman admin (jika panjang hierarki)
- [ ] Back button / navigasi kembali tersedia di halaman detail
- [ ] 404 page yang informatif (jika slug tidak ditemukan)
- [ ] Redirect setelah login mengarah ke halaman yang diminta (bukan selalu home)

---

## 5. Form & Input UX

### Checklist form umum

- [ ] Label jelas dan deskriptif (bukan hanya placeholder)
- [ ] Placeholder tidak menggantikan label (placeholder hilang saat mengetik)
- [ ] Error message spesifik di bawah field yang salah
- [ ] Required field ditandai dengan `*`
- [ ] Submit button disabled saat form tidak valid atau sedang loading
- [ ] Success feedback setelah submit (toast atau redirect)
- [ ] Form tidak di-reset saat ada error (data input tidak hilang)

### Checklist form khusus project ini

**Contact form:**
- [ ] Validasi email format
- [ ] Karakter counter untuk field pesan (tampilkan X/5000)
- [ ] Cooldown feedback setelah submit ("Anda bisa mengirim lagi dalam X detik")
- [ ] Loading state pada tombol kirim

**Login/Register:**
- [ ] Toggle show/hide password
- [ ] Error message saat email sudah terdaftar
- [ ] Error message saat password salah (generic, tidak expose info)

**Admin forms (news, gallery, dll):**
- [ ] ImageUpload menampilkan preview sebelum save
- [ ] Konfirmasi sebelum delete (dialog, bukan `window.confirm`)
- [ ] Auto-save draft (opsional, nice to have)

---

## 6. Loading & Error States

### Setiap halaman yang fetch data harus punya

**Loading state:**
```tsx
// ✅ Skeleton loading (sudah diimplementasikan di sebagian halaman)
{loading ? (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
    ))}
  </div>
) : (
  <ActualContent />
)}
```

**Empty state:**
```tsx
// ✅ Pesan informatif saat data kosong
{data.length === 0 && (
  <Card>
    <CardContent className="p-12 text-center">
      <p className="text-gray-500">Belum ada data. Tambahkan yang pertama!</p>
    </CardContent>
  </Card>
)}
```

**Error state:**
```tsx
// Tambahkan jika belum ada
{error && (
  <div className="p-4 bg-red-50 text-red-700 rounded-lg">
    Gagal memuat data. Coba refresh halaman.
  </div>
)}
```

### Checklist loading/error

- [ ] Halaman `/news` — skeleton saat loading
- [ ] Halaman `/gallery` — skeleton grid saat loading
- [ ] Halaman `/knowledge` — skeleton saat loading
- [ ] Halaman `/achievements` — skeleton saat loading
- [ ] Admin pages — skeleton saat loading
- [ ] Semua halaman punya empty state yang informatif
- [ ] Error dari Supabase tidak ditampilkan mentah ke user (hanya pesan generic)
- [ ] Toast notification muncul untuk semua aksi CRUD (berhasil dan gagal)

---

## 7. Tools yang Digunakan

### Browser Tools

| Tool | Akses | Fungsi |
|------|-------|--------|
| Chrome Lighthouse | DevTools → Lighthouse | Audit performance + accessibility |
| Chrome Axe DevTools | Extension | Cek WCAG otomatis |
| Chrome WAVE | Extension | Visual accessibility report |
| Chrome Device Toolbar | DevTools → Ctrl+Shift+M | Test responsive |

### Install Axe DevTools

```bash
# Chrome extension
# Cari "axe DevTools" di Chrome Web Store
# Gratis untuk penggunaan dasar
```

**Cara pakai Axe:**
1. Buka halaman yang ingin dicek
2. Buka DevTools → tab **axe DevTools**
3. Klik **Scan ALL of my page**
4. Review dan fix semua **Critical** dan **Serious** issues

### Online Tools

| Tool | URL | Fungsi |
|------|-----|--------|
| WAVE | [wave.webaim.org](https://wave.webaim.org) | Accessibility report visual |
| Contrast Checker | [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker) | Cek rasio kontras warna |
| Responsive Checker | [responsivedesignchecker.com](https://responsivedesignchecker.com) | Test di berbagai device |
| Real Favicon Generator | [realfavicongenerator.net](https://realfavicongenerator.net) | Cek favicon di semua platform |

---

## 8. Checklist Per Halaman

### `/` — Home

- [ ] Hero section tampil penuh di atas fold (viewport pertama)
- [ ] CTA button terlihat jelas dan kontras
- [ ] Section berita/gallery menampilkan data terbaru dari Supabase
- [ ] Animasi tidak mengganggu (tidak berlebihan)
- [ ] Load time < 3 detik di mobile

### `/news` dan `/news/[slug]`

- [ ] List news: thumbnail, judul, tanggal, excerpt terpotong dengan `line-clamp`
- [ ] Detail news: Markdown dirender dengan baik (heading, bold, list, link)
- [ ] Link eksternal di konten Markdown terbuka di tab baru (`target="_blank"`)
- [ ] Gambar di konten Markdown tidak overflow container
- [ ] Breadcrumb: Home → News → Judul Berita

### `/gallery`

- [ ] Grid gambar responsif (4 kolom desktop, 2 kolom mobile)
- [ ] Hover overlay menampilkan judul dan tombol aksi
- [ ] Lightbox / modal saat klik gambar (jika diimplementasikan)
- [ ] Filter kategori berfungsi
- [ ] Search berfungsi real-time

### `/contact`

- [ ] Semua field ada labelnya
- [ ] Validasi email format
- [ ] Feedback setelah berhasil kirim
- [ ] Cooldown 30 detik berfungsi

### `/admin/*`

- [ ] Sidebar navigasi jelas dan mudah digunakan
- [ ] Tabel data bisa di-scroll horizontal di mobile
- [ ] Dialog/modal form tidak overflow
- [ ] Konfirmasi hapus mencegah aksi tidak sengaja
- [ ] Feedback toast setelah setiap aksi

---

## Prioritas Perbaikan

### Harus diperbaiki sebelum launch

1. Semua gambar punya `alt` text yang deskriptif
2. Semua form input terhubung ke label (`htmlFor` ↔ `id`)
3. Tidak ada elemen yang tidak bisa diakses via keyboard
4. Kontras warna teks body ≥ 4.5:1

### Nice to have

1. Skip link "Skip to main content"
2. Loading spinner di image upload
3. Karakter counter di textarea panjang
4. Konfirmasi dialog (shadcn `AlertDialog`) menggantikan `window.confirm`

---

*Terakhir diperbarui: April 2026*
