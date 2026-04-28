'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Zap,
  Code,
  Palette,
  Users,
  Cpu,
  Wrench,
  Megaphone,
  Globe,
  Camera,
  Music,
  BookOpen,
  Rocket,
  Shield,
  Database,
  Wifi,
  Settings,
  Star,
  Heart,
  Layout,
  Terminal,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase, Division } from '@/lib/supabase';
import { DIVISION_COLORS } from '@/lib/constants';
import { toast } from 'sonner';

// Ikon yang tersedia untuk divisi
const AVAILABLE_ICONS = [
  { name: 'Zap', icon: Zap },
  { name: 'Code', icon: Code },
  { name: 'Palette', icon: Palette },
  { name: 'Users', icon: Users },
  { name: 'Cpu', icon: Cpu },
  { name: 'Wrench', icon: Wrench },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Globe', icon: Globe },
  { name: 'Camera', icon: Camera },
  { name: 'Music', icon: Music },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Rocket', icon: Rocket },
  { name: 'Shield', icon: Shield },
  { name: 'Database', icon: Database },
  { name: 'Wifi', icon: Wifi },
  { name: 'Settings', icon: Settings },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Layout', icon: Layout },
  { name: 'Terminal', icon: Terminal },
  { name: 'Layers', icon: Layers },
];

function DivisionIcon({ iconName, className }: { iconName: string | null; className?: string }) {
  const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
  if (!found) return <Layers className={className} />;
  const Icon = found.icon;
  return <Icon className={className} />;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type DivisionForm = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order_index: number;
};

const emptyForm: DivisionForm = {
  name: '',
  slug: '',
  description: '',
  icon: 'Layers',
  color: '#0ea5e9',
  order_index: 0,
};

export default function AdminDivisionsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [form, setForm] = useState<DivisionForm>(emptyForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDivision, setDeletingDivision] = useState<Division | null>(null);

  useEffect(() => {
    fetchDivisions();
  }, []);

  async function fetchDivisions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      toast.error('Gagal memuat divisi');
    } else {
      setDivisions(data || []);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditingDivision(null);
    setForm({ ...emptyForm, order_index: divisions.length + 1 });
    setSlugManuallyEdited(false);
    setDialogOpen(true);
  }

  function openEdit(division: Division) {
    setEditingDivision(division);
    setForm({
      name: division.name,
      slug: division.slug,
      description: division.description || '',
      icon: division.icon || 'Layers',
      color: division.color || '#0ea5e9',
      order_index: division.order_index,
    });
    setSlugManuallyEdited(true);
    setDialogOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : slugify(name),
    }));
  }

  function handleSlugChange(slug: string) {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: slugify(slug) }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Nama divisi tidak boleh kosong');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug tidak boleh kosong');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        icon: form.icon,
        color: form.color,
        order_index: form.order_index,
      };

      if (editingDivision) {
        const { error } = await supabase
          .from('divisions')
          .update(payload)
          .eq('id', editingDivision.id);

        if (error) throw error;
        toast.success('Divisi berhasil diperbarui');
      } else {
        const { error } = await supabase.from('divisions').insert(payload);
        if (error) throw error;
        toast.success('Divisi berhasil dibuat');
      }

      setDialogOpen(false);
      fetchDivisions();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Slug sudah digunakan, coba slug yang berbeda');
      } else {
        toast.error(error.message || 'Gagal menyimpan divisi');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingDivision) return;

    try {
      const { error } = await supabase
        .from('divisions')
        .delete()
        .eq('id', deletingDivision.id);

      if (error) throw error;

      toast.success(`Divisi "${deletingDivision.name}" dihapus`);
      setDeleteDialogOpen(false);
      setDeletingDivision(null);
      fetchDivisions();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus divisi');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Divisi</h1>
          <p className="text-gray-600 mt-1">Kelola divisi-divisi dalam komunitas KROENG</p>
        </div>
        <Button onClick={openCreate} className="bg-electric-500 hover:bg-electric-600 gap-2">
          <Plus className="w-4 h-4" />
          Tambah Divisi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-electric-100 flex items-center justify-center">
                <Layers className="w-5 h-5 text-electric-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{divisions.length}</p>
                <p className="text-sm text-gray-600">Total Divisi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Divisions List */}
      <Card>
        <CardHeader>
          <CardTitle>Semua Divisi</CardTitle>
          <CardDescription>
            Klik edit untuk mengubah nama, deskripsi, atau ikon divisi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full" />
            </div>
          ) : divisions.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Belum ada divisi</p>
              <Button onClick={openCreate} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Buat Divisi Pertama
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {divisions.map((division) => (
                <div
                  key={division.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Drag handle placeholder */}
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: (division.color || '#0ea5e9') + '20',
                      color: division.color || '#0ea5e9',
                    }}
                  >
                    <DivisionIcon iconName={division.icon} className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{division.name}</h3>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {division.slug}
                      </Badge>
                      <span
                        className="inline-block w-3 h-3 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: division.color || '#0ea5e9' }}
                        title={division.color || '#0ea5e9'}
                      />
                    </div>
                    {division.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{division.description}</p>
                    )}
                  </div>

                  {/* Order */}
                  <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                    <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium">
                      {division.order_index}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5"
                      onClick={() => openEdit(division)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => {
                        setDeletingDivision(division);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDivision ? 'Edit Divisi' : 'Tambah Divisi Baru'}</DialogTitle>
            <DialogDescription>
              {editingDivision
                ? 'Ubah informasi divisi ini'
                : 'Buat divisi custom baru untuk komunitas KROENG'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Nama Divisi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="cth: Programmer, Electrical, Designer..."
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1 text-xs">(auto-generate dari nama)</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/divisi/</span>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="programmer"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi singkat tentang divisi ini..."
                rows={3}
              />
            </div>

            {/* Icon picker */}
            <div className="space-y-1.5">
              <Label>Ikon</Label>
              <div className="grid grid-cols-7 gap-2">
                {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, icon: name }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors border-2 ${
                      form.icon === name
                        ? 'border-electric-500 bg-electric-50 text-electric-600'
                        : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={name}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <Label>
                Warna Divisi
                <span className="text-gray-400 font-normal ml-1 text-xs">
                  (tampil di profil member)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {DIVISION_COLORS.map(({ label, hex }) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, color: hex }))}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ring-offset-2 ${
                      form.color === hex ? 'ring-2 ring-gray-800 scale-110' : 'ring-1 ring-black/10'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-6 h-6 rounded-full ring-1 ring-black/10 flex-shrink-0"
                  style={{ backgroundColor: form.color }}
                />
                <span className="text-xs text-gray-500 font-mono">{form.color}</span>
              </div>
            </div>

            {/* Order */}
            <div className="space-y-1.5">
              <Label htmlFor="order">Urutan Tampil</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={form.order_index}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))
                }
                className="w-24"
              />
              <p className="text-xs text-gray-400">Angka kecil tampil lebih awal</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-electric-500 hover:bg-electric-600"
            >
              {saving ? 'Menyimpan...' : editingDivision ? 'Simpan Perubahan' : 'Buat Divisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Divisi?</AlertDialogTitle>
            <AlertDialogDescription>
              Divisi <strong>&quot;{deletingDivision?.name}&quot;</strong> akan dihapus. Member yang
              tergabung dalam divisi ini tidak akan ikut terhapus, tapi mereka tidak lagi terhubung
              ke divisi ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus Divisi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
