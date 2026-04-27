'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Github } from 'lucide-react';

const footerLinks = {
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/news' },
    { name: 'Achievements', href: '/achievements' },
    { name: 'Structure', href: '/structure' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Knowledge', href: '/knowledge' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'About Us', href: '/#about' },
    { name: 'Our Divisions', href: '/structure/divisions' },
    { name: 'Projects', href: '/gallery' },
    { name: 'Competitions', href: '/#competitions' },
  ],
  social: [
    { name: 'Instagram', href: 'https://instagram.com/kroengusk', icon: Instagram },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/komunitas-robotik-electrical-engineering-usk/', icon: Linkedin },
    { name: 'GitHub', href: 'https://github.com/kroeng-usk', icon: Github },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-electric-500 to-electric-600 flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">K</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">KROENG</h3>
                <p className="text-sm text-gray-400">Komunitas Robotic Electrical Engineering</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Forge Engineers. Win Competitions. Komunitas robotika kompetitif mahasiswa Teknik Elektro USK
              yang mencetak engineer berprestasi lewat KRI, KRTI, dan kompetisi robotika nasional.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-electric-500 flex items-center justify-center transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Navigation</h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-electric-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-electric-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} KROENG. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Built with passion by KROENG Team
          </p>
        </div>
      </div>
    </footer>
  );
}
