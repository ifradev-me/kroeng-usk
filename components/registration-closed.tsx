'use client';

import { Lock, Calendar, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegistrationClosed() {
  return (
    <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
          <Lock className="w-8 h-8 text-orange-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-orange-900">
            Pendaftaran Anggota Ditutup
          </h3>
          <p className="text-orange-800 text-sm sm:text-base max-w-lg">
            Mohon maaf, pendaftaran anggota baru KROENG USK saat ini sudah ditutup.
            Terima kasih atas antusiasme Anda untuk bergabung dengan komunitas kami.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl mt-2">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 border border-orange-100 text-left">
            <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 text-sm">Periode Berikutnya</p>
              <p className="text-orange-700 text-xs sm:text-sm mt-1">
                Pantau terus media sosial dan website kami untuk informasi pembukaan pendaftaran
                periode selanjutnya.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 border border-orange-100 text-left">
            <Mail className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 text-sm">Tetap Terhubung</p>
              <p className="text-orange-700 text-xs sm:text-sm mt-1">
                Anda tetap bisa mengikuti kegiatan terbuka, workshop, dan event publik yang
                diadakan KROENG.
              </p>
            </div>
          </div>
        </div>

        <Alert className="bg-white/70 border-orange-200 mt-2 text-left">
          <AlertDescription className="text-orange-800 text-xs sm:text-sm">
            Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi admin KROENG melalui
            kontak resmi yang tertera di halaman utama.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
