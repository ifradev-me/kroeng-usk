'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { supabase, News } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AdminNewsPage() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    published: false,
  });

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNews(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const formatDate = (dateString: string) => {
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
      slug: formData.slug || generateSlug(formData.title),
      excerpt: formData.excerpt || null,
      content: formData.content,
      cover_image: formData.cover_image || null,
      published: formData.published,
      author_id: user?.id,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    try {
      if (editingNews) {
        const { error } = await supabase.from('news').update(payload).eq('id', editingNews.id);
        if (error) throw error;
        toast.success('News updated successfully');
      } else {
        const { error } = await supabase.from('news').insert(payload);
        if (error) throw error;
        toast.success('News created successfully');
      }

      handleCloseDialog(false);
      fetchNews();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleEdit = (item: News) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content || '',
      cover_image: item.cover_image || '',
      published: item.published,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete news');
    } else {
      toast.success('News deleted successfully');
      fetchNews();
    }
  };

  const togglePublish = async (item: News) => {
    const { error } = await supabase
      .from('news')
      .update({
        published: !item.published,
        published_at: !item.published ? new Date().toISOString() : item.published_at,
      })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(item.published ? 'News unpublished' : 'News published');
      fetchNews();
    }
  };

  const handleCloseDialog = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingNews(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        published: false,
      });
    }
  };

  // Filter news
  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-navy-900">
            News Management
          </h1>
          <p className="text-gray-600 mt-1">Buat dan kelola berita KROENG</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-electric-500 hover:bg-electric-600 gap-2">
              <Plus className="w-4 h-4" />
              Add News
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUpload
                  value={formData.cover_image}
                  onChange={(url) => setFormData({ ...formData, cover_image: url })}
                  folder="news"
                  aspectRatio="video"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter news title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to auto-generate from title
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt / Summary</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of the news..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content * (Markdown)</Label>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-0">
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write the full news content here using Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

[Link text](https://example.com)

![Image alt](image-url)"
                      rows={12}
                      className="font-mono text-sm"
                      required
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-white prose prose-sm max-w-none">
                      {formData.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formData.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-gray-400 italic">Nothing to preview...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                <p className="text-xs text-gray-500">
                  Supports Markdown: **bold**, *italic*, # headings, - lists, [links](url), ![images](url)
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <div>
                  <Label htmlFor="published" className="cursor-pointer">
                    Publish immediately
                  </Label>
                  <p className="text-xs text-gray-500">
                    If unchecked, the news will be saved as draft
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 pb-2">
                <Button type="button" variant="outline" onClick={() => handleCloseDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-electric-500 hover:bg-electric-600">
                  {editingNews ? 'Update' : 'Create'}
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
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              {news.length === 0
                ? 'Belum ada berita. Buat berita pertama!'
                : 'Tidak ada berita yang cocok dengan pencarian.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy-900 truncate">{item.title}</h3>
                        <Badge
                          variant={item.published ? 'default' : 'secondary'}
                          className={item.published ? 'bg-green-100 text-green-700' : ''}
                        >
                          {item.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {formatDate(item.created_at)}
                        {item.published_at && ` • Published: ${formatDate(item.published_at)}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(item)}
                        className={item.published ? 'text-green-600' : 'text-gray-400'}
                        title={item.published ? 'Unpublish' : 'Publish'}
                      >
                        {item.published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
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

      {/* Stats */}
      <div className="mt-6 flex gap-4 text-sm text-gray-500">
        <span>Total: {news.length}</span>
        <span>Published: {news.filter((n) => n.published).length}</span>
        <span>Draft: {news.filter((n) => !n.published).length}</span>
      </div>
    </div>
  );
}