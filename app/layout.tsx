import "./globals.css";
import type { Metadata } from 'next';
import { Inter, Montserrat, Orbitron } from 'next/font/google';
import Script from 'next/script';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

// ─── Site Config ──────────────────────────────────────────────────────────────

const siteConfig = {
  name: 'KROENG',
  fullName: 'KROENG - Komunitas Robotic Electrical Engineering USK',
  description:
    'Forge Engineers. Win Competitions. Komunitas robotika kompetitif mahasiswa Teknik Elektro USK yang mencetak engineer berprestasi lewat KRI, KRTI, dan kompetisi robotika nasional.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kroeng.com',
  ogImage: '/images/og-img.png',
  email: 'kroengusk@gmail.com',
  foundingYear: '2017',
  keywords: [
    // Brand
    'KROENG', 'KROENG USK', 'komunitas robot Aceh', 'komunitas robotika Aceh',
    'komunitas robot Banda Aceh', 'komunitas robotika Banda Aceh',
    // Expertise
    'robotika', 'robot', 'engineering', 'teknik elektro',
    'USK', 'Unsyiah', 'Universitas Syiah Kuala', 'komunitas',
    'IoT', 'Internet of Things', 'kompetisi robot', 'Kontes Robot Indonesia',
    'KRI', 'KRSBI', 'KRPAI', 'KRAI', 'KRTI', 'mahasiswa', 'Aceh', 'Banda Aceh',
    'embedded systems', 'Arduino', 'ESP32', '3D printing', 'otomasi industri',
    // Web freelance
    'jasa pembuatan website Aceh', 'jasa web developer Aceh',
    'jasa pembuatan website Banda Aceh', 'web developer Aceh',
    'freelance web developer Aceh', 'jasa coding Aceh',
  ],
  socials: {
    instagram: 'https://www.instagram.com/kroengusk/',
    linkedin: 'https://www.linkedin.com/company/komunitas-robotik-electrical-engineering-usk/',
    github: 'https://github.com/kroeng-usk',
  },
  address: {
    street: 'Jln. Tgk. Syech Abdurrauf No.7',
    area: 'Kopelma Darussalam, Kecamatan Syiah Kuala',
    city: 'Banda Aceh',
    region: 'Aceh',
    postalCode: '23111',
    country: 'ID',
  },
};

// ─── Metadata (Next.js 13 compatible) ────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullName,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'KROENG Team', url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  // fix: viewport & themeColor di sini, bukan export viewport (Next.js 13)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1628' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/web-app-manifest-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/web-app-manifest-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.fullName,
    description: siteConfig.description,
    images: [{
      url: siteConfig.ogImage,
      width: 1200,
      height: 630,
      alt: siteConfig.fullName,
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.fullName,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@kroeng_usk',
    site: '@kroeng_usk',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  // Uncomment setelah verifikasi Search Console:
  // verification: { google: 'your-google-verification-code' },
};

// ─── JSON-LD: Organization ────────────────────────────────────────────────────

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.fullName,
  alternateName: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: {
    '@type': 'ImageObject',
    url: `${siteConfig.url}/icons/web-app-manifest-512x512.png`,
    width: 512,
    height: 512,
  },
  image: `${siteConfig.url}${siteConfig.ogImage}`,
  foundingDate: siteConfig.foundingYear,
  email: siteConfig.email,
  sameAs: [
    siteConfig.socials.instagram,
    siteConfig.socials.linkedin,
    siteConfig.socials.github,
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: siteConfig.email,
    contactType: 'customer service',
    availableLanguage: ['Indonesian', 'English'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${siteConfig.address.street}, ${siteConfig.address.area}`,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  knowsAbout: [
    'Robotics', 'Internet of Things', 'Embedded Systems', 'Arduino', 'ESP32',
    'Kontes Robot Indonesia', 'KRI', 'KRSBI', 'KRPAI', 'KRAI', 'ABU Robocon',
    '3D Printing', 'Industrial Automation', 'PLC', 'SCADA',
    'Web Development', 'Web Application', 'Freelance Web Developer',
  ],
};

// ─── JSON-LD: WebSite ─────────────────────────────────────────────────────────

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteConfig.url}/#website`,
  name: siteConfig.fullName,
  alternateName: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: 'id-ID',
  publisher: { '@id': `${siteConfig.url}/#organization` },
  // Uncomment jika ada fitur search:
  // potentialAction: {
  //   '@type': 'SearchAction',
  //   target: `${siteConfig.url}/search?q={search_term_string}`,
  //   'query-input': 'required name=search_term_string',
  // },
};

// ─── JSON-LD: EducationalOrganization ────────────────────────────────────────

const educationalOrgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${siteConfig.url}/#educational-organization`,
  name: siteConfig.fullName,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icons/web-app-manifest-512x512.png`,
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'Universitas Syiah Kuala',
    alternateName: 'USK',
    url: 'https://usk.ac.id',
  },
  department: {
    '@type': 'Organization',
    name: 'Jurusan Teknik Elektro',
    url: 'https://pste.usk.ac.id/',
  },
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${montserrat.variable} ${orbitron.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* fix: hapus preconnect Google Fonts — next/font sudah handle otomatis */}

        {/* DNS Prefetch untuk third-party */}
        {process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN && (
          <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        )}

        {/* Apple PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />

        {/* SEO tambahan */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="ID-AC" />
        <meta name="geo.placename" content={siteConfig.address.city} />

        {/* JSON-LD — sanitize to prevent XSS via </script> in string values */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c') }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgJsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <Navbar />
          {/* fix: tambah id untuk aksesibilitas (skip to content) */}
          <main id="main-content" className="flex-1 pt-20">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>

        {/* Cloudflare Web Analytics — hanya load jika token ada */}
        {process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN && (<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "344d60d8b9f243719f0d1ff06da4d1f5"}'></script>
        )}
      </body>
    </html>
  );
}