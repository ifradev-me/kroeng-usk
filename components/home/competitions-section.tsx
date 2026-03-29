import Link from 'next/link';
import { Trophy, Medal, Award, Star, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, Achievement } from '@/lib/supabase';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

// Default competitions
const defaultCompetitions = [
  'International IoT Olympiad',
  'Kontes Robot Indonesia',
  'Pekan Kreativitas Mahasiswa',
  'Innovillage',
  'PLN ICE',
  'MICE Robot Race',
  'Inovasi Drone Indonesia',
  'Kontes Kapal Indonesia',
];

// Icon mapping
function getAchievementIcon(level: string) {
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('winner') || lowerLevel.includes('juara 1') || lowerLevel.includes('gold')) {
    return { icon: Trophy, color: 'bg-gold-500' };
  }
  if (lowerLevel.includes('runner') || lowerLevel.includes('juara 2') || lowerLevel.includes('silver') || lowerLevel.includes('finalist')) {
    return { icon: Medal, color: 'bg-gray-400' };
  }
  if (lowerLevel.includes('juara 3') || lowerLevel.includes('bronze') || lowerLevel.includes('top')) {
    return { icon: Award, color: 'bg-amber-600' };
  }
  return { icon: Award, color: 'bg-electric-500' };
}

async function getAchievements() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('date', { ascending: false })
      .limit(3);

    if (error) return { achievements: [], competitions: defaultCompetitions };

    const achievements = data || [];
    const uniqueCompetitions = [...new Set(achievements.map((a) => a.competition_name))];
    const competitions = [...new Set([...uniqueCompetitions, ...defaultCompetitions])].slice(0, 10);

    return { achievements, competitions };
  } catch {
    return { achievements: [], competitions: defaultCompetitions };
  }
}

export async function CompetitionsSection() {
  const { achievements, competitions } = await getAchievements();

  return (
    <section id="competitions" aria-labelledby="competitions-heading" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column */}
          <AnimateOnScroll animation="fade-left">
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              Competition Arena
            </span>
            <h2
              id="competitions-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2 mb-4 sm:mb-6"
            >
              Competitions We Participate In
            </h2>

            {/* Competition badges */}
            <ul className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 list-none" role="list">
              {competitions.map((comp) => (
                <li key={comp}>
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-electric-100 hover:text-electric-700 transition-colors"
                  >
                    {comp}
                  </Badge>
                </li>
              ))}
            </ul>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Kompetisi adalah arena untuk mengasah kemampuan engineering, teamwork, dan problem
              solving. Di sinilah teori bertemu kenyataan — dan engineer sejati dibentuk.
            </p>

            <Link href="/achievements" className="inline-block mt-4 sm:mt-6" prefetch={false}>
              <Button variant="outline" className="gap-2 text-sm sm:text-base h-10 sm:h-11">
                View All Achievements
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </AnimateOnScroll>

          {/* Right Column */}
          <AnimateOnScroll animation="fade-right" delay={200}>
            <aside aria-labelledby="highlights-heading">
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white">
                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400 flex-shrink-0" aria-hidden="true" />
                  <h3 id="highlights-heading" className="text-base sm:text-lg md:text-xl font-heading font-semibold">
                    Achievement Highlights
                  </h3>
                </div>

                {achievements.length > 0 ? (
                  <ul className="space-y-3 list-none" role="list">
                    {achievements.map((achievement) => {
                      const { icon: Icon, color } = getAchievementIcon(achievement.achievement_level);

                      return (
                        <li
                          key={achievement.id}
                          className="flex items-start gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${color} flex items-center justify-center`}
                            aria-hidden="true"
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 py-0.5">
                            <p className="font-semibold text-sm sm:text-base leading-snug break-words">
                              {achievement.achievement_level}
                            </p>
                            <p className="text-gray-300 text-xs sm:text-sm mt-1 break-words">
                              {achievement.competition_name}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-2 sm:mb-3" aria-hidden="true" />
                    <p className="text-gray-400 text-sm sm:text-base">No achievements yet</p>
                  </div>
                )}

                <p className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20 text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {achievements.length > 0
                    ? 'Dan masih banyak lagi prestasi yang diraih oleh anggota KROENG.'
                    : 'Prestasi akan ditampilkan di sini setelah ditambahkan.'}
                </p>
              </div>
            </aside>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}