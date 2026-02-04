import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Ticket,
  Calendar,
  Percent,
  IndianRupee,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

interface CouponFormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_purchase_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const initialFormData: CouponFormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  min_purchase_amount: '0',
  max_discount_amount: '',
  usage_limit: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
};

export default function Coupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await api.get('/admin/coupons/');
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_purchase_amount: coupon.min_purchase_amount.toString(),
        max_discount_amount: coupon.max_discount_amount?.toString() || '',
        usage_limit: coupon.usage_limit?.toString() || '',
        valid_from: coupon.valid_from.split('T')[0],
        valid_until: coupon.valid_until.split('T')[0],
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase_amount: parseFloat(formData.min_purchase_amount),
        max_discount_amount: formData.max_discount_amount
          ? parseFloat(formData.max_discount_amount)
          : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, submitData);
        toast({
          title: 'Success',
          description: 'Coupon updated successfully',
        });
      } else {
        await api.post('/admin/coupons/', submitData);
        toast({
          title: 'Success',
          description: 'Coupon created successfully',
        });
      }

      loadCoupons();
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save coupon',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      await api.delete(`/admin/coupons/${couponId}`);
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });
      loadCoupons();
      setDeleteConfirm(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (couponId: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/coupons/${couponId}/toggle`, { is_active: !isActive });
      toast({
        title: 'Success',
        description: `Coupon ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
      loadCoupons();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update coupon status',
        variant: 'destructive',
      });
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coupons Management</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by coupon code..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Coupons List */}
      {filteredCoupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No coupons found' : 'No coupons yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try searching with a different code'
                : 'Create your first coupon to start offering discounts'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Coupon
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <Card
              key={coupon.id}
              className={`relative ${
                !coupon.is_active || isExpired(coupon.valid_until)
                  ? 'opacity-60'
                  : ''
              }`}
            >
              <CardContent className="p-6">
                {/* Status Badges */}
                <div className="flex gap-2 mb-4">
                  {coupon.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                  )}
                  {isExpired(coupon.valid_until) && (
                    <Badge className="bg-red-100 text-red-700">Expired</Badge>
                  )}
                </div>

                {/* Coupon Code */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <h3 className="text-2xl font-bold tracking-wider">
                      {coupon.code}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coupon.description}
                  </p>
                </div>

                {/* Discount Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    {coupon.discount_type === 'percentage' ? (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      <span className="font-semibold">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}% OFF`
                          : `₹${coupon.discount_value} OFF`}
                      </span>
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Min. Purchase: </span>
                    <span className="font-medium">
                      ₹{coupon.min_purchase_amount.toLocaleString()}
                    </span>
                  </div>

                  {coupon.max_discount_amount && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Max. Discount: </span>
                      <span className="font-medium">
                        ₹{coupon.max_discount_amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-muted-foreground">Usage: </span>
                    <span className="font-medium">
                      {coupon.usage_count}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' times'}
                    </span>
                  </div>
                </div>

                {/* Validity */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(coupon.valid_from).toLocaleDateString('en-IN')} -{' '}
                    {new Date(coupon.valid_until).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={() =>
                        handleToggleActive(coupon.id, coupon.is_active)
                      }
                      disabled={isExpired(coupon.valid_until)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(coupon)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(coupon.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {coupons.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary">{coupons.length}</p>
              <p className="text-sm text-muted-foreground">Total Coupons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {coupons.filter((c) => c.is_active && !isExpired(c.valid_until)).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-red-600">
                {coupons.filter((c) => isExpired(c.valid_until)).length}
              </p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {coupons.reduce((sum, c) => sum + c.usage_count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Usage</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
            <DialogDescription>
              Fill in the coupon details below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Coupon Code */}
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="e.g., SAVE20"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the offer"
                required
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type *</Label>
                <select
                  id="discount_type"
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_type: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: e.target.value })
                  }
                  placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                  required
                />
              </div>
            </div>

            {/* Min Purchase & Max Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_purchase_amount">
                  Min. Purchase Amount (₹) *
                </Label>
                <Input
                  id="min_purchase_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_purchase_amount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_discount_amount">Max. Discount Amount (₹)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  step="0.01"
                  value={formData.max_discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, max_discount_amount: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Valid From *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_from: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="valid_until">Valid Until *</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Coupon will be available for customers to use
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingCoupon ? (
                  'Update Coupon'
                ) : (
                  'Create Coupon'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
