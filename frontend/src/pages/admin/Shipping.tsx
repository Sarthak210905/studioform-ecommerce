import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Edit,
  Trash2,
  Loader2,
  Truck,
  MapPin,
  IndianRupee,
  Clock,
} from 'lucide-react';

interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  base_rate: number;
  per_kg_rate: number;
  free_shipping_threshold: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at: string;
}

interface ShippingFormData {
  name: string;
  states: string;
  base_rate: string;
  per_kg_rate: string;
  free_shipping_threshold: string;
  estimated_days_min: string;
  estimated_days_max: string;
  is_active: boolean;
}

const initialFormData: ShippingFormData = {
  name: '',
  states: '',
  base_rate: '',
  per_kg_rate: '',
  free_shipping_threshold: '0',
  estimated_days_min: '',
  estimated_days_max: '',
  is_active: true,
};

export default function Shipping() {
  const { toast } = useToast();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [formData, setFormData] = useState<ShippingFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadShippingZones();
  }, []);

  const loadShippingZones = async () => {
    try {
      const response = await api.get('/admin/shipping-zones/');
      setZones(response.data);
    } catch (error) {
      console.error('Failed to load shipping zones:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping zones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        states: zone.states.join(', '),
        base_rate: zone.base_rate.toString(),
        per_kg_rate: zone.per_kg_rate.toString(),
        free_shipping_threshold: zone.free_shipping_threshold.toString(),
        estimated_days_min: zone.estimated_days_min.toString(),
        estimated_days_max: zone.estimated_days_max.toString(),
        is_active: zone.is_active,
      });
    } else {
      setEditingZone(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingZone(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const statesArray = formData.states
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const submitData = {
        name: formData.name,
        states: statesArray,
        base_rate: parseFloat(formData.base_rate),
        per_kg_rate: parseFloat(formData.per_kg_rate),
        free_shipping_threshold: parseFloat(formData.free_shipping_threshold),
        estimated_days_min: parseInt(formData.estimated_days_min),
        estimated_days_max: parseInt(formData.estimated_days_max),
        is_active: formData.is_active,
      };

      if (editingZone) {
        await api.put(`/admin/shipping-zones/${editingZone.id}`, submitData);
        toast({
          title: 'Success',
          description: 'Shipping zone updated successfully',
        });
      } else {
        await api.post('/admin/shipping-zones/', submitData);
        toast({
          title: 'Success',
          description: 'Shipping zone created successfully',
        });
      }

      loadShippingZones();
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save shipping zone',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      await api.delete(`/admin/shipping-zones/${zoneId}`);
      toast({
        title: 'Success',
        description: 'Shipping zone deleted successfully',
      });
      loadShippingZones();
      setDeleteConfirm(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete shipping zone',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (zoneId: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/shipping-zones/${zoneId}/toggle`, {
        is_active: !isActive,
      });
      toast({
        title: 'Success',
        description: `Shipping zone ${!isActive ? 'activated' : 'deactivated'}`,
      });
      loadShippingZones();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update zone status',
        variant: 'destructive',
      });
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shipping Zones</h1>
          <p className="text-muted-foreground">
            Manage shipping rates and delivery times by location
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shipping Zone
        </Button>
      </div>

      {/* Zones List */}
      {zones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Truck className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No shipping zones configured</h3>
            <p className="text-muted-foreground mb-6">
              Create shipping zones to define delivery rates and times
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Zone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {zone.name}
                    </CardTitle>
                    {zone.is_active ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(zone)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(zone.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* States Covered */}
                <div>
                  <p className="text-sm font-medium mb-2">States Covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {zone.states.slice(0, 5).map((state, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {state}
                      </Badge>
                    ))}
                    {zone.states.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{zone.states.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Base Rate</p>
                    </div>
                    <p className="text-lg font-bold">₹{zone.base_rate}</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Per Kg</p>
                    </div>
                    <p className="text-lg font-bold">₹{zone.per_kg_rate}</p>
                  </div>
                </div>

                {/* Free Shipping */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Free shipping</span> on orders above{' '}
                    <span className="font-bold">₹{zone.free_shipping_threshold}</span>
                  </p>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">
                      {zone.estimated_days_min}-{zone.estimated_days_max} days
                    </span>{' '}
                    delivery
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium">Zone Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={zone.is_active}
                      onCheckedChange={() => handleToggleActive(zone.id, zone.is_active)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {zones.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary">{zones.length}</p>
              <p className="text-sm text-muted-foreground">Total Zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {zones.filter((z) => z.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {zones.reduce((sum, z) => sum + z.states.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">States Covered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-orange-600">
                ₹{Math.min(...zones.map((z) => z.base_rate))}
              </p>
              <p className="text-sm text-muted-foreground">Lowest Base Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
            </DialogTitle>
            <DialogDescription>
              Configure shipping rates and delivery times for specific regions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Zone Name */}
            <div>
              <Label htmlFor="name">Zone Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Metro Cities, North Zone"
                required
              />
            </div>

            {/* States */}
            <div>
              <Label htmlFor="states">States (comma-separated) *</Label>
              <Input
                id="states"
                value={formData.states}
                onChange={(e) => setFormData({ ...formData, states: e.target.value })}
                placeholder="e.g., Maharashtra, Gujarat, Delhi"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple states with commas
              </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_rate">Base Rate (₹) *</Label>
                <Input
                  id="base_rate"
                  type="number"
                  step="0.01"
                  value={formData.base_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, base_rate: e.target.value })
                  }
                  placeholder="50"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed shipping charge
                </p>
              </div>

              <div>
                <Label htmlFor="per_kg_rate">Per Kg Rate (₹) *</Label>
                <Input
                  id="per_kg_rate"
                  type="number"
                  step="0.01"
                  value={formData.per_kg_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, per_kg_rate: e.target.value })
                  }
                  placeholder="10"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional charge per kg
                </p>
              </div>
            </div>

            {/* Free Shipping Threshold */}
            <div>
              <Label htmlFor="free_shipping_threshold">
                Free Shipping Threshold (₹) *
              </Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                step="0.01"
                value={formData.free_shipping_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, free_shipping_threshold: e.target.value })
                }
                placeholder="999"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Order value for free shipping (set 0 for no free shipping)
              </p>
            </div>

            {/* Delivery Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated_days_min">Min. Delivery Days *</Label>
                <Input
                  id="estimated_days_min"
                  type="number"
                  value={formData.estimated_days_min}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_days_min: e.target.value })
                  }
                  placeholder="3"
                  required
                />
              </div>

              <div>
                <Label htmlFor="estimated_days_max">Max. Delivery Days *</Label>
                <Input
                  id="estimated_days_max"
                  type="number"
                  value={formData.estimated_days_max}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_days_max: e.target.value })
                  }
                  placeholder="5"
                  required
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Zone will be available for shipping
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
                ) : editingZone ? (
                  'Update Zone'
                ) : (
                  'Create Zone'
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
            <DialogTitle>Delete Shipping Zone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shipping zone? This action cannot be
              undone.
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
