import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { supabase, Knowledge } from '@/lib/supabase';
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

async function getKnowledge(slug: string): Promise<Knowledge | null> {
  const { data, error } = await supabase
    .from('knowledge')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching knowledge:', error);
    return null;
  }

  return data;
}

// ✅ Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const knowledge = await getKnowledge(params.slug);

  if (!knowledge) {
    return { title: 'Artikel Tidak Ditemukan' };
  }

  const authorName = (knowledge.author as any)?.full_name || 'KROENG Team';

  return generateArticleMetadata({
    title: knowledge.title,
    description: knowledge.excerpt || knowledge.content?.substring(0, 155) || '',
    path: `/knowledge/${knowledge.slug}`,
    image: knowledge.cover_image || '/images/og-img.png',
    publishedTime: knowledge.created_at,
    authors: [authorName],
    tags: knowledge.tags || [],
    keywords: [knowledge.category, ...(knowledge.tags || [])],
  });
}

// ✅ Generate static params
export async function generateStaticParams() {
  const { data } = await supabase
    .from('knowledge')
    .select('slug')
    .eq('published', true);

  return (data || []).map((item) => ({ slug: item.slug }));
}

export const revalidate = 60;

export default async function KnowledgeDetailPage({ params }: PageProps) {
  const knowledge = await getKnowledge(params.slug);

  if (!knowledge) {
    notFound();
  }

  const authorName = (knowledge.author as any)?.full_name || 'KROENG Team';

  // JSON-LD
  const articleJsonLd = generateArticleJsonLd({
    title: knowledge.title,
    description: knowledge.excerpt || '',
    image: knowledge.cover_image || '/images/og-img.png',
    path: `/knowledge/${knowledge.slug}`,
    publishedTime: knowledge.created_at,
    authors: [authorName],
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Beranda', path: '/' },
    { name: 'Knowledge Base', path: '/knowledge' },
    { name: knowledge.title, path: `/knowledge/${knowledge.slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="section-padding">
        <div className="container-custom max-w-4xl">
          <Link href="/knowledge">
            <Button variant="ghost" className="mb-8 gap-2 text-gray-600 hover:text-electric-600 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke daftar
            </Button>
          </Link>

          <article>
            {knowledge.cover_image && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                <img
                  src={knowledge.cover_image}
                  alt={`Ilustrasi: ${knowledge.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-electric-100 text-electric-700 hover:bg-electric-100">
                {knowledge.category}
              </Badge>
              <time
                dateTime={knowledge.created_at}
                className="flex items-center gap-2 text-sm text-gray-500"
              >
                <Calendar className="w-4 h-4" />
                {format(new Date(knowledge.created_at), 'dd MMMM yyyy')}
              </time>
              <span className="flex items-center gap-2 text-sm text-gray-500">
                {(knowledge.author as any)?.avatar_url ? (
                  <img
                    src={(knowledge.author as any).avatar_url}
                    alt={authorName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-electric-100 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-electric-600" />
                  </span>
                )}
                {authorName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
              {knowledge.title}
            </h1>

            {knowledge.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{knowledge.excerpt}</p>
            )}

            {knowledge.tags && knowledge.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {knowledge.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <MarkdownRenderer content={knowledge.content || ''} />
          </article>
        </div>
      </div>
    </>
  );
}