'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, Code, Palette, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Division, Member } from '@/lib/supabase';
import { MembersGrid } from '../members-grid';

const divisionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  electrical: Zap,
  programmer: Code,
  designer: Palette,
  'non-technical': Users,
};

export function DivisionsView({
  divisions,
  members,
}: {
  divisions: Division[];
  members: Member[];
}) {
  const searchParams = useSearchParams();
  const defaultDivision = searchParams.get('division') || divisions[0]?.slug || '';
  const [activeTab, setActiveTab] = useState(defaultDivision);

  useEffect(() => {
    const division = searchParams.get('division');
    if (division && divisions.find((d) => d.slug === division)) {
      setActiveTab(division);
    }
  }, [searchParams, divisions]);

  const getMembers = (divisionId: string) => {
    return members.filter((m) => m.division_id === divisionId);
  };

  if (divisions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">No Divisions Yet</h3>
        <p className="text-gray-500">Divisions will be displayed here soon!</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8">
        {divisions.map((division) => {
          const Icon = divisionIcons[division.slug] || Users;
          return (
            <TabsTrigger
              key={division.slug}
              value={division.slug}
              className="data-[state=active]:bg-electric-500 data-[state=active]:text-white px-6 py-3 rounded-lg border border-gray-200 data-[state=active]:border-electric-500 flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {division.name}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {divisions.map((division) => {
        const Icon = divisionIcons[division.slug] || Users;
        const divisionMembers = getMembers(division.id);

        return (
          <TabsContent key={division.slug} value={division.slug}>
            <Card className="mb-8 bg-gradient-to-br from-navy-900 to-navy-800 border-0">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-electric-400" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-heading font-bold">{division.name}</h2>
                  <p className="text-gray-300 mt-1">{division.description}</p>
                  <p className="text-electric-400 text-sm mt-2">
                    {divisionMembers.length} member{divisionMembers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>

            <MembersGrid members={divisionMembers} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
