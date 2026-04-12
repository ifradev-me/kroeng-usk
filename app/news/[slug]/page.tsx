import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { supabase, News } from '@/lib/supabase';
import { format } from 'date-fns';
import {
  generateArticleMetadata,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  JsonLd,
} from '@/lib/seo';

interface PageProps {
  params: { slug: string };
}

async function getNews(slug: string): Promise<News | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching news:', error);
    return null;
  }

  return data;
}

// ✅ Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const news = await getNews(params.slug);

  if (!news) {
    return { title: 'Berita Tidak Ditemukan' };
  }

  const authorName = (news.author as any)?.full_name || 'KROENG Team';

  return generateArticleMetadata({
    title: news.title,
    description: news.excerpt || news.content?.substring(0, 155) || '',
    path: `/news/${news.slug}`,
    image: news.cover_image || '/images/og-img.png',
    publishedTime: news.published_at || news.created_at,
    authors: [authorName],
  });
}

// ✅ Generate static params untuk build time
export async function generateStaticParams() {
  const { data } = await supabase
    .from('news')
    .select('slug')
    .eq('published', true);

  return (data || []).map((item) => ({ slug: item.slug }));
}

export const revalidate = 60;

export default async function NewsDetailPage({ params }: PageProps) {
  const news = await getNews(params.slug);

  if (!news) {
    notFound();
  }

  const authorName = (news.author as any)?.full_name || 'KROENG Team';

  // JSON-LD
  const articleJsonLd = generateArticleJsonLd({
    title: news.title,
    description: news.excerpt || '',
    image: news.cover_image || '/images/og-img.png',
    path: `/news/${news.slug}`,
    publishedTime: news.published_at || news.created_at,
    authors: [authorName],
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Beranda', path: '/' },
    { name: 'Berita', path: '/news' },
    { name: news.title, path: `/news/${news.slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="section-padding">
        <div className="container-custom max-w-4xl">
          <Link href="/news">
            <Button variant="ghost" className="mb-8 gap-2 text-gray-600 hover:text-electric-600 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke daftar
            </Button>
          </Link>

          <article>
            {news.cover_image && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                <img
                  src={news.cover_image}
                  alt={`Ilustrasi artikel: ${news.title}`}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <time
                dateTime={news.published_at || news.created_at}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {news.published_at
                  ? format(new Date(news.published_at), 'dd MMMM yyyy')
                  : format(new Date(news.created_at), 'dd MMMM yyyy')}
              </time>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {authorName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
              {news.title}
            </h1>

            {news.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{news.excerpt}</p>
            )}

            <MarkdownRenderer content={news.content || ''} />
          </article>
        </div>
      </div>
    </>
  );
}