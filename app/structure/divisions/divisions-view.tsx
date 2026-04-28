'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, Code, Palette, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Division, Member } from '@/lib/supabase';
import { getDivisionColorTheme } from '@/lib/constants';
import { MembersGrid } from '../members-grid';

const divisionIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
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
          const isActive = activeTab === division.slug;
          const theme = getDivisionColorTheme(division.color);
          return (
            <TabsTrigger
              key={division.slug}
              value={division.slug}
              className="px-6 py-3 rounded-lg border flex items-center gap-2 transition-all duration-200"
              style={
                isActive
                  ? { backgroundColor: theme.hex, color: theme.text.title, borderColor: theme.hex }
                  : { borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'transparent' }
              }
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
        const theme = getDivisionColorTheme(division.color);

        return (
          <TabsContent key={division.slug} value={division.slug}>
            <Card
              className="mb-8 border-0 overflow-hidden"
              style={{ background: theme.gradient }}
            >
              <CardContent className="p-8 flex items-center gap-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: theme.text.iconBg }}
                >
                  <Icon className="w-8 h-8" style={{ color: theme.text.accent }} />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold" style={{ color: theme.text.title }}>
                    {division.name}
                  </h2>
                  <p className="mt-1" style={{ color: theme.text.description }}>
                    {division.description}
                  </p>
                  <p className="text-sm mt-2 font-medium" style={{ color: theme.text.accent }}>
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
