'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Search, Trophy, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { supabase, Achievement } from '@/lib/supabase';
import { toast } from 'sonner';

const achievementLevels = [
  { value: 'Juara 1 / Gold', label: 'Juara 1 / Gold' },
  { value: 'Juara 2 / Silver', label: 'Juara 2 / Silver' },
  { value: 'Juara 3 / Bronze', label: 'Juara 3 / Bronze' },
  { value: 'Finalist', label: 'Finalist' },
  { value: 'Top 10', label: 'Top 10' },
  { value: 'Top 20', label: 'Top 20' },
  { value: 'Honorable Mention', label: 'Honorable Mention' },
  { value: 'Special Award', label: 'Special Award' },
  { value: 'Best Innovation', label: 'Best Innovation' },
  { value: 'Best Design', label: 'Best Design' },
  { value: 'Best Presentation', label: 'Best Presentation' },
  { value: 'custom', label: '✏️ Custom (ketik sendiri)' },
];

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomLevel, setIsCustomLevel] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    competition_name: '',
    achievement_level: '',
    description: '',
    image_url: '',
    date: '',
    team_members: '',
  });

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setAchievements(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      competition_name: formData.competition_name,
      achievement_level: formData.achievement_level,
      description: formData.description || null,
      image_url: formData.image_url || null,
      date: formData.date || null,
      team_members: formData.team_members
        ? formData.team_members.split(',').map((m) => m.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('achievements')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Achievement updated successfully');
      } else {
        const { error } = await supabase.from('achievements').insert(payload);
        if (error) throw error;
        toast.success('Achievement created successfully');
      }

      handleCloseDialog(false);
      fetchAchievements();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleEdit = (item: Achievement) => {
    setEditingItem(item);
    
    // Check if the achievement_level is one of the predefined options
    const isPredefined = achievementLevels.some(
      (level) => level.value === item.achievement_level && level.value !== 'custom'
    );
    
    setIsCustomLevel(!isPredefined);
    setFormData({
      title: item.title,
      competition_name: item.competition_name,
      achievement_level: item.achievement_level,
      description: item.description || '',
      image_url: item.image_url || '',
      date: item.date || '',
      team_members: item.team_members?.join(', ') || '',
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete achievement');
    } else {
      toast.success('Achievement deleted successfully');
      fetchAchievements();
    }
  };

  const handleCloseDialog = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingItem(null);
      setIsCustomLevel(false);
      setFormData({
        title: '',
        competition_name: '',
        achievement_level: '',
        description: '',
        image_url: '',
        date: '',
        team_members: '',
      });
    }
  };

  const handleLevelChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomLevel(true);
      setFormData({ ...formData, achievement_level: '' });
    } else {
      setIsCustomLevel(false);
      setFormData({ ...formData, achievement_level: value });
    }
  };

  const getAchievementBadgeColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('juara 1') || lowerLevel.includes('gold') || lowerLevel.includes('winner')) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
    if (lowerLevel.includes('juara 2') || lowerLevel.includes('silver')) {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    if (lowerLevel.includes('juara 3') || lowerLevel.includes('bronze')) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    if (lowerLevel.includes('finalist')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    return 'bg-electric-100 text-electric-700 border-electric-200';
  };

  // Filter achievements
  const filteredAchievements = achievements.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.competition_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-navy-900">
            Achievements
          </h1>
          <p className="text-gray-600 mt-1">Kelola prestasi dan penghargaan KROENG</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-electric-500 hover:bg-electric-600 gap-2">
              <Plus className="w-4 h-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingItem ? 'Edit Achievement' : 'Add Achievement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="achievements"
                  aspectRatio="video"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Achievement Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Juara 1 Line Follower"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competition_name">Competition Name *</Label>
                  <Input
                    id="competition_name"
                    value={formData.competition_name}
                    onChange={(e) =>
                      setFormData({ ...formData, competition_name: e.target.value })
                    }
                    placeholder="e.g., Kontes Robot Indonesia"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="achievement_level">Achievement Level *</Label>
                  <Select
                    value={isCustomLevel ? 'custom' : formData.achievement_level}
                    onValueChange={handleLevelChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievementLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCustomLevel && (
                    <Input
                      value={formData.achievement_level}
                      onChange={(e) =>
                        setFormData({ ...formData, achievement_level: e.target.value })
                      }
                      placeholder="Ketik level custom, e.g., Best Rookie Team"
                      className="mt-2"
                      autoFocus
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_members">Team Members (comma separated)</Label>
                <Input
                  id="team_members"
                  value={formData.team_members}
                  onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                  placeholder="Ahmad Fauzi, Budi Santoso, Citra Dewi"
                />
                <p className="text-xs text-gray-500">
                  Separate names with commas
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell the story of this achievement..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 pb-2">
                <Button type="button" variant="outline" onClick={() => handleCloseDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-electric-500 hover:bg-electric-600"
                  disabled={!formData.title || !formData.competition_name || !formData.achievement_level}
                >
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{achievements.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {achievements.filter((a) => 
                  a.achievement_level.toLowerCase().includes('juara 1') ||
                  a.achievement_level.toLowerCase().includes('gold') ||
                  a.achievement_level.toLowerCase().includes('winner')
                ).length}
              </p>
              <p className="text-sm text-gray-600">Gold/Winner</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-28 animate-pulse" />
          ))}
        </div>
      ) : filteredAchievements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {achievements.length === 0
                ? 'Belum ada prestasi. Tambahkan prestasi pertama!'
                : 'Tidak ada prestasi yang cocok dengan pencarian.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAchievements.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-navy-900">{item.title}</h3>
                        <Badge className={getAchievementBadgeColor(item.achievement_level)}>
                          {item.achievement_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-electric-600 font-medium">
                        {item.competition_name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.date)}
                          </span>
                        )}
                        {item.team_members && item.team_members.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {item.team_members.length} members
                          </span>
                        )}
                      </div>
                      {item.team_members && item.team_members.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {item.team_members.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}