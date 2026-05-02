'use client';

import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Member, Division } from '@/lib/supabase';

type OrgMember = Member & {
  profile?: { full_name: string | null; avatar_url: string | null; nim: string | null } | null;
};

// ─── Vertical spine connector ───────────────────────────────────────────────
function VLine() {
  return <div className="w-0.5 h-10 bg-gray-200 flex-shrink-0" />;
}

// ─── Horizontal tree row with connecting lines ────────────────────────────────
// Each child gets a top-border slice (horizontal) + a vertical drop.
// The slice rules create the classic org-chart branching pattern:
//   first child  → horizontal bar from center-of-self to the right
//   last child   → horizontal bar from the left to center-of-self
//   middle child → horizontal bar spanning full width
// Combined they form one continuous horizontal bar across all children.
function TreeRow({ items }: { items: React.ReactNode[] }) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div
        className={cn(
          'flex flex-col items-center pt-10 relative',
          "after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-0.5 after:h-10 after:bg-gray-200",
        )}
      >
        {items[0]}
      </div>
    );
  }

  return (
    <div className="flex">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-col items-center px-6 pt-10 relative',
            // horizontal bar segment
            "before:content-[''] before:absolute before:top-0 before:h-0.5 before:bg-gray-200",
            i === 0
              ? 'before:left-1/2 before:right-0'
              : i === items.length - 1
              ? 'before:left-0 before:right-1/2'
              : 'before:inset-x-0',
            // vertical drop from bar to card
            "after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-0.5 after:h-10 after:bg-gray-200",
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function OrgAvatar({ src, name, size }: { src?: string | null; name: string; size: 'lg' | 'md' | 'sm' }) {
  const dim = { lg: 'w-20 h-20', md: 'w-14 h-14', sm: 'w-10 h-10' }[size];
  const icon = { lg: 'w-10 h-10', md: 'w-7 h-7', sm: 'w-5 h-5' }[size];
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-electric-50 flex-shrink-0 mx-auto`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <User className={`${icon} text-electric-300`} />
        </div>
      )}
    </div>
  );
}

// ─── Person card (Ketua, Wakil Ketua, Sekretaris, Bendahara) ─────────────────
function PersonCard({
  member,
  role,
  size = 'md',
}: {
  member?: OrgMember;
  role: string;
  size?: 'lg' | 'md';
}) {
  const isLg = size === 'lg';
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center bg-white rounded-2xl shadow-md border border-gray-100 text-center',
        isLg ? 'p-5 w-52' : 'p-3.5 w-40',
      )}
    >
      <span className={cn('font-bold uppercase tracking-wider text-electric-600 mb-2', isLg ? 'text-xs' : 'text-[10px]')}>
        {role}
      </span>
      <OrgAvatar
        src={member?.image_url || member?.profile?.avatar_url}
        name={member?.name || role}
        size={isLg ? 'lg' : 'md'}
      />
      <p className={cn('font-semibold text-navy-900 mt-2 leading-tight', isLg ? 'text-base' : 'text-sm')}>
        {member?.name ?? <span className="text-gray-300 italic font-normal text-xs">Belum diisi</span>}
      </p>
      {member?.profile?.nim && (
        <p className="text-[10px] text-gray-400 mt-0.5">{member.profile.nim}</p>
      )}
    </div>
  );
}

// ─── Division card (Ketua Divisi + Wakil Divisi inside) ──────────────────────
function DivisionCard({
  division,
  ketuaDiv,
  wakilDiv,
}: {
  division: Division;
  ketuaDiv?: OrgMember;
  wakilDiv?: OrgMember;
}) {
  return (
    <div className="inline-flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-44 text-left">
      <div
        className="px-3 py-2.5 text-white text-center text-sm font-bold"
        style={{ backgroundColor: division.color ?? '#6366f1' }}
      >
        {division.name}
      </div>
      <div className="p-3 space-y-2.5">
        {[
          { label: 'Ketua Divisi', member: ketuaDiv },
          { label: 'Wakil Divisi', member: wakilDiv },
        ].map(({ label, member }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <OrgAvatar src={member?.image_url || member?.profile?.avatar_url} name={member?.name ?? '-'} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">
                  {member?.name ?? <span className="text-gray-300 italic text-xs">-</span>}
                </p>
                {member?.profile?.nim && <p className="text-[10px] text-gray-400">{member.profile.nim}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main OrgChart ────────────────────────────────────────────────────────────
//
// Visual layout (4 rows):
//
//  Row 1 │              [Ketua]
//        │                  │
//  Row 2 │           [Wakil Ketua]
//        │           /           \
//  Row 3 │   [Sekretaris]   [Bendahara]
//        │                  │  (spine continues from center)
//  Row 4 │   [Div1] [Div2] [Div3] ...
//
// The TreeRow component renders the horizontal branch bar + vertical drops.
// VLine renders the spine segment between rows.
// Because the outer container is `flex-col items-center`, all VLines and
// TreeRows align on the same center axis → the spine runs continuously.

export function OrgChart({
  members,
  divisions,
}: {
  members: OrgMember[];
  divisions: Division[];
}) {
  const find = (pos: string, divId?: string) =>
    members.find((m) => m.position === pos && (!divId || m.division_id === divId));

  const ketua      = find('Ketua');
  const wakilKetua = find('Wakil Ketua');
  const sekretaris = find('Sekretaris');
  const bendahara  = find('Bendahara');

  const staffNodes = (
    [
      sekretaris && <PersonCard member={sekretaris} role="Sekretaris" />,
      bendahara  && <PersonCard member={bendahara}  role="Bendahara"  />,
    ] as React.ReactNode[]
  ).filter(Boolean);

  const divisionNodes = divisions.map((div) => (
    <DivisionCard
      key={div.id}
      division={div}
      ketuaDiv={find('Ketua Divisi', div.id)}
      wakilDiv={find('Wakil Ketua Divisi', div.id)}
    />
  ));

  return (
    <div className="overflow-x-auto pb-8">
      <div className="min-w-max mx-auto flex flex-col items-center px-8 py-4">

        {/* ── Row 1: Ketua ── */}
        <PersonCard member={ketua} role="Ketua" size="lg" />

        {/* spine: Row 1 → Row 2 */}
        <VLine />

        {/* ── Row 2: Wakil Ketua ── */}
        <PersonCard member={wakilKetua} role="Wakil Ketua" />

        {/* spine: Row 2 → Row 3 */}
        <VLine />

        {/* ── Row 3: Sekretaris + Bendahara ── */}
        <TreeRow items={staffNodes} />

        {/* spine: Row 3 → Row 4  (the same center axis continues) */}
        <VLine />

        {/* ── Row 4: Divisi-divisi ── */}
        <TreeRow items={divisionNodes} />

      </div>
    </div>
  );
}
