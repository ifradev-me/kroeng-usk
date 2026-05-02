'use client';

import { Instagram, Linkedin, Github, Mail, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/lib/supabase';

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  email: Mail,
};

export function MembersGrid({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">No Members Yet</h3>
        <p className="text-gray-500">Members will be displayed here soon!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {members.map((member) => (
        <Card
          key={member.id}
          className="group bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-electric-500 to-navy-600">
            {(member.image_url || member.profile?.avatar_url) ? (
              <img
                src={member.image_url || member.profile?.avatar_url!}
                alt={member.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-white/50 font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <CardContent className="p-4 text-center">
            <h3 className="font-heading font-semibold text-navy-900 text-lg">{member.name}</h3>
            <p className="text-electric-600 text-sm font-medium">{member.position}</p>
            {member.profile?.nim && (
              <p className="text-gray-500 text-xs mt-1">NIM: {member.profile.nim}</p>
            )}
            {member.skills && member.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {member.skills.slice(0, 3).map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-electric-50 text-electric-700 border-0"
                  >
                    {skill}
                  </Badge>
                ))}
                {member.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 border-0">
                    +{member.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {member.social_links && Object.keys(member.social_links).length > 0 && (
              <div className="flex justify-center gap-2 mt-3">
                {Object.entries(member.social_links).map(([platform, url]) => {
                  const Icon = socialIcons[platform.toLowerCase()];
                  if (!Icon || !url) return null;
                  return (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-electric-100 flex items-center justify-center text-gray-600 hover:text-electric-600 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
