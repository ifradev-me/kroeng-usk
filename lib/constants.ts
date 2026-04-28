// ============================================================================
// DIVISION COLOR THEMES
// Setiap tema punya: hex, gradient custom, dan set teks (title, description, accent)
// ============================================================================

export type DivisionColorTheme = {
  label: string;
  hex: string;
  /** CSS gradient string untuk background card divisi */
  gradient: string;
  text: {
    /** Warna nama divisi */
    title: string;
    /** Warna deskripsi */
    description: string;
    /** Warna badge jumlah member & ikon */
    accent: string;
    /** Warna icon container (background transparan) */
    iconBg: string;
  };
};

export const DIVISION_COLOR_THEMES: DivisionColorTheme[] = [
  {
    label: 'Electric Blue',
    hex: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.78)',
      accent: '#bae6fd',
      iconBg: 'rgba(255,255,255,0.15)',
    },
  },
  {
    label: 'Deep Navy',
    hex: '#1e40af',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.75)',
      accent: '#93c5fd',
      iconBg: 'rgba(255,255,255,0.12)',
    },
  },
  {
    label: 'Cyan',
    hex: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #164e63 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.78)',
      accent: '#a5f3fc',
      iconBg: 'rgba(255,255,255,0.15)',
    },
  },
  {
    label: 'Indigo',
    hex: '#4338ca',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.76)',
      accent: '#c7d2fe',
      iconBg: 'rgba(255,255,255,0.14)',
    },
  },
  {
    label: 'Violet',
    hex: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b0764 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.76)',
      accent: '#ddd6fe',
      iconBg: 'rgba(255,255,255,0.14)',
    },
  },
  {
    label: 'Fuchsia',
    hex: '#a21caf',
    gradient: 'linear-gradient(135deg, #a21caf 0%, #500724 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.76)',
      accent: '#f5d0fe',
      iconBg: 'rgba(255,255,255,0.14)',
    },
  },
  {
    label: 'Rose',
    hex: '#e11d48',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #7f1d1d 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.78)',
      accent: '#fecdd3',
      iconBg: 'rgba(255,255,255,0.15)',
    },
  },
  {
    label: 'Orange',
    hex: '#ea580c',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #431407 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.78)',
      accent: '#fed7aa',
      iconBg: 'rgba(255,255,255,0.15)',
    },
  },
  {
    label: 'Amber',
    hex: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.80)',
      accent: '#fde68a',
      iconBg: 'rgba(255,255,255,0.18)',
    },
  },
  {
    label: 'Gold',
    hex: '#ca8a04',
    gradient: 'linear-gradient(135deg, #ca8a04 0%, #451a03 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.80)',
      accent: '#fef08a',
      iconBg: 'rgba(255,255,255,0.18)',
    },
  },
  {
    label: 'Emerald',
    hex: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #022c22 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.78)',
      accent: '#a7f3d0',
      iconBg: 'rgba(255,255,255,0.15)',
    },
  },
  {
    label: 'Teal',
    hex: '#0d9488',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #042f2e 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.78)',
      accent: '#99f6e4',
      iconBg: 'rgba(255,255,255,0.15)',
    },
  },
  {
    label: 'Slate',
    hex: '#475569',
    gradient: 'linear-gradient(135deg, #475569 0%, #020617 100%)',
    text: {
      title: '#ffffff',
      description: 'rgba(255,255,255,0.72)',
      accent: '#cbd5e1',
      iconBg: 'rgba(255,255,255,0.12)',
    },
  },
];

/**
 * Cari tema warna berdasarkan hex.
 * Kalau tidak ditemukan (hex custom / null), fallback ke Deep Navy.
 */
export function getDivisionColorTheme(hex: string | null | undefined): DivisionColorTheme {
  if (hex) {
    const found = DIVISION_COLOR_THEMES.find(
      (t) => t.hex.toLowerCase() === hex.toLowerCase()
    );
    if (found) return found;
  }
  return DIVISION_COLOR_THEMES[1]; // Deep Navy sebagai default
}

/** Daftar warna untuk color picker di admin (subset dari DIVISION_COLOR_THEMES) */
export const DIVISION_COLORS = DIVISION_COLOR_THEMES.map(({ label, hex }) => ({ label, hex }));
