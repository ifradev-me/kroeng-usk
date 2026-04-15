'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Trophy,
  Users,
  Image,
  BookOpen,
  Mail,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

type Stats = {
  news: number;
  achievements: number;
  members: number;
  gallery: number;
  knowledge: number;
  contacts: number;
  newContacts: number;
};

type RecentNews = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
};

type RecentContact = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: string;
  created_at: string;
};

type RecentAchievement = {
  id: string;
  title: string;
  competition_name: string;
  achievement_level: string;
  date: string | null;
};

const statCards = [
  {
    key: 'news',
    label: 'News Articles',
    icon: Newspaper,
    href: '/admin/news',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
  },
  {
    key: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    href: '/admin/achievements',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
  },
  {
    key: 'members',
    label: 'Members',
    icon: Users,
    href: '/admin/members',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
  },
  {
    key: 'gallery',
    label: 'Gallery Items',
    icon: Image,
    href: '/admin/gallery',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    iconBg: 'bg-pink-100',
  },
  {
    key: 'knowledge',
    label: 'Knowledge Base',
    icon: BookOpen,
    href: '/admin/knowledge',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
  },
  {
    key: 'contacts',
    label: 'Messages',
    icon: Mail,
    href: '/admin/contacts',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    showBadge: true,
  },
];

const quickActions = [
  { label: 'Add News', href: '/admin/news', icon: Newspaper },
  { label: 'Add Achievement', href: '/admin/achievements', icon: Trophy },
  { label: 'Add Member', href: '/admin/members', icon: Users },
  { label: 'Add to Gallery', href: '/admin/gallery', icon: Image },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    news: 0,
    achievements: 0,
    members: 0,
    gallery: 0,
    knowledge: 0,
    contacts: 0,
    newContacts: 0,
  });
  const [recentNews, setRecentNews] = useState<RecentNews[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/profile?redirect=/admin';
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (!profile || profile.role !== 'admin') {
        window.location.href = '/profile';
        return;
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    async function fetchDashboardData() {
      try {
        // Fetch all stats in parallel
        const [
          newsRes,
          achievementsRes,
          membersRes,
          galleryRes,
          knowledgeRes,
          contactsRes,
          newContactsRes,
          recentNewsRes,
          recentContactsRes,
          recentAchievementsRes,
        ] = await Promise.all([
          supabase.from('news').select('id', { count: 'exact', head: true }),
          supabase.from('achievements').select('id', { count: 'exact', head: true }),
          supabase.from('members').select('id', { count: 'exact', head: true }),
          supabase.from('gallery').select('id', { count: 'exact', head: true }),
          supabase.from('knowledge').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase
            .from('news')
            .select('id, title, slug, published, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('contacts')
            .select('id, name, email, subject, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('achievements')
            .select('id, title, competition_name, achievement_level, date')
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        setStats({
          news: newsRes.count || 0,
          achievements: achievementsRes.count || 0,
          members: membersRes.count || 0,
          gallery: galleryRes.count || 0,
          knowledge: knowledgeRes.count || 0,
          contacts: contactsRes.count || 0,
          newContacts: newContactsRes.count || 0,
        });

        if (recentNewsRes.data) setRecentNews(recentNewsRes.data);
        if (recentContactsRes.data) setRecentContacts(recentContactsRes.data);
        if (recentAchievementsRes.data) setRecentAchievements(recentAchievementsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [authChecked]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;
      
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'read':
        return 'bg-gray-100 text-gray-700';
      case 'replied':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your KROENG website today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/news">
            <Button className="bg-electric-500 hover:bg-electric-600 gap-2">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="hover:shadow-md transition-all hover:border-electric-200 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-lg ${card.iconBg} ${card.color} flex items-center justify-center`}
                  >
                    <card.icon className="w-5 h-5" />
                  </div>
                  {card.showBadge && stats.newContacts > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.newContacts} new
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      stats[card.key as keyof Stats]
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent News */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent News</CardTitle>
              <CardDescription>Latest articles and updates</CardDescription>
            </div>
            <Link href="/admin/news">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentNews.length > 0 ? (
              <div className="space-y-4">
                {recentNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/admin/news/${news.id}`}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-electric-600 transition-colors">
                          {news.title}
                        </h4>
                        {!news.published && (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(news.created_at)}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Newspaper className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No news articles yet</p>
                <Link href="/admin/news">
                  <Button variant="link" className="mt-2">
                    Create your first article
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full justify-between group">
                    <div className="flex items-center gap-2">
                      <action.icon className="w-4 h-4 text-gray-500" />
                      {action.label}
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-electric-500 transition-colors" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
                    >
                      <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {achievement.achievement_level} • {achievement.competition_name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No achievements yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Recent Messages
            </CardTitle>
            <CardDescription>Contact form submissions</CardDescription>
          </div>
          <Link href="/admin/contacts">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">From</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Subject</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentContacts.map((contact) => (
                    <tr key={contact.id} className="group">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <p className="text-gray-600 truncate max-w-[200px]">
                          {contact.subject || 'No subject'}
                        </p>
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-500 hidden sm:table-cell">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="py-3">
                        <Link href={`/admin/contacts/${contact.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No messages yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics CTA */}
      <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-electric-400" />
                Website Analytics
              </h3>
              <p className="text-gray-300 mt-1">
                Track visitor insights, page views, and performance metrics with Cloudflare
                Analytics.
              </p>
            </div>
            <Link href="/admin/analytics">
              <Button className="bg-white text-navy-900 hover:bg-gray-100 gap-2">
                View Analytics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}