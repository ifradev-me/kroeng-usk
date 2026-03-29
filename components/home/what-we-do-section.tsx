'use client';

import { useEffect, useRef, useState } from 'react';
import { Trophy, Wrench, GraduationCap, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const activities = [
  {
    icon: Trophy,
    title: 'Robotics Competition',
    description:
      'Kami aktif mengikuti berbagai kompetisi teknologi — dari robotika, IoT, drone, hingga inovasi mahasiswa. Kompetisi adalah cara terbaik untuk menguji skill dan membangun mental engineer.',
    color: 'from-gold-500 to-gold-600',
  },
  {
    icon: Wrench,
    title: 'Engineering Projects',
    description:
      'Anggota KROENG membangun berbagai proyek nyata: robot line follower, robot SAR, sistem IoT, drone, dan teknologi embedded. Learning by doing adalah DNA kami.',
    color: 'from-electric-500 to-electric-600',
  },
  {
    icon: GraduationCap,
    title: 'Technical Learning',
    description:
      'Workshop Proteus, Multisim, IoT development, robotics programming — semua dipelajari bersama melalui mentoring dan peer-learning. Di KROENG, yang tahu mengajar yang belum tahu.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Settings,
    title: 'Engineering Services',
    description:
      'Kami juga mengerjakan proyek teknologi untuk klien: sistem IoT, instalasi listrik, 3D printing, pembuatan robot, dan pengembangan website.',
    color: 'from-navy-500 to-navy-600',
  },
];

export function WhatWeDoSection() {
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
      aria-labelledby="activities-heading"
      className="section-padding bg-gray-50"
      ref={ref}
    >
      <div className="container-custom">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Our Activities
          </span>
          <h2
            id="activities-heading"
            className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2"
          >
            What We Do
          </h2>
        </header>

        {/* Activities Grid */}
        <ul className="grid md:grid-cols-2 gap-6 list-none" role="list">
          {activities.map((activity, index) => (
            <li key={activity.title}>
              <Card
                className={`group h-full card-hover bg-white border-0 shadow-md transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${activity.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                    aria-hidden="true"
                  >
                    <activity.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-navy-900 mb-3">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}