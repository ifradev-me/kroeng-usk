import Image from 'next/image';
import { CircuitBoard, Lightbulb, Users, Rocket } from 'lucide-react';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

const values = [
  { icon: Lightbulb, label: 'Innovation', color: 'text-gold-500' },
  { icon: Users, label: 'Collaboration', color: 'text-electric-500' },
  { icon: CircuitBoard, label: 'Family', color: 'text-green-500' },
  { icon: Rocket, label: 'Competitiveness', color: 'text-navy-500' },
];

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <AnimateOnScroll animation="fade-left">
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              About KROENG
            </span>
            <h2
              id="about-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2 mb-4 sm:mb-6"
            >
              A Place for Future Engineers
            </h2>

            <div className="space-y-3 sm:space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
              <p>
                KROENG (Komunitas Robotic Electrical Engineering) adalah rumah bagi mahasiswa yang
                ingin serius mengembangkan kemampuan robotika, IoT, dan teknologi elektro.
              </p>
              <p>
                Sejak 2017, kami menjadi wadah untuk belajar bersama, bereksperimen dengan
                teknologi, dan bertanding di berbagai kompetisi nasional maupun internasional.
              </p>
              <p>
                Di sini, kamu tidak hanya belajar teori — kamu membangun proyek nyata, mengikuti
                kompetisi, dan mengembangkan portfolio yang siap dibawa ke dunia industri.
              </p>
            </div>

            {/* Values */}
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8" aria-label="Nilai-nilai KROENG">
              {values.map((value) => (
                <li
                  key={value.label}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <value.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${value.color} flex-shrink-0`} aria-hidden="true" />
                  <span className="font-medium text-navy-900 text-sm sm:text-base">{value.label}</span>
                </li>
              ))}
            </ul>
          </AnimateOnScroll>

          {/* Image */}
          <AnimateOnScroll animation="fade-right" delay={200}>
            <figure className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
              <Image
                src="/images/about-team.jpg"
                alt="Tim KROENG sedang bekerja sama membangun robot di workshop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent"
                aria-hidden="true"
              />
              <figcaption className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                <p className="text-white font-heading font-semibold text-base sm:text-lg">
                  Building the Future Together
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">Since 2017</p>
              </figcaption>
            </figure>

            {/* Decorative - hidden on mobile for performance */}
            <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-electric-500/20 rounded-2xl -z-10" aria-hidden="true" />
            <div className="hidden sm:block absolute -top-6 -left-6 w-24 h-24 bg-gold-500/20 rounded-2xl -z-10" aria-hidden="true" />
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}