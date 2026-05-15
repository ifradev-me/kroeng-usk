/*
  # Member Application — Interview Status

  Tambah status baru 'interview' di alur pendaftaran member.
  Alur jadi:
    pending     → admin review berkas
    interview   → lolos administrasi, menunggu wawancara
    approved    → final, jadi anggota
    rejected    → ditolak (bisa di tahap manapun)
*/

ALTER TABLE member_applications
  DROP CONSTRAINT IF EXISTS member_applications_status_check;

ALTER TABLE member_applications
  ADD CONSTRAINT member_applications_status_check
    CHECK (status IN ('pending', 'interview', 'approved', 'rejected'));
