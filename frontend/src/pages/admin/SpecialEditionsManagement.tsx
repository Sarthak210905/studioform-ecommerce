import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Sparkles,
  ArrowLeft,
  Search,
  Image as ImageIcon,
  Package,
  Star,
  Shield,
  Zap,
  Swords,
  Wand2,
  Crown,
  Flame,
  Heart,
  Eye,
  EyeOff,
  X,
  Loader2,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';
import { collectionService, type Collection, type CollectionCreate } from '@/services/collection.service';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Icon map for dynamic icon rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Star, Shield, Zap, Swords, Wand2, Crown, Flame, Heart, Package,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const GRADIENT_PRESETS = [
  { label: 'Amber/Gold', value: 'from-amber-900 via-amber-800 to-yellow-900' },
  { label: 'Red/Crimson', value: 'from-red-900 via-red-800 to-red-950' },
  { label: 'Blue/Indigo', value: 'from-blue-900 via-blue-800 to-indigo-950' },
  { label: 'Gray/Yellow', value: 'from-gray-900 via-gray-800 to-yellow-950' },
  { label: 'Orange/Red', value: 'from-orange-900 via-orange-800 to-red-950' },
  { label: 'Purple/Slate', value: 'from-purple-950 via-indigo-900 to-slate-900' },
  { label: 'Green/Emerald', value: 'from-green-900 via-emerald-800 to-teal-950' },
  { label: 'Pink/Rose', value: 'from-pink-900 via-rose-800 to-red-950' },
];

const ACCENT_PRESETS = [
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Yellow', value: 'bg-yellow-500' },
  { label: 'Orange', value: 'bg-orange-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Green', value: 'bg-green-500' },
  { label: 'Pink', value: 'bg-pink-500' },
];

const emptyForm: CollectionCreate = {
  name: '',
  title: '',
  subtitle: '',
  description: '',
  banner_image: null,
  icon_name: 'Sparkles',
  gradient: 'from-purple-950 via-indigo-900 to-slate-900',
  accent_color: 'bg-purple-500',
  is_active: true,
  position: 0,
};

export default function SpecialEditionsManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'products'>('collections');

  // Collection form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CollectionCreate>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  // Products panel
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Add product dialog
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [allProductsLoading, setAllProductsLoading] = useState(false);

  // Load collections
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await collectionService.getAllCollections();
      setCollections(data);
    } catch (error: any) {
      // If 401/403, collections endpoint might not exist yet — seed defaults
      console.error('Failed to load collections:', error);
      toast({ title: 'Error', description: 'Failed to load collections', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Load products for selected collection
  const loadCollectionProducts = useCallback(async (collection: Collection) => {
    try {
      setProductsLoading(true);
      const result = await collectionService.getCollectionProducts(collection.id, { limit: 100 });
      setCollectionProducts(result.products || []);
    } catch (error) {
      console.error('Failed to load collection products:', error);
      setCollectionProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadCollectionProducts(selectedCollection);
    }
  }, [selectedCollection, loadCollectionProducts]);

  // Load all products for add-product dialog
  const loadAllProducts = useCallback(async () => {
    try {
      setAllProductsLoading(true);
      const params: any = { limit: 200 };
      if (productSearch) params.search = productSearch;
      const data = await productService.getProducts(params);
      setAllProducts(data.products || []);
    } catch {
      setAllProducts([]);
    } finally {
      setAllProductsLoading(false);
    }
  }, [productSearch]);

  useEffect(() => {
    if (addProductOpen) {
      loadAllProducts();
    }
  }, [addProductOpen, loadAllProducts]);

  // ==================== HANDLERS ====================

  const handleNewCollection = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, position: collections.length + 1 });
    setIsFormOpen(true);
  };

  const handleEditCollection = (col: Collection) => {
    setEditingId(col.id);
    setFormData({
      name: col.name,
      title: col.title,
      subtitle: col.subtitle,
      description: col.description,
      banner_image: col.banner_image,
      icon_name: col.icon_name,
      gradient: col.gradient,
      accent_color: col.accent_color,
      is_active: col.is_active,
      position: col.position,
    });
    setIsFormOpen(true);
  };

  const handleSaveCollection = async () => {
    if (!formData.name || !formData.title) {
      toast({ title: 'Error', description: 'Name and title are required', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await collectionService.updateCollection(editingId, formData);
        toast({ title: 'Success', description: 'Collection updated' });
      } else {
        await collectionService.createCollection(formData);
        toast({ title: 'Success', description: 'Collection created' });
      }
      setIsFormOpen(false);
      loadCollections();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to save collection';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!deleteTarget) return;
    try {
      await collectionService.deleteCollection(deleteTarget.id);
      toast({ title: 'Success', description: `Deleted "${deleteTarget.title}"` });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      if (selectedCollection?.id === deleteTarget.id) {
        setSelectedCollection(null);
        setCollectionProducts([]);
      }
      loadCollections();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete collection', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (col: Collection) => {
    try {
      await collectionService.updateCollection(col.id, { is_active: !col.is_active });
      toast({ title: 'Success', description: `Collection ${!col.is_active ? 'activated' : 'deactivated'}` });
      loadCollections();
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!selectedCollection) return;
    try {
      await collectionService.addProductToCollection(selectedCollection.id, product.id);
      toast({ title: 'Success', description: `Added "${product.name}" to ${selectedCollection.title}` });
      loadCollectionProducts(selectedCollection);
      loadCollections();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to add product';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleRemoveProduct = async (product: Product) => {
    if (!selectedCollection) return;
    if (!confirm(`Remove "${product.name}" from ${selectedCollection.title}?`)) return;
    try {
      await collectionService.removeProductFromCollection(selectedCollection.id, product.id);
      toast({ title: 'Success', description: `Removed "${product.name}" from ${selectedCollection.title}` });
      loadCollectionProducts(selectedCollection);
      loadCollections();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to remove product';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const result = await collectionService.seedDefaults();
      toast({ title: 'Success', description: result.message });
      loadCollections();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to seed defaults';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  // Helper: render icon by name
  const renderIcon = (iconName: string, className: string = 'h-4 w-4') => {
    const IconComponent = ICON_MAP[iconName] || Sparkles;
    return <IconComponent className={className} />;
  };

  // Filter products not already in collection for the add dialog
  const availableProducts = allProducts.filter(
    (p) => !collectionProducts.some((cp) => cp.id === p.id)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              Special Editions
            </h1>
            <p className="text-muted-foreground">Manage collections, products, images & banners</p>
          </div>
        </div>
        <div className="flex gap-2">
          {collections.length === 0 && (
            <Button variant="outline" onClick={handleSeedDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Seed Defaults
            </Button>
          )}
          <Button onClick={handleNewCollection}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 mb-6 border-b pb-3">
        <Button
          variant={activeTab === 'collections' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('collections')}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Collections ({collections.length})
        </Button>
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('products')}
          disabled={!selectedCollection}
        >
          <Package className="h-4 w-4 mr-1" />
          Products {selectedCollection ? `(${selectedCollection.title})` : ''}
        </Button>
      </div>

      {/* ==================== COLLECTIONS TAB ==================== */}
      {activeTab === 'collections' && (
        <>
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No collections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first special edition collection or seed the defaults.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSeedDefaults}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Seed Default Collections
                  </Button>
                  <Button onClick={handleNewCollection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {collections.map((col) => {
                const IconComp = ICON_MAP[col.icon_name] || Sparkles;
                return (
                  <Card key={col.id} className={`overflow-hidden transition-all ${!col.is_active ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col md:flex-row">
                      {/* Collection preview */}
                      <div className={`relative w-full md:w-64 h-40 bg-gradient-to-br ${col.gradient} text-white p-4 flex flex-col justify-between shrink-0`}>
                        {col.banner_image ? (
                          <>
                            <img src={col.banner_image} alt={col.title} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40" />
                          </>
                        ) : null}
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <IconComp className="h-5 w-5" />
                            <span className="font-bold text-lg">{col.title}</span>
                          </div>
                          <p className="text-xs text-white/70">{col.subtitle}</p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2">
                          <Badge className={`${col.accent_color} text-white border-0 text-xs`}>
                            {col.product_count} products
                          </Badge>
                          <Badge variant={col.is_active ? 'default' : 'secondary'} className="text-xs">
                            {col.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold">{col.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{col.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Position: {col.position}</span>
                            <span>•</span>
                            <span>Tag: {col.name}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 md:flex-col shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCollection(col);
                              setActiveTab('products');
                            }}
                            className="gap-1"
                          >
                            <Package className="h-3.5 w-3.5" />
                            Products
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCollection(col)}
                            className="gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(col)}
                            className="gap-1"
                          >
                            {col.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {col.is_active ? 'Hide' : 'Show'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteTarget(col);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ==================== PRODUCTS TAB ==================== */}
      {activeTab === 'products' && selectedCollection && (
        <>
          {/* Collection header */}
          <Card className="mb-6">
            <div className={`relative h-32 bg-gradient-to-br ${selectedCollection.gradient} text-white p-5`}>
              {selectedCollection.banner_image && (
                <>
                  <img src={selectedCollection.banner_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}
              <div className="relative z-10 flex items-center justify-between h-full">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {renderIcon(selectedCollection.icon_name, 'h-6 w-6')}
                    {selectedCollection.title}
                  </h2>
                  <p className="text-sm text-white/70">{selectedCollection.subtitle}</p>
                  <p className="text-xs text-white/50 mt-1">{collectionProducts.length} products in this collection</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditCollection(selectedCollection)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit Collection
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setAddProductOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Products
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Products grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border bg-card overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : collectionProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No products in this collection</h3>
                <p className="text-sm text-muted-foreground mb-4">Add products or create new ones for this edition.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setAddProductOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Existing Products
                  </Button>
                  <Button onClick={() => navigate('/admin/products/add')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Create New Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collectionProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.main_image ? (
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    {/* Stock badge */}
                    {product.stock <= 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-xs">
                        Out of Stock
                      </Badge>
                    )}
                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveProduct(product)}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category || product.brand || '—'}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">₹{product.final_price?.toLocaleString('en-IN')}</span>
                      {product.price > product.final_price && (
                        <span className="text-xs text-muted-foreground line-through">₹{product.price?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Badge variant="outline" className="text-[10px]">Stock: {product.stock}</Badge>
                      <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== COLLECTION FORM DIALOG ==================== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Collection' : 'New Collection'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the collection details, banner image, and styling.'
                : 'Create a new special edition collection with banner, gradient, and icon.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Live preview */}
            <div className={`relative rounded-lg overflow-hidden h-32 bg-gradient-to-br ${formData.gradient} text-white p-4 flex flex-col justify-between`}>
              {formData.banner_image && (
                <>
                  <img src={formData.banner_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  {renderIcon(formData.icon_name || 'Sparkles', 'h-5 w-5')}
                  <span className="font-bold text-lg">{formData.title || 'Collection Title'}</span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">{formData.subtitle || 'Subtitle preview'}</p>
              </div>
              <Badge className={`${formData.accent_color} text-white border-0 text-xs w-fit relative z-10`}>
                Preview
              </Badge>
            </div>

            {/* Banner image */}
            <ImageUpload
              preview={formData.banner_image || undefined}
              onUpload={(url) => setFormData({ ...formData, banner_image: url })}
              onClear={() => setFormData({ ...formData, banner_image: null })}
            />

            {/* Name & Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Collection Tag Name *</Label>
                <Input
                  placeholder="e.g., Harry Potter Edition"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">This tag will be added to products</p>
              </div>
              <div className="space-y-2">
                <Label>Display Title *</Label>
                <Input
                  placeholder="e.g., Harry Potter"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                placeholder="e.g., Wizarding World Desk Accessories"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Collection description for the special editions page..."
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Icon & Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={formData.icon_name || 'Sparkles'}
                  onValueChange={(val) => setFormData({ ...formData, icon_name: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((name) => (
                      <SelectItem key={name} value={name}>
                        <span className="flex items-center gap-2">
                          {renderIcon(name, 'h-4 w-4')}
                          {name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.position ?? 0}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Gradient & Accent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gradient Theme</Label>
                <Select
                  value={formData.gradient || GRADIENT_PRESETS[0].value}
                  onValueChange={(val) => setFormData({ ...formData, gradient: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_PRESETS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded bg-gradient-to-r ${g.value}`} />
                          {g.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <Select
                  value={formData.accent_color || ACCENT_PRESETS[0].value}
                  onValueChange={(val) => setFormData({ ...formData, accent_color: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_PRESETS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded ${a.value}`} />
                          {a.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Gradient (advanced) */}
            <div className="space-y-2">
              <Label>Custom Gradient (Tailwind classes)</Label>
              <Input
                placeholder="from-purple-950 via-indigo-900 to-slate-900"
                value={formData.gradient || ''}
                onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active (visible on Special Editions page)</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCollection} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? 'Update Collection' : 'Create Collection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE DIALOG ==================== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{deleteTarget?.title}". Products will keep their tags but the collection entry will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCollection}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== ADD PRODUCT DIALOG ==================== */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Products to {selectedCollection?.title}</DialogTitle>
            <DialogDescription>
              Select products to add to this special edition collection. The collection tag will be added automatically.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>

          {/* Product list */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {allProductsLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading products...
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No available products to add</p>
              </div>
            ) : (
              availableProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                    {product.main_image && (
                      <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.category || '—'}</span>
                      <span>•</span>
                      <span>₹{product.price?.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    {product.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button size="sm" onClick={() => handleAddProduct(product)} className="shrink-0">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" asChild>
              <Link to="/admin/products/add">
                <Upload className="h-4 w-4 mr-2" />
                Create New Product
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setAddProductOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
