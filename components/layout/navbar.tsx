'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Image from "next/image";
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'News', href: '/news' },
  { name: 'Achievements', href: '/achievements' },
  {
    name: 'Structure',
    href: '/structure',
    children: [
      { name: 'Core Team', href: '/structure' },
      { name: 'Divisions', href: '/structure/divisions' },
    ],
  },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Knowledge', href: '/knowledge' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      )}
    >
      <nav className="container-custom flex items-center justify-between py-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-500 to-navy-600 flex items-center justify-center">
            <Image src="/images/kroengusk-icon.png" alt="KROENG USK" width={40} height={40} />
          </div>
          <span className={cn(
            'font-display font-bold text-xl transition-colors',
            scrolled ? 'text-navy-900' : 'text-navy-900'
          )}>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) =>
            item.children ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive(item.href)
                        ? 'text-electric-600 bg-electric-50'
                        : 'text-gray-700 hover:text-electric-600 hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.name} asChild>
                      <Link href={child.href} className="w-full">
                        {child.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive(item.href)
                    ? 'text-electric-600 bg-electric-50'
                    : 'text-gray-700 hover:text-electric-600 hover:bg-gray-50'
                )}
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {profile?.full_name || 'Profile'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/analytics" className="w-full flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/profile">
              <Button size="sm" className="bg-electric-500 hover:bg-electric-600 text-white">
                Open Profile
              </Button>
            </Link>
          )}
        </div>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container-custom py-4 px-4 space-y-2">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name} className="space-y-1">
                  <span className="block px-4 py-2 text-sm font-medium text-gray-500">
                    {item.name}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        'block px-6 py-2 text-sm rounded-lg transition-colors',
                        isActive(child.href)
                          ? 'text-electric-600 bg-electric-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'text-electric-600 bg-electric-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-electric-500 hover:bg-electric-600 text-white">
                    Open Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
