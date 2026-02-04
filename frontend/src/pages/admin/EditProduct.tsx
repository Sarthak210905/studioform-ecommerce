import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  sale_price: string;
  compare_price: string;
  cost_per_item: string;
  sku: string;
  barcode: string;
  stock_quantity: string;
  low_stock_threshold: string;
  weight: string;
  category: string;
  brand: string;
  tags: string;
  is_active: boolean;
  is_featured: boolean;
}

interface ExistingImage {
  id: string;
  url: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  sale_price: '',
  compare_price: '',
  cost_per_item: '',
  sku: '',
  barcode: '',
  stock_quantity: '',
  low_stock_threshold: '10',
  weight: '',
  category: '',
  brand: '',
  tags: '',
  is_active: true,
  is_featured: false,
};

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;

      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        sale_price: product.sale_price?.toString() || '',
        compare_price: product.compare_price?.toString() || '',
        cost_per_item: product.cost_per_item?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        stock_quantity: product.stock?.toString() || '0',
        low_stock_threshold: product.low_stock_threshold?.toString() || '10',
        weight: product.weight?.toString() || '',
        category: product.category || '',
        brand: product.brand || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
      });

      setExistingImages(product.images || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 images allowed',
        variant: 'destructive',
      });
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    try {
      await api.delete(`/products/${id}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      const basePrice = parseFloat(formData.price || '0');
      const salePriceVal = parseFloat(formData.sale_price || '0');

      submitData.append('name', formData.name);
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock_quantity);
      submitData.append('category', formData.category);
      submitData.append('brand', formData.brand);
      submitData.append('is_active', String(formData.is_active));
      submitData.append('is_featured', String(formData.is_featured));
      if (formData.tags) {
        submitData.append('tags', formData.tags);
      }
      if (salePriceVal > 0 && salePriceVal < basePrice) {
        submitData.append('sale_price', formData.sale_price);
        submitData.append('discount_active', 'true');
      }

      newImages.forEach((image) => {
        submitData.append('images', image);
      });

      await api.put(`/products/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });

      navigate('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/products')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., new, trending, sale"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sale_price">Discounted Price</Label>
                <Input
                  id="sale_price"
                  name="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  placeholder="Enter sale price"
                />
              </div>

              <div>
                <Label htmlFor="compare_price">Compare at Price</Label>
                <Input
                  id="compare_price"
                  name="compare_price"
                  type="number"
                  step="0.01"
                  value={formData.compare_price}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="cost_per_item">Cost per Item</Label>
                <Input
                  id="cost_per_item"
                  name="cost_per_item"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_item}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                <Input
                  id="low_stock_threshold"
                  name="low_stock_threshold"
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <Label>Current Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Product"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <Label htmlFor="images">Add More Images</Label>
              <div className="mt-2">
                <label
                  htmlFor="images"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload new images
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {existingImages.length + newImages.length}/5 images
                    </p>
                  </div>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImageUpload}
                    className="hidden"
                    disabled={existingImages.length + newImages.length >= 5}
                  />
                </label>
              </div>
            </div>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div>
                <Label>New Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Product will be visible to customers
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_featured">Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Show on homepage and featured sections
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Product...
              </>
            ) : (
              'Update Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
