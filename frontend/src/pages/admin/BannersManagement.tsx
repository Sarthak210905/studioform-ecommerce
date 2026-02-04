import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';
import { bannerService, type HeroBanner } from '@/services/banner.service';
import { useToast } from '@/hooks/use-toast';

export default function BannersManagement() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<HeroBanner>>({
    name: '',
    image_url: '',
    title: '',
    description: '',
    position: 1,
    cta_text: '',
    cta_link: '',
    is_active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getHeroBanners();
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingId(banner.id || '');
    setFormData(banner);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      image_url: '',
      title: '',
      description: '',
      position: 1,
      cta_text: '',
      cta_link: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.image_url || !formData.title || !formData.description) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.position) {
        toast({
          title: 'Error',
          description: 'Please select a position',
          variant: 'destructive',
        });
        return;
      }

      const bannerData: HeroBanner = {
        name: formData.name,
        image_url: formData.image_url,
        title: formData.title,
        description: formData.description,
        position: formData.position,
        cta_text: formData.cta_text || '',
        cta_link: formData.cta_link || '',
        is_active: formData.is_active !== false,
      };

      if (editingId) {
        await bannerService.updateBanner(editingId, bannerData);
        toast({
          title: 'Success',
          description: 'Banner updated successfully',
        });
      } else {
        await bannerService.createBanner(bannerData);
        toast({
          title: 'Success',
          description: 'Banner created successfully',
        });
      }

      setIsDialogOpen(false);
      loadBanners();
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to save banner';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteId) {
        await bannerService.deleteBanner(deleteId);
        toast({
          title: 'Success',
          description: 'Banner deleted successfully',
        });
        setDeleteId(null);
        loadBanners();
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banner',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hero Banners</h1>
          <p className="text-muted-foreground">Manage homepage hero banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the banner details below.' : 'Fill in the details to create a new hero banner.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image Upload */}
              <ImageUpload
                preview={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                onClear={() => setFormData({ ...formData, image_url: '' })}
              />

              {/* Form Fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Banner Name *</label>
                <Input
                  placeholder="e.g., Spring Collection"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Banner headline"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Banner description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position *</label>
                  <Select
                    value={String(formData.position || 1)}
                    onValueChange={(val) => setFormData({ ...formData, position: parseInt(val) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Main Hero</SelectItem>
                      <SelectItem value="2">2 - Pivot Banner</SelectItem>
                      <SelectItem value="3">3 - Gifting Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onValueChange={(val) => setFormData({ ...formData, is_active: val === 'active' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CTA Text</label>
                <Input
                  placeholder="e.g., Shop now"
                  value={formData.cta_text || ''}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CTA Link</label>
                <Input
                  placeholder="e.g., /products or /products?category=bags"
                  value={formData.cta_link || ''}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingId ? 'Update' : 'Create'} Banner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
            </Card>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No banners yet</p>
            <Button onClick={handleNew} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create first banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="grid md:grid-cols-4 gap-4 p-4">
                {/* Thumbnail */}
                <div className="md:col-span-1">
                  <img
                    src={banner.image_url}
                    alt={banner.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{banner.name}</h3>
                    <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{banner.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{banner.description}</p>
                  <div className="pt-2">
                    <Badge variant="outline" className="text-xs">
                      Position {banner.position}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(banner)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteId(banner.id || '');
                      setIsDeleteDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. The banner will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
