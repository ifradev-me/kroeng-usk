'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Trophy,
  Users,
  BookOpen,
  Mail,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Bell,
  LogOut,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'News', href: '/admin/news', icon: Newspaper },
  { name: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Knowledge', href: '/admin/knowledge', icon: BookOpen },
  { name: 'Contacts', href: '/admin/contacts', icon: Mail, badge: true },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadContacts, setUnreadContacts] = useState(0);

  // Fetch unread contacts count
  useEffect(() => {
    async function fetchUnreadContacts() {
      if (!isAdmin) return;
      
      const { count } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');
      
      setUnreadContacts(count || 0);
    }

    fetchUnreadContacts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        () => fetchUnreadContacts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/profile');
    }
  }, [user, isAdmin, loading, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-electric-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-navy-600 flex items-center justify-center">
               <Image src="/images/kroengusk-icon.png" alt="KROENG USK" width={40} height={40} />
            </div>
            <span className="font-heading font-bold text-navy-900">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to website */}
        <div className="p-4 border-b border-gray-100">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600">
              <ChevronLeft className="w-4 h-4" />
              Back to Website
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;
            const showBadge = item.badge && unreadContacts > 0;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-electric-50 text-electric-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </div>
                {showBadge && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
                    {unreadContacts > 99 ? '99+' : unreadContacts}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-electric-100 text-electric-700 text-sm">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title - hidden on mobile */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {adminNavigation.find((item) => item.href === pathname)?.name || 'Admin'}
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link href="/admin/contacts">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadContacts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadContacts > 9 ? '9+' : unreadContacts}
                  </span>
                )}
              </Button>
            </Link>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-electric-100 text-electric-700 text-sm">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">
                    {profile?.full_name?.split(' ')[0] || 'Admin'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{profile?.full_name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 font-normal">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}