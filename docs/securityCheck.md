# Panduan Security Check — KROENG Website

Checklist keamanan berkala untuk website KROENG USK (Next.js 13.5 + Supabase). Dokumen ini mencerminkan hasil security review April 2026 dan fix yang telah diterapkan.

---

## Daftar Isi

1. [Dependency Audit](#1-dependency-audit)
2. [Environment & Secrets](#2-environment--secrets)
3. [Supabase RLS Verification](#3-supabase-rls-verification)
4. [Security Headers](#4-security-headers)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Input Validation](#6-input-validation)
7. [File Upload](#7-file-upload)
8. [API Endpoints](#8-api-endpoints)
9. [Checklist Berkala](#9-checklist-berkala)

---

## 1. Dependency Audit

### Cek vulnerability di package

```bash
# Audit semua dependency
npm audit

# Lihat hanya high/critical
npm audit --audit-level=high

# Fix otomatis (hati-hati: bisa breaking change)
npm audit fix

# Fix termasuk major version (manual review diperlukan)
npm audit fix --force
```

### Cek dependency yang outdated

```bash
npm outdated
```

### Kapan dilakukan

- Setiap kali `npm install` package baru
- Minimal satu kali per bulan
- Setelah ada laporan CVE untuk Next.js, React, atau Supabase JS

---

## 2. Environment & Secrets

### Pastikan `.env` tidak ter-commit

```bash
# Cek apakah .env masuk git
git status .env
git log --oneline -- .env

# Jika pernah ter-commit, hapus dari history:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' HEAD
```

### Verifikasi `.gitignore`

```bash
# File-file ini HARUS ada di .gitignore
grep -E "^\.env" .gitignore
# Output yang diharapkan:
# .env
# .env.local
# .env.docker
```

### Variabel yang wajib ada di server (BUKAN NEXT_PUBLIC_)

| Variabel | Keterangan |
|----------|-----------|
| `WEBHOOK_SECRET` | Untuk verifikasi HMAC webhook |

### Yang boleh PUBLIC (aman di browser)

| Variabel | Alasan Aman |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Hanya URL endpoint, bukan credential |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key terbatas, dilindungi RLS |

> **Ingat:** `SERVICE_ROLE_KEY` **TIDAK BOLEH** ada di variabel `NEXT_PUBLIC_*` — key ini bypass semua RLS policy.

---

## 3. Supabase RLS Verification

### Test privilege escalation (C1) — KRITIS

Verifikasi bahwa user biasa tidak bisa mengubah role-nya sendiri menjadi admin.

```js
// Jalankan di browser console setelah login sebagai user biasa
// Harus GAGAL dengan error permission denied

const { error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', (await supabase.auth.getUser()).data.user.id);

console.log(error?.message);
// Expected: "new row violates row-level security policy"
```

### Test admin DELETE contacts (C2)

```js
// Login sebagai admin, lalu:
const { error } = await supabase
  .from('contacts')
  .delete()
  .eq('id', 'some-contact-id');

console.log(error); // Expected: null (sukses)
```

### Test duplicate member application (H4)

```js
// Login sebagai user, kirim dua aplikasi sekaligus
// Kedua insert tidak boleh berhasil — salah satu harus gagal

const { error } = await supabase
  .from('member_applications')
  .insert({ profile_id: userId, message: 'test' });

console.log(error?.message);
// Jika sudah ada pending: unique violation
```

### Cek RLS aktif di semua tabel

```sql
-- Jalankan di Supabase SQL Editor
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Semua tabel harus: rowsecurity = true
```

### Lihat semua policy yang aktif

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

---

## 4. Security Headers

### Verifikasi headers aktif

```bash
# Cek response headers dari server
curl -sI http://localhost:3000 | grep -E "X-Frame|X-Content|Referrer|Permissions|Strict-Transport"

# Expected output:
# x-frame-options: DENY
# x-content-type-options: nosniff
# referrer-policy: strict-origin-when-cross-origin
# permissions-policy: camera=(), microphone=(), geolocation=()
# strict-transport-security: max-age=31536000; includeSubDomains
```

### Via online tool

Buka [securityheaders.com](https://securityheaders.com) → masukkan URL production → target nilai **A atau A+**

### Di Lighthouse

DevTools → Lighthouse → **Best Practices** → cek bagian "Does not use HTTPS" dan security-related items.

---

## 5. Authentication & Authorization

### Verifikasi halaman admin terlindungi

```bash
# Coba akses admin tanpa login — harus redirect
curl -sI http://localhost:3000/admin
# Expected: 307 redirect ke /profile?redirect=/admin
```

### Verifikasi middleware aktif

```bash
# File harus ada
ls middleware.ts

# Pastikan matcher mencakup /admin/*
grep "matcher" middleware.ts
# Expected: matcher: ['/admin/:path*']
```

### Cek di browser (incognito)

1. Buka tab incognito
2. Navigasi langsung ke `http://localhost:3000/admin`
3. Harus langsung redirect ke halaman profile/login
4. Tidak boleh ada "flash" tampilan admin sebelum redirect

### Verifikasi email confirmation

**Self-hosted / Docker — via Supabase Studio:**
1. Buka `http://localhost:3001` (atau `http://<IP_PI>:3001`)
2. Navigasi ke **Authentication** → **Providers** → **Email**
3. Pastikan **"Confirm email"** dalam keadaan **ON**

**Supabase Cloud:**
1. Buka Supabase Dashboard → project → **Authentication** → **Providers** → **Email**
2. Pastikan **"Confirm email"** dalam keadaan **ON**

> Jika OFF, user bisa daftar dan langsung login tanpa verifikasi email.

---

## 6. Input Validation

### Contact form — rate limiting

```bash
# Submit form dua kali dalam 30 detik
# Submit kedua harus ditolak dengan pesan "Mohon tunggu sebentar..."
```

### Contact form — honeypot

Buka DevTools → Elements, cari field tersembunyi:
```html
<!-- Harus ada hidden field ini -->
<input name="website" style="display:none" tabindex="-1" autocomplete="off" />
```

### Contact form — maxLength validation

```bash
# Coba input lebih dari batas:
# Nama > 100 karakter → harus ditolak
# Email > 254 karakter → harus ditolak
# Subject > 200 karakter → harus ditolak
# Pesan > 5000 karakter → harus ditolak
```

### Password minimum length

```bash
# Di halaman profile, coba ganti password dengan 7 karakter
# Harus ditolak oleh browser (minLength=8)
```

---

## 7. File Upload

### Verifikasi validasi file

1. Coba upload file bukan gambar (`.pdf`, `.exe`, `.txt`)
2. Harus ditolak dengan error "Please select an image file"

### Verifikasi konversi WebP

1. Upload gambar `.jpg` atau `.png`
2. Cek URL yang tersimpan di database → harus berakhiran `.webp`
3. Cek di Supabase Storage → file harus tersimpan sebagai WebP

### Verifikasi URL validation di image upload

1. Di form yang punya input URL manual (misal gallery), coba masukkan:
   - `http://example.com/image.jpg` → harus ditolak (bukan HTTPS)
   - `javascript:alert(1)` → harus ditolak
   - `https://example.com/image.jpg` → harus diterima

---

## 8. API Endpoints

### Webhook endpoint

```bash
# Tanpa signature → harus ditolak 401
curl -s -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "\nHTTP Status: %{http_code}\n"
# Expected: HTTP Status: 401

# Dengan signature salah → harus ditolak 401
curl -s -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: sha256=invalid_signature" \
  -d '{"test": "data"}' \
  -w "\nHTTP Status: %{http_code}\n"
# Expected: HTTP Status: 401
```

**Catatan:** Jika webhook belum digunakan, pertimbangkan untuk menghapus endpoint ini sama sekali.

---

## 9. Checklist Berkala

### Bulanan

- [ ] `npm audit` — tidak ada high/critical vulnerability
- [ ] Cek login attempts mencurigakan — via Studio (`http://localhost:3001` → **Authentication → Users**) jika self-hosted, atau Supabase Dashboard jika cloud
- [ ] Verifikasi RLS privilege escalation (test C1 di atas)
- [ ] Review Supabase Storage → hapus file yang tidak terpakai

### Per Rilis / Deploy

- [ ] `npm run build` berhasil (ESLint aktif, tanpa `ignoreDuringBuilds`)
- [ ] `npm run typecheck` tidak ada error
- [ ] Security headers aktif (curl test)
- [ ] Halaman admin terlindungi (incognito test)
- [ ] Contact form rate limiting berfungsi
- [ ] File upload hanya terima gambar

### Setelah Menambah Migration Baru

- [ ] RLS policy diterapkan ke semua tabel baru
- [ ] Kolom sensitif tidak bisa diupdate oleh user biasa
- [ ] Test dengan akun non-admin sebelum push ke production

### Checklist Saat Ada Anggota Admin Baru

- [ ] Buat akun terlebih dahulu, baru set role admin via Supabase Dashboard atau `set_admin.sql`
- [ ] Jangan pernah share `SERVICE_ROLE_KEY`
- [ ] Pastikan akun admin menggunakan password minimal 12 karakter

---

## Ringkasan Status Keamanan (April 2026)

| Area | Status | Keterangan |
|------|--------|-----------|
| SQL Injection | Aman | Semua query via Supabase SDK (parameterized) |
| XSS | Aman | React auto-escape + JSON-LD sanitized |
| CSRF | Aman | JWT-based auth via Supabase |
| RLS Privilege Escalation | **Diperbaiki** | Migration 005 — April 2026 |
| Security Headers | **Ditambahkan** | next.config.js — April 2026 |
| Webhook Auth | **Diperbaiki** | HMAC-SHA256 — April 2026 |
| Contact Form Spam | **Diperbaiki** | Honeypot + rate limit — April 2026 |
| Admin Middleware | **Ditambahkan** | middleware.ts — April 2026 |
| File Upload | Baik | Validasi + WebP conversion |
| Session Management | Baik | Dikelola Supabase |
| Secrets Management | Baik | .env di .gitignore |

---

*Terakhir diperbarui: April 2026 — berdasarkan security review menyeluruh*
