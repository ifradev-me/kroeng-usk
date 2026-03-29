'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Building2, Award, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const collaborationTypes = [
  {
    icon: GraduationCap,
    title: 'Institusi Pendidikan',
    description: 'Program bersama, workshop, atau kompetisi internal',
  },
  {
    icon: Building2,
    title: 'Perusahaan Teknologi',
    description: 'Partnership proyek atau talent pipeline',
  },
  {
    icon: Award,
    title: 'Sponsor Kompetisi',
    description: 'Support untuk tim kompetisi kami',
  },
  {
    icon: Briefcase,
    title: 'Klien Proyek',
    description: 'Pengembangan sistem IoT, robotika, atau solusi teknologi lainnya',
  },
];

export function CollaborationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-gray-50" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              Partnership
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2 mb-6">
              Let&apos;s Build Together
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              KROENG terbuka untuk kolaborasi dengan berbagai pihak. Punya ide kolaborasi? Kami siap
              diskusi.
            </p>

            <Link href="/contact">
              <Button className="bg-electric-500 hover:bg-electric-600 text-white gap-2">
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {collaborationTypes.map((type, index) => (
              <div
                key={type.title}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-electric-100 flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-electric-600" />
                </div>
                <h3 className="font-heading font-semibold text-navy-900 mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
