'use client';

import { Trophy, Calendar, Users, Award, Medal, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/lib/supabase';
import { format } from 'date-fns';

function getAchievementIcon(level: string) {
  const lower = level.toLowerCase();
  if (lower.includes('winner') || lower.includes('juara 1') || lower.includes('gold')) {
    return { icon: Trophy, color: 'bg-gold-500 text-white' };
  }
  if (lower.includes('runner') || lower.includes('juara 2') || lower.includes('silver')) {
    return { icon: Medal, color: 'bg-gray-400 text-white' };
  }
  if (lower.includes('third') || lower.includes('juara 3') || lower.includes('bronze')) {
    return { icon: Award, color: 'bg-amber-600 text-white' };
  }
  return { icon: Star, color: 'bg-electric-500 text-white' };
}

export function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">
          Belum ada isi nih, Tungguin ya!
        </h3>
        <p className="text-gray-500">Belum ada pencapaian yang ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((achievement) => {
        const { icon: Icon, color } = getAchievementIcon(achievement.achievement_level);
        return (
          <Card
            key={achievement.id}
            className="group bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative">
              {achievement.image_url ? (
                <div className="aspect-video">
                  <img
                    src={achievement.image_url}
                    alt={achievement.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-navy-800 to-electric-900 flex items-center justify-center">
                  <Icon className="w-16 h-16 text-white/30" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <Badge variant="secondary" className="mb-3 bg-electric-100 text-electric-700">
                {achievement.achievement_level}
              </Badge>
              <h3 className="text-lg font-heading font-semibold text-navy-900 mb-2 line-clamp-2">
                {achievement.title}
              </h3>
              <p className="text-electric-600 font-medium text-sm mb-3">
                {achievement.competition_name}
              </p>
              {achievement.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{achievement.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {achievement.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(achievement.date), 'MMM yyyy')}
                  </span>
                )}
                {achievement.team_members && achievement.team_members.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {achievement.team_members.length} members
                  </span>
                )}
              </div>
              {achievement.team_members && achievement.team_members.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Team Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {achievement.team_members.slice(0, 3).map((member, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                      >
                        {member}
                      </span>
                    ))}
                    {achievement.team_members.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        +{achievement.team_members.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
