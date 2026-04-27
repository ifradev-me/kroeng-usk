import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Kolaborasi, sponsorship, atau pertanyaan seputar KROENG USK — komunitas robotika kompetitif Teknik Elektro USK. Kami siap bekerja sama.',
  keywords: ['kontak KROENG', 'kolaborasi robotika', 'sponsorship KROENG', 'hubungi KROENG USK', 'kerjasama teknik elektro USK'],
  openGraph: {
    title: 'Hubungi Kami | KROENG',
    description: 'Kolaborasi, sponsorship, atau pertanyaan seputar KROENG USK — komunitas robotika kompetitif Teknik Elektro USK.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
