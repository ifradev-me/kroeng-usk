'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrench, FolderKanban, Trophy, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const reasons = [
  {
    icon: Wrench,
    title: 'Build Real Skills',
    description:
      'Belajar robotika, IoT, dan teknologi elektro bukan dari textbook — tapi dari praktik langsung dan proyek nyata.',
  },
  {
    icon: FolderKanban,
    title: 'Portfolio Development',
    description:
      'Setiap proyek dan kompetisi yang kamu ikuti jadi portfolio. CV-mu akan berbicara lebih keras dari nilai IPK.',
  },
  {
    icon: Trophy,
    title: 'Competition Experience',
    description:
      'Kesempatan bertanding di kompetisi teknologi tingkat nasional dan internasional. Pengalaman yang tidak bisa dibeli.',
  },
  {
    icon: Heart,
    title: 'Supportive Community',
    description:
      'Lingkungan belajar yang kekeluargaan. Di KROENG, kita saling bantu — bukan saling saingan. Budaya berbagi ilmu adalah fondasi kami.',
  },
];

export function WhyJoinSection() {
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
    <section
      aria-labelledby="why-join-heading"
      className="section-padding bg-gray-50"
      ref={ref}
    >
      <div className="container-custom">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Kenapa KROENG?
          </span>
          <h2
            id="why-join-heading"
            className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2"
          >
            Why Join KROENG
          </h2>
        </header>

        {/* Reasons Grid */}
        <ul
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 list-none"
          role="list"
          aria-label="Alasan bergabung dengan KROENG"
        >
          {reasons.map((reason, index) => (
            <li key={reason.title}>
              <Card
                className={`group h-full bg-white border-0 shadow-md hover:shadow-xl transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-electric-100 text-electric-600 mb-4 group-hover:bg-electric-500 group-hover:text-white transition-colors"
                    aria-hidden="true"
                  >
                    <reason.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-navy-900 mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}