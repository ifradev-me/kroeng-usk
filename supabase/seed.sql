/*
  ============================================================================
  KROENG USK — Seed Data
  ============================================================================
  PERINGATAN: Script ini menghapus SEMUA data yang ada lalu mengisi ulang
  dengan data contoh. Hanya jalankan di environment development/staging.

  Cara pakai:
    supabase db reset          -- reset + otomatis jalankan seed.sql
    -- atau manual:
    psql $DATABASE_URL -f supabase/seed.sql

  ============================================================================
  AUDIT: Kolom tidak terpakai yang sudah dibersihkan di migration 004
  ============================================================================
  ✅ divisions.outside_link  — ditambahkan di 003 tapi tidak pernah dipakai
  ✅ divisions.inside_link   — idem

  Kolom redundan tapi TETAP DIPAKAI (jangan dihapus):
  ⚠️  profiles.division (text) — dipakai di approve flow & profile page display
  ⚠️  profiles.position (text) — idem
  ============================================================================
*/

-- ============================================================================
-- RESET: Hapus semua data (urutan penting karena FK constraints)
-- ============================================================================
TRUNCATE TABLE
  member_applications,
  members,
  gallery,
  achievements,
  knowledge,
  news,
  contacts,
  divisions,
  profiles
RESTART IDENTITY CASCADE;


-- ============================================================================
-- DIVISIONS
-- ============================================================================
INSERT INTO divisions (id, name, slug, description, icon, order_index) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Electrical',    'electrical',    'Fokus pada rangkaian elektronik, sistem listrik, dan hardware robot. Kalau ada yang perlu disolder, divisi ini yang turun tangan.',                     'Zap',      1),
  ('d1000000-0000-0000-0000-000000000002', 'Programmer',    'programmer',    'Software development, embedded systems, AI, dan sistem robotika. Kode adalah bahasa kedua kami.',                                                        'Code',     2),
  ('d1000000-0000-0000-0000-000000000003', 'Designer',      'designer',      'Desain produk, komponen mekanik, visual teknologi, dan 3D modeling. Kalau robot butuh tampil keren, ini orangnya.',                                        'Palette',  3),
  ('d1000000-0000-0000-0000-000000000004', 'Non Technical', 'non-technical', 'Manajemen komunitas, event organizing, dan urusan organisasi. Tanpa divisi ini, KROENG tidak akan berjalan.',                                             'Users',    4)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================================
-- MEMBERS (tidak butuh profile — admin pre-register by email)
-- ============================================================================
INSERT INTO members (name, position, division_id, is_core_team, order_index, year, social_links, email) VALUES
  -- Core team
  ('Farhan Ardiansyah',   'Ketua Umum',          'd1000000-0000-0000-0000-000000000002', true,  1,  '2023', '{"instagram":"https://instagram.com/farhan.ardi","github":"https://github.com/farhan-ardi"}',  'farhan.ardiansyah@student.unsyiah.ac.id'),
  ('Zahra Aulia Putri',   'Wakil Ketua',          'd1000000-0000-0000-0000-000000000004', true,  2,  '2023', '{"instagram":"https://instagram.com/zahraaul","linkedin":"https://linkedin.com/in/zahraaul"}', 'zahra.aulia@student.unsyiah.ac.id'),
  ('Reza Maulana',        'Sekretaris',           'd1000000-0000-0000-0000-000000000004', true,  3,  '2024', '{"instagram":"https://instagram.com/reza.mln"}',                                               'reza.maulana@student.unsyiah.ac.id'),
  ('Siti Rahmawati',      'Bendahara',            'd1000000-0000-0000-0000-000000000004', true,  4,  '2024', '{"instagram":"https://instagram.com/siti.rahma","email":"siti.rahmawati@student.unsyiah.ac.id"}','siti.rahmawati@student.unsyiah.ac.id'),
  -- Electrical
  ('Muhammad Ilham',      'Kepala Divisi Electrical', 'd1000000-0000-0000-0000-000000000001', false, 10, '2023', '{"github":"https://github.com/m-ilham"}',                                                    'm.ilham@student.unsyiah.ac.id'),
  ('Andi Pratama',        'Anggota Electrical',   'd1000000-0000-0000-0000-000000000001', false, 11, '2024', '{"instagram":"https://instagram.com/andi.prtm"}',                                               'andi.pratama@student.unsyiah.ac.id'),
  -- Programmer
  ('Nadia Firdaus',       'Kepala Divisi Programmer', 'd1000000-0000-0000-0000-000000000002', false, 20, '2023', '{"github":"https://github.com/nadiafrd","linkedin":"https://linkedin.com/in/nadiafrd"}',    'nadia.firdaus@student.unsyiah.ac.id'),
  ('Bagas Wicaksono',     'Anggota Programmer',   'd1000000-0000-0000-0000-000000000002', false, 21, '2024', '{"github":"https://github.com/bagasw"}',                                                        'bagas.wicaksono@student.unsyiah.ac.id'),
  -- Designer
  ('Aulia Rahma Syafitri','Kepala Divisi Designer','d1000000-0000-0000-0000-000000000003', false, 30, '2023', '{"instagram":"https://instagram.com/aulia.rahma.s"}',                                          'aulia.syafitri@student.unsyiah.ac.id'),
  ('Deni Kurniawan',      'Anggota Designer',     'd1000000-0000-0000-0000-000000000003', false, 31, '2024', '{"instagram":"https://instagram.com/deni.krn"}',                                                'deni.kurniawan@student.unsyiah.ac.id');


-- ============================================================================
-- NEWS
-- ============================================================================
INSERT INTO news (title, slug, excerpt, content, cover_image, published, published_at) VALUES

  (
    'KROENG USK Resmi Diluncurkan: Komunitas Robotik & Engineering Aceh',
    'kroeng-usk-resmi-diluncurkan',
    'KROENG (Komunitas Robotik dan Engineering) Universitas Syiah Kuala resmi diluncurkan. Komunitas ini hadir untuk memfasilitasi mahasiswa yang berminat di bidang robotika, elektronika, dan rekayasa teknologi.',
    E'# KROENG USK Resmi Diluncurkan\n\nKROENG (Komunitas Robotik dan Engineering) Universitas Syiah Kuala dengan bangga mengumumkan peluncuran resmi komunitas kami. Komunitas ini hadir untuk menjadi wadah bagi mahasiswa-mahasiswi yang memiliki minat dan passion di bidang **robotika**, **elektronika**, dan **rekayasa teknologi**.\n\n## Visi & Misi\n\nKami hadir dengan visi menjadi komunitas teknologi terdepan di Aceh yang melahirkan inovator-inovator muda berdampak nyata.\n\n**Misi kami:**\n- Memfasilitasi pengembangan skill teknis anggota melalui workshop dan proyek nyata\n- Membangun ekosistem kolaborasi antar mahasiswa lintas prodi\n- Mengikuti dan memenangkan kompetisi robotika tingkat nasional\n- Berbagi ilmu dengan komunitas luar kampus\n\n## Divisi-divisi KROENG\n\n### Electrical\nFokus pada rangkaian elektronik, sistem embedded, dan hardware robot.\n\n### Programmer\nSoftware development, AI/ML, dan pemrograman mikrokontroler.\n\n### Designer\nDesain mekanik 3D, prototyping, dan visual branding komunitas.\n\n### Non Technical\nManajemen organisasi, event, dan hubungan eksternal.\n\n## Bergabung Sekarang\n\nBuka platform kami dan daftarkan dirimu di menu **Profil**. Kami membuka pendaftaran untuk semua divisi sepanjang tahun!',
    null,
    true,
    '2026-01-15 08:00:00+07'
  ),

  (
    'Tim KROENG USK Raih Juara 1 Kontes Robot Indonesia Regional Sumatera 2025',
    'juara-1-kri-regional-sumatera-2025',
    'Tim robot KROENG USK berhasil menyabet gelar Juara 1 pada Kontes Robot Indonesia (KRI) Regional Sumatera 2025. Pencapaian luar biasa ini membawa tim melaju ke babak nasional.',
    E'# Tim KROENG Juara 1 KRI Regional Sumatera 2025!\n\nSyukur alhamdulillah, tim robot **KROENG USK** berhasil meraih **Juara 1** pada Kontes Robot Indonesia (KRI) Regional Sumatera yang diselenggarakan di Universitas Andalas, Padang.\n\n## Tentang Kompetisi\n\nKontes Robot Indonesia (KRI) adalah kompetisi robot bergengsi tingkat nasional yang diselenggarakan oleh Pusat Prestasi Nasional Kemendikbudristek. Regional Sumatera 2025 diikuti oleh 24 tim dari 18 perguruan tinggi se-Sumatera.\n\n## Perjalanan Tim\n\nTim kami yang beranggotakan 5 orang dari divisi Electrical dan Programmer berhasil melewati:\n\n- **Penyisihan**: Robot berhasil menyelesaikan arena dalam waktu terbaik\n- **Semifinal**: Mengalahkan tim kuat dari Universitas Sriwijaya\n- **Final**: Unggul tipis atas tim Universitas Lampung dengan skor 87-82\n\n## Anggota Tim\n\n- Muhammad Ilham (Electrical — lead hardware)\n- Farhan Ardiansyah (Programmer — software)\n- Bagas Wicaksono (Programmer — AI navigation)\n- Andi Pratama (Electrical — power system)\n- Aulia Rahma Syafitri (Designer — chassis)\n\n## Selanjutnya: Nasional!\n\nDengan hasil ini, kami melaju ke babak nasional KRI 2025 di ITS Surabaya. Doakan tim kami ya! 🏆',
    null,
    true,
    '2026-03-02 10:30:00+07'
  ),

  (
    'Workshop Dasar-Dasar Arduino & IoT: Buka Pendaftaran Batch 3',
    'workshop-arduino-iot-batch-3',
    'KROENG USK kembali mengadakan workshop intensif Arduino dan Internet of Things (IoT). Workshop batch 3 ini terbuka untuk mahasiswa dari semua jurusan di Universitas Syiah Kuala.',
    E'# Workshop Arduino & IoT — Batch 3 Dibuka!\n\nKROENG USK dengan bangga membuka pendaftaran untuk **Workshop Dasar-Dasar Arduino & IoT Batch 3**. Workshop ini dirancang khusus untuk pemula yang ingin memulai perjalanan di dunia embedded systems dan Internet of Things.\n\n## Detail Workshop\n\n| Info | Detail |\n|------|--------|\n| Tanggal | 25–26 April 2026 |\n| Waktu | 08.00–17.00 WIB |\n| Tempat | Lab Teknik Elektro, Gedung TI USK |\n| Kuota | 30 peserta |\n| Biaya | Gratis (anggota KROENG) / Rp 50.000 (umum) |\n\n## Materi yang Dibahas\n\n### Hari 1: Dasar Arduino\n- Pengenalan mikrokontroler dan Arduino\n- Instalasi IDE dan library\n- GPIO: LED, Button, Buzzer\n- Sensor analog dan digital (LDR, DHT11, HC-SR04)\n- Serial communication\n\n### Hari 2: IoT & Konektivitas\n- Pengenalan ESP8266/ESP32\n- Koneksi ke WiFi dan internet\n- MQTT protocol\n- Membangun dashboard IoT sederhana\n- Mini project: Smart Home Monitoring\n\n## Syarat Pendaftaran\n\n1. Mahasiswa aktif Universitas Syiah Kuala (semua jurusan)\n2. Membawa laptop sendiri\n3. Tidak diperlukan pengalaman sebelumnya\n\n## Cara Daftar\n\nDaftarkan diri melalui link di bio Instagram kami **@kroengusk** atau hubungi panitia melalui menu Contact di website ini.',
    null,
    true,
    '2026-04-05 09:00:00+07'
  );


-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================
INSERT INTO achievements (title, competition_name, achievement_level, description, image_url, date, team_members) VALUES

  (
    'Juara 1 Kontes Robot Indonesia Regional Sumatera',
    'Kontes Robot Indonesia (KRI) Regional Sumatera 2025',
    'Juara 1 / Gold',
    'Tim robot KROENG USK berhasil meraih juara 1 pada KRI Regional Sumatera yang diikuti 24 tim dari 18 perguruan tinggi. Robot berhasil menyelesaikan semua tantangan arena dengan waktu terbaik dan lolos ke babak nasional.',
    null,
    '2025-03-01',
    ARRAY['Muhammad Ilham', 'Farhan Ardiansyah', 'Bagas Wicaksono', 'Andi Pratama', 'Aulia Rahma Syafitri']
  ),

  (
    'Runner-up Robot Line Following Gemastik XVII',
    'Gemastik XVII — Pekan Teknologi Mahasiswa',
    'Juara 2 / Silver',
    'Tim Line Follower KROENG berhasil mencapai final dan meraih posisi runner-up pada kategori Robot Line Following di Gemastik XVII yang diselenggarakan Universitas Indonesia.',
    null,
    '2024-11-10',
    ARRAY['Nadia Firdaus', 'Bagas Wicaksono', 'Andi Pratama']
  ),

  (
    'Best Design Award — Robot Innovation Challenge',
    'Robot Innovation Challenge Aceh 2024',
    'Best Design Award',
    'Robot karya divisi Designer dan Electrical KROENG mendapatkan penghargaan Best Design atas desain chassis yang inovatif dan efisien secara aerodinamis pada kompetisi tingkat provinsi Aceh.',
    null,
    '2024-09-20',
    ARRAY['Aulia Rahma Syafitri', 'Deni Kurniawan', 'Muhammad Ilham']
  ),

  (
    'Finalis Nasional Kontes Robot Indonesia 2025',
    'Kontes Robot Indonesia (KRI) Nasional 2025',
    'Finalist / Top 8',
    'Melanjutkan prestasi di regional, tim KROENG USK berhasil masuk 8 besar nasional KRI 2025 di ITS Surabaya — pencapaian terbaik KROENG sepanjang sejarah.',
    null,
    '2025-06-15',
    ARRAY['Muhammad Ilham', 'Farhan Ardiansyah', 'Bagas Wicaksono', 'Andi Pratama', 'Aulia Rahma Syafitri']
  ),

  (
    'Juara 3 Kompetisi IoT Nusantara 2024',
    'Kompetisi IoT Nusantara — Politeknik Negeri Bandung',
    'Juara 3 / Bronze',
    'Tim IoT KROENG merancang sistem monitoring kualitas udara berbasis ESP32 dan berhasil masuk 3 besar dalam kompetisi IoT tingkat nasional yang diikuti 60 tim dari seluruh Indonesia.',
    null,
    '2024-07-05',
    ARRAY['Nadia Firdaus', 'Farhan Ardiansyah']
  );


-- ============================================================================
-- GALLERY
-- ============================================================================
INSERT INTO gallery (title, description, image_url, category) VALUES
  ('Tim KROENG di KRI Regional Sumatera',     'Tim merayakan kemenangan setelah berhasil meraih Juara 1 di KRI Regional Sumatera 2025.',  '', 'competition'),
  ('Workshop Arduino Batch 2 — Lab TI USK',   'Peserta workshop sedang praktik merangkai sensor DHT11 dan menghubungkannya ke IoT dashboard.',  '', 'workshop'),
  ('Proses Perakitan Robot KRI 2025',          'Tim Electrical dan Programmer bekerja sama merakit robot untuk persiapan kompetisi KRI.',       '', 'robotics'),
  ('Sesi Brainstorming Proyek Semester Ini',   'Anggota KROENG berkumpul di laboratorium untuk sesi brainstorming proyek semester genap 2026.', '', 'team'),
  ('Pengujian Robot Line Follower',            'Robot line follower sedang diuji di arena simulasi sebelum kompetisi Gemastik XVII.',           '', 'robotics'),
  ('Pelatihan Desain 3D Fusion 360',           'Sesi pelatihan desain 3D menggunakan Autodesk Fusion 360 untuk anggota divisi Designer.',       '', 'workshop'),
  ('Pameran Teknologi FT USK 2025',            'Stand KROENG di Pameran Teknologi Fakultas Teknik USK — menampilkan robot dan proyek IoT.',    '', 'event'),
  ('Fasilitas Laboratorium KROENG',            'Laboratorium KROENG yang dilengkapi peralatan elektronika, 3D printer, dan workstation.',       '', 'facility');


-- ============================================================================
-- KNOWLEDGE (Blog / Tutorial)
-- ============================================================================
INSERT INTO knowledge (title, slug, excerpt, content, cover_image, category, tags, published) VALUES

  (
    'Panduan Lengkap Pemrograman Arduino untuk Pemula',
    'panduan-arduino-pemula',
    'Mulai perjalanan embedded systems kamu dari nol. Tutorial ini mencakup pengenalan hardware, instalasi IDE, dan proyek pertamamu menggunakan Arduino Uno.',
    E'# Panduan Arduino untuk Pemula\n\nArduino adalah platform open-source yang dirancang untuk memudahkan pembuatan proyek elektronik interaktif. Di tutorial ini, kita akan mulai dari nol.\n\n## Yang Kamu Butuhkan\n\n- Arduino Uno (atau klon)\n- Kabel USB\n- LED, resistor 220Ω, breadboard, jumper\n- Arduino IDE (gratis di arduino.cc)\n\n## Instalasi Arduino IDE\n\n1. Download dari **arduino.cc/en/software**\n2. Install seperti biasa\n3. Colokkan Arduino lewat USB\n4. Pilih board: **Tools > Board > Arduino Uno**\n5. Pilih port: **Tools > Port > COM3** (atau tergantung OS-mu)\n\n## Program Pertama: Blink\n\n```cpp\nvoid setup() {\n  pinMode(13, OUTPUT); // LED bawaan di pin 13\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH); // Nyalakan LED\n  delay(1000);             // Tunggu 1 detik\n  digitalWrite(13, LOW);  // Matikan LED\n  delay(1000);             // Tunggu 1 detik\n}\n```\n\nUpload kode di atas, LED di board Arduino-mu akan berkedip setiap 1 detik. Selamat, kamu baru saja menjalankan program pertamamu!\n\n## Membaca Sensor\n\nContoh membaca sensor suhu DHT11:\n\n```cpp\n#include <DHT.h>\n\n#define DHTPIN 2\n#define DHTTYPE DHT11\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  float suhu = dht.readTemperature();\n  float kelembaban = dht.readHumidity();\n  Serial.print("Suhu: ");\n  Serial.print(suhu);\n  Serial.println(" °C");\n  delay(2000);\n}\n```\n\n## Selanjutnya\n\nSetelah menguasai dasar-dasar ini, lanjut ke tutorial IoT kami untuk menghubungkan Arduino ke internet!',
    null,
    'tutorial',
    ARRAY['arduino', 'embedded', 'pemula', 'elektronika'],
    true
  ),

  (
    'Dasar-Dasar Elektronika yang Wajib Diketahui Sebelum Merakit Robot',
    'dasar-dasar-elektronika-robot',
    'Sebelum merakit robot, ada konsep-konsep elektronika fundamental yang harus kamu pahami. Artikel ini membahas komponen dasar, Hukum Ohm, dan cara membaca skematik.',
    E'# Dasar Elektronika untuk Robotika\n\nSebelum kamu mulai merakit robot, penting untuk memahami konsep-konsep dasar elektronika. Tanpa fondasi ini, kamu akan kesulitan mendiagnosis masalah atau merancang sirkuit sendiri.\n\n## Komponen Dasar\n\n### Resistor\nMenghambat aliran arus listrik. Nilainya dibaca dari kode warna atau angka yang tercetak. Satuan: Ohm (Ω).\n\n### Kapasitor\nMenyimpan muatan listrik sementara. Dipakai untuk filtering tegangan dan decoupling. Satuan: Farad (F), biasanya dalam µF atau nF.\n\n### Transistor\nSaklar elektronik yang dikendalikan oleh arus/tegangan kecil. Fondasi dari semua sirkuit digital modern.\n\n### Dioda\nHanya mengalirkan arus satu arah. Dioda khusus (LED) mengubah arus menjadi cahaya.\n\n## Hukum Ohm\n\nHukum paling penting dalam elektronika:\n\n```\nV = I × R\n```\n\n- **V** = Tegangan (Volt)\n- **I** = Arus (Ampere)\n- **R** = Hambatan (Ohm)\n\n**Contoh:** LED butuh 20mA dan voltage drop 2V dari supply 5V.\nR = (5 - 2) / 0.02 = **150Ω** → pakai resistor 150Ω atau 220Ω.\n\n## Cara Membaca Skematik\n\nSkematik (schematic diagram) adalah "peta" sebuah sirkuit. Simbol-simbol standar yang perlu kamu hafal:\n\n| Simbol | Komponen |\n|--------|----------|\n| Garis lurus | Kawat/konduktor |\n| Zigzag | Resistor |\n| Dua garis sejajar | Kapasitor |\n| Panah + garis | Dioda |\n| Lingkaran bersilang | LED |\n\n## Tips Praktis\n\n1. Selalu periksa polaritas kapasitor elektrolit — terbalik bisa meledak\n2. Gunakan multimeter untuk cek kontinuitas sebelum power on\n3. Tambahkan kapasitor 100nF di dekat pin VCC setiap IC untuk decoupling\n4. Hati-hati ESD (electrostatic discharge) saat memegang IC',
    null,
    'tutorial',
    ARRAY['elektronika', 'robotika', 'pemula', 'hardware'],
    true
  ),

  (
    'Tips Desain Mekanik Robot: Dari Sketsa ke Prototipe 3D',
    'tips-desain-mekanik-robot',
    'Bagaimana cara mendesain chassis robot yang kuat, ringan, dan mudah diproduksi? Artikel ini berbagi tips dari tim Designer KROENG berdasarkan pengalaman kompetisi nyata.',
    E'# Tips Desain Mekanik Robot\n\nDesain mekanik yang baik adalah fondasi robot yang handal. Berikut pelajaran yang kami pelajari setelah bertahun-tahun berkompetisi.\n\n## Prinsip Utama Desain Mekanik Robot\n\n### 1. Ringan tapi Kuat (Weight-to-Strength Ratio)\n\nGunakan material dengan rasio kekuatan-per-berat terbaik:\n- **Aluminium 6061** — ringan, kuat, mudah dikerjakan\n- **PETG/ABS** — untuk part 3D printing non-kritis\n- **Carbon fiber** — untuk aplikasi kompetisi premium\n\nHindari baja kecuali benar-benar butuh kekuatan ekstra.\n\n### 2. Design for Manufacturing (DFM)\n\nSebelum render 3D terlihat bagus, tanya diri sendiri:\n- Bisa dicetak tanpa support berlebihan?\n- Bisa diproduksi dengan alat yang kami punya?\n- Mudah di-assembly ulang saat kompetisi?\n\n### 3. Modular Design\n\nBagi robot menjadi modul yang bisa dikerjakan paralel dan diganti saat rusak:\n- Modul drive train (roda + motor)\n- Modul sensor\n- Modul aktuator (lengan, gripper)\n- Modul power\n\n## Workflow Desain di KROENG\n\n```\nSketsa tangan → Konsultasi tim → CAD (Fusion 360) \n  → Simulasi beban → Print prototipe → Uji coba \n  → Iterasi → Final machining\n```\n\n## Tool yang Kami Pakai\n\n| Tool | Fungsi |\n|------|--------|\n| Autodesk Fusion 360 | CAD 3D utama (gratis untuk pelajar) |\n| SOLIDWORKS | Simulasi FEA beban mekanik |\n| Bambu Lab X1C | 3D printing PETG/ABS |\n| CNC Router | Cutting aluminium plate |\n\n## Kesalahan Umum yang Harus Dihindari\n\n1. **Over-engineering** — tidak semua part butuh kekuatan berlebih\n2. **Mengabaikan toleransi** — selalu tambah 0.2–0.4mm clearance untuk part yang bergerak\n3. **Tidak memikirkan kabel** — rute kabel harus direncanakan dari awal\n4. **Tidak uji destruktif** — coba putus prototipe sebelum kompetisi, bukan saat kompetisi',
    null,
    'tips',
    ARRAY['desain', 'mekanik', 'robotika', '3d-printing', 'cad'],
    true
  );


-- ============================================================================
-- CONTACTS (contoh inquiry yang masuk)
-- ============================================================================
INSERT INTO contacts (name, email, subject, message, collaboration_type, status) VALUES
  (
    'Dr. Hendra Saputra',
    'hendra.saputra@unsyiah.ac.id',
    'Kolaborasi Penelitian Robot Pertanian',
    'Salam, saya dosen dari Jurusan Teknik Pertanian USK. Saya sedang mengerjakan penelitian tentang robot pertanian otonom dan tertarik untuk berkolaborasi dengan KROENG. Apakah ada kemungkinan untuk diskusi lebih lanjut?',
    'Penelitian Bersama',
    'new'
  ),
  (
    'Rina Widiastuti',
    'rina.w@smkn1banda.sch.id',
    'Undangan Mengisi Workshop di SMKN 1 Banda Aceh',
    'Kepada Tim KROENG, kami dari SMKN 1 Banda Aceh ingin mengundang rekan-rekan untuk mengisi workshop pengenalan robotika dan Arduino bagi siswa kami. Kami sangat terkesan dengan karya-karya KROENG. Mohon konfirmasinya.',
    'Workshop & Pelatihan',
    'read'
  );
