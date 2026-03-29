import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kroeng.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ================================
  // HALAMAN STATIS
  // ================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/achievements`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/structure`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // ================================
  // HALAMAN DINAMIS - NEWS
  // ================================
  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: news } = await supabase
      .from('news')
      .select('slug, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    newsEntries = (news || []).map((item) => ({
      url: `${baseUrl}/news/${item.slug}`,
      lastModified: new Date(item.published_at || item.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching news:', error);
  }

  // ================================
  // HALAMAN DINAMIS - KNOWLEDGE
  // ================================
  let knowledgeEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: knowledge } = await supabase
      .from('knowledge')
      .select('slug, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    knowledgeEntries = (knowledge || []).map((item) => ({
      url: `${baseUrl}/knowledge/${item.slug}`,
      lastModified: new Date(item.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching knowledge:', error);
  }

  return [...staticPages, ...newsEntries, ...knowledgeEntries];
}