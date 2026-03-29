import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kroeng.com';
const siteName = 'KROENG';
const defaultImage = '/images/og-img.png';

// ================================
// PAGE METADATA
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
// ARTICLE METADATA (untuk news & knowledge)
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

export function generateImageGalleryJsonLd({
  name,
  description,
  images,
}: {
  name: string;
  description: string;
  images: { url: string; caption?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    description,
    image: images.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
      caption: img.caption,
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