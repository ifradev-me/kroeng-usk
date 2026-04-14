# Docker Tutorial – KROENG USK

Panduan lengkap menjalankan stack KROENG USK secara self-hosted menggunakan Docker Compose.  
Target platform: **Raspberry Pi 4/5 (linux/arm64)**.

---

## Daftar Isi

1. [Arsitektur Stack](#1-arsitektur-stack)
2. [Prasyarat](#2-prasyarat)
3. [Setup Pertama Kali](#3-setup-pertama-kali)
4. [Menjalankan Stack](#4-menjalankan-stack)
5. [Cek Status Service](#5-cek-status-service)
6. [Mengakses Services](#6-mengakses-services)
7. [Deploy ke Raspberry Pi](#7-deploy-ke-raspberry-pi)
8. [Maintenance](#8-maintenance)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Arsitektur Stack

```
Browser / Client
      │
      ▼
┌─────────────┐   port 3000
│  Next.js App│ ◄─── app
└──────┬──────┘
       │
       ▼
┌─────────────┐   port 8000 / 8443
│ Kong Gateway│ ◄─── API gateway (auth, REST, realtime, storage)
└──────┬──────┘
       │
   ┌───┼────────────────┐
   ▼   ▼                ▼
 auth  rest         realtime
(GoTrue)(PostgREST) (Supabase Realtime)
   │   │                │
   └───┴────────────────┘
              │
              ▼
       ┌─────────────┐
       │  PostgreSQL  │  (Supabase-flavoured)
       └─────────────┘

Tambahan:
  storage  ──► imgproxy   (transformasi gambar)
  meta                    (Postgres Meta, dipakai Studio)
  studio   port 3001      (Supabase Studio — UI admin, opsional di production)
```

| Service    | Port Host | Keterangan                           |
|------------|-----------|--------------------------------------|
| app        | 3000      | Next.js frontend                     |
| kong       | 8000/8443 | Supabase API gateway                 |
| studio     | 3001      | Supabase Studio (admin UI)           |
| db         | 5432      | PostgreSQL                           |

---

## 2. Prasyarat

### Di mesin build (laptop/PC)

- **Docker Desktop** ≥ 24 dengan **QEMU** / **buildx** aktif  
  (dibutuhkan jika cross-build ARM dari x86)
- **Docker Buildx** (sudah termasuk di Docker Desktop)

### Di Raspberry Pi

- **OS**: Raspberry Pi OS 64-bit (Bookworm) atau Ubuntu Server 24.04 arm64
- **Docker Engine** ≥ 24 + **Docker Compose** plugin

```bash
# Install Docker di Raspberry Pi
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# logout & login ulang agar group berlaku
```

---

## 3. Setup Pertama Kali

### 3.1 Salin file environment

```bash
cp .env.docker.example .env.docker
```

### 3.2 Generate JWT_SECRET

```bash
openssl rand -base64 32
```

Salin hasilnya ke `.env.docker`:

```env
JWT_SECRET=hasil_openssl_di_sini
```

### 3.3 Generate ANON_KEY dan SERVICE_ROLE_KEY

Gunakan [jwt.io](https://jwt.io) dengan secret dari `JWT_SECRET` di atas.

**Payload untuk ANON_KEY:**
```json
{
  "role": "anon",
  "iss": "supabase",
  "iat": 1700000000,
  "exp": 2015359999
}
```

**Payload untuk SERVICE_ROLE_KEY:**
```json
{
  "role": "service_role",
  "iss": "supabase",
  "iat": 1700000000,
  "exp": 2015359999
}
```

> Ganti `iat` dengan Unix timestamp sekarang (`date +%s`) dan `exp` = iat + 315360000 (10 tahun).

Salin hasilnya ke `.env.docker`:

```env
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.4 Isi sisa variabel di `.env.docker`

```env
# Ganti XXX dengan IP address Raspberry Pi di jaringan lokal
API_EXTERNAL_URL=http://192.168.1.XXX:8000
NEXT_PUBLIC_SUPABASE_URL=http://192.168.1.XXX:8000
NEXT_PUBLIC_SITE_URL=http://192.168.1.XXX:3000

POSTGRES_PASSWORD=password_postgres_yang_kuat
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=password_studio

# SMTP (opsional — untuk email verifikasi)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emailkamu@gmail.com
SMTP_PASS=gmail_app_password_16_karakter
SMTP_ADMIN_EMAIL=noreply@kroengusk.com

# Webhook secret (opsional)
WEBHOOK_SECRET=hasil_openssl_rand_hex_32
```

> **Catatan IP**: Cek IP Pi dengan `hostname -I`. Jika IP bisa berubah, set IP statis di router atau di Pi.

---

## 4. Menjalankan Stack

### Build image Next.js dan jalankan semua service

```bash
docker compose --env-file .env.docker up -d --build
```

Urutan startup otomatis (ditangani `depends_on`):

1. `db` (PostgreSQL) — tunggu sampai healthy
2. `db-migrate` — jalankan migration SQL
3. `kong`, `auth`, `rest`, `realtime`, `storage`, `imgproxy`, `meta`, `studio`
4. `app` (Next.js) — tunggu `db` healthy, `kong` started, `db-migrate` selesai

### Hanya jalankan ulang tanpa rebuild

```bash
docker compose --env-file .env.docker up -d
```

### Matikan semua service

```bash
docker compose --env-file .env.docker down
```

### Matikan dan hapus volume (HATI-HATI: data terhapus)

```bash
docker compose --env-file .env.docker down -v
```

---

## 5. Cek Status Service

```bash
# Lihat status semua container
docker compose --env-file .env.docker ps

# Ikuti log semua service sekaligus
docker compose --env-file .env.docker logs -f

# Log service tertentu
docker compose --env-file .env.docker logs -f app
docker compose --env-file .env.docker logs -f db
docker compose --env-file .env.docker logs -f db-migrate
```

**Status yang diharapkan:**

| Service    | Status       |
|------------|--------------|
| db         | healthy      |
| db-migrate | exited (0)   |
| kong       | running      |
| auth       | running      |
| rest       | running      |
| realtime   | running      |
| storage    | running      |
| imgproxy   | running      |
| meta       | running      |
| studio     | running      |
| app        | running      |

---

## 6. Mengakses Services

Setelah semua service running:

| URL                              | Keterangan                    |
|----------------------------------|-------------------------------|
| `http://<IP_PI>:3000`            | Aplikasi Next.js              |
| `http://<IP_PI>:3001`            | Supabase Studio               |
| `http://<IP_PI>:8000`            | Supabase API (Kong gateway)   |
| `http://<IP_PI>:5432`            | PostgreSQL (psql/DBeaver)     |

### Koneksi ke database via psql

```bash
docker exec -it kroeng-usk-db-1 \
  psql -U postgres -d postgres
```

---

## 7. Deploy ke Raspberry Pi

### 7.1 Build image di laptop (cross-compile ARM64)

```bash
# Aktifkan builder multi-platform (sekali saja)
docker buildx create --use --name rpi-builder

# Build dan push ke Docker Hub (opsional)
docker buildx build \
  --platform linux/arm64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=http://192.168.1.XXX:8000 \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY> \
  --build-arg NEXT_PUBLIC_SITE_URL=http://192.168.1.XXX:3000 \
  -t yourdockerhubuser/kroeng-app:latest \
  --push .
```

> Atau build langsung di Raspberry Pi (lebih lambat tapi tidak perlu cross-compile):
> ```bash
> # Di Raspberry Pi, clone repo lalu:
> docker compose --env-file .env.docker up -d --build
> ```

### 7.2 Transfer file ke Raspberry Pi via SCP

```bash
# Dari laptop ke Pi
scp -r . pi@192.168.1.XXX:~/kroeng-usk
```

### 7.3 Jalankan di Raspberry Pi

```bash
ssh pi@192.168.1.XXX
cd ~/kroeng-usk
cp .env.docker.example .env.docker
# edit .env.docker dengan nano/vim
docker compose --env-file .env.docker up -d --build
```

### 7.4 Auto-start saat Pi reboot

Semua service sudah dikonfigurasi `restart: unless-stopped`, jadi otomatis menyala kembali setelah reboot selama Docker daemon aktif:

```bash
sudo systemctl enable docker
```

---

## 8. Maintenance

### Update image Next.js setelah perubahan kode

```bash
docker compose --env-file .env.docker up -d --build app
```

### Update image Supabase (contoh: upgrade GoTrue)

Edit versi di `docker-compose.yml`, lalu:

```bash
docker compose --env-file .env.docker pull
docker compose --env-file .env.docker up -d
```

### Tambah migration baru

1. Buat file SQL di `supabase/migrations/`  
   Format nama: `YYYYMMDDHHMMSS_NNN_deskripsi.sql`
2. Daftarkan di `supabase/docker/migrate.sh`:
   ```sh
   run_migration "$MIGRATIONS_DIR/20260414000001_006_nama_migration.sql"
   ```
3. Jalankan ulang migration runner:
   ```bash
   docker compose --env-file .env.docker run --rm db-migrate
   ```

### Backup database

```bash
docker exec kroeng-usk-db-1 \
  pg_dump -U postgres postgres \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore database

```bash
docker exec -i kroeng-usk-db-1 \
  psql -U postgres postgres \
  < backup_20260414_120000.sql
```

---

## 9. Troubleshooting

### `app` container tidak mau start

Cek log app:
```bash
docker compose --env-file .env.docker logs app
```

Kemungkinan penyebab:
- `NEXT_PUBLIC_SUPABASE_URL` salah — harus URL yang bisa diakses dari browser, bukan `localhost`
- `db-migrate` belum selesai — tunggu atau cek lognya

### Database tidak bisa connect

```bash
docker compose --env-file .env.docker logs db
```

- Pastikan `POSTGRES_PASSWORD` sama di semua service
- Tunggu healthcheck `db` sampai `healthy` (bisa memakan ~60 detik saat pertama kali)

### Migration gagal

```bash
docker compose --env-file .env.docker logs db-migrate
```

- Cek apakah semua file SQL di `supabase/migrations/` ada dan tidak ada typo nama di `migrate.sh`
- Jika ingin reset migration tracking:
  ```bash
  docker exec -it kroeng-usk-db-1 \
    psql -U postgres -d postgres -c "DELETE FROM _app_migrations;"
  ```
  lalu jalankan ulang `db-migrate`

### Kong / API 401 Unauthorized

- Pastikan `ANON_KEY` dan `SERVICE_ROLE_KEY` di-generate dari `JWT_SECRET` yang sama
- Pastikan `SUPABASE_ANON_KEY` dan `SUPABASE_SERVICE_KEY` di environment Kong sudah benar

### Studio tidak bisa login

- Cek `DASHBOARD_USERNAME` dan `DASHBOARD_PASSWORD` di `.env.docker`
- Pastikan port 3001 tidak diblokir firewall:
  ```bash
  sudo ufw allow 3001
  ```

### Port sudah dipakai

```bash
sudo lsof -i :3000
sudo lsof -i :8000
```

Matikan proses yang menggunakan port tersebut atau ganti port di `docker-compose.yml`.

### Cek resource Raspberry Pi

```bash
# CPU & RAM usage
docker stats

# Disk usage
docker system df
df -h
```

---

## Referensi

- [Supabase Self-Hosting Docs](https://supabase.com/docs/guides/self-hosting/docker)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
- [Docker Buildx Multi-Platform](https://docs.docker.com/buildx/working-with-buildx/)
- [jwt.io – JWT Generator](https://jwt.io)
