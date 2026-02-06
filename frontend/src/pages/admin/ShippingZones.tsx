import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import shippingService, { type ShippingZone, type CreateShippingZone } from '@/services/shipping.service';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

export default function ShippingZones() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateShippingZone>({
    name: '',
    pincodes: [],
    states: [],
    base_charge: 0,
    charge_per_kg: 0,
    free_shipping_threshold: 999,
    estimated_days_min: 3,
    estimated_days_max: 7,
  });

  const [pincodesInput, setPincodesInput] = useState('');
  const [statesInput, setStatesInput] = useState('');

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const data = await shippingService.getAllZones();
      setZones(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load shipping zones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        pincodes: pincodesInput ? pincodesInput.split(',').map(p => p.trim()) : [],
        states: statesInput ? statesInput.split(',').map(s => s.trim()) : [],
      };

      if (editingZone) {
        await shippingService.updateZone(editingZone.id, data);
        toast({
          title: 'Success',
          description: 'Shipping zone updated successfully',
        });
      } else {
        await shippingService.createZone(data);
        toast({
          title: 'Success',
          description: 'Shipping zone created successfully',
        });
      }

      setShowDialog(false);
      resetForm();
      loadZones();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save shipping zone',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      pincodes: zone.pincodes,
      states: zone.states,
      base_charge: zone.base_charge,
      charge_per_kg: zone.charge_per_kg,
      free_shipping_threshold: zone.free_shipping_threshold,
      estimated_days_min: zone.estimated_days_min,
      estimated_days_max: zone.estimated_days_max,
    });
    setPincodesInput(zone.pincodes.join(', '));
    setStatesInput(zone.states.join(', '));
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;

    try {
      await shippingService.deleteZone(id);
      toast({
        title: 'Success',
        description: 'Shipping zone deleted successfully',
      });
      loadZones();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete shipping zone',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await shippingService.toggleZoneStatus(id);
      toast({
        title: 'Success',
        description: 'Zone status updated',
      });
      loadZones();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update zone status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      pincodes: [],
      states: [],
      base_charge: 0,
      charge_per_kg: 0,
      free_shipping_threshold: 999,
      estimated_days_min: 3,
      estimated_days_max: 7,
    });
    setPincodesInput('');
    setStatesInput('');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shipping Zones</h1>
          <p className="text-muted-foreground">Manage shipping zones and rates</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingZone ? 'Edit' : 'Create'} Shipping Zone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_charge">Base Charge (₹) *</Label>
                  <Input
                    id="base_charge"
                    type="number"
                    step="0.01"
                    value={formData.base_charge}
                    onChange={(e) => setFormData({ ...formData, base_charge: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="charge_per_kg">Charge per KG (₹) *</Label>
                  <Input
                    id="charge_per_kg"
                    type="number"
                    step="0.01"
                    value={formData.charge_per_kg}
                    onChange={(e) => setFormData({ ...formData, charge_per_kg: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="free_shipping_threshold">Free Shipping Above (₹) *</Label>
                <Input
                  id="free_shipping_threshold"
                  type="number"
                  step="0.01"
                  value={formData.free_shipping_threshold}
                  onChange={(e) => setFormData({ ...formData, free_shipping_threshold: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_days_min">Min Delivery Days *</Label>
                  <Input
                    id="estimated_days_min"
                    type="number"
                    value={formData.estimated_days_min}
                    onChange={(e) => setFormData({ ...formData, estimated_days_min: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_days_max">Max Delivery Days *</Label>
                  <Input
                    id="estimated_days_max"
                    type="number"
                    value={formData.estimated_days_max}
                    onChange={(e) => setFormData({ ...formData, estimated_days_max: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincodes">Pincodes (comma-separated)</Label>
                <Input
                  id="pincodes"
                  value={pincodesInput}
                  onChange={(e) => setPincodesInput(e.target.value)}
                  placeholder="e.g., 400001, 400002, 400003"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter pincodes separated by commas</p>
              </div>

              <div>
                <Label htmlFor="states">States (comma-separated)</Label>
                <Input
                  id="states"
                  value={statesInput}
                  onChange={(e) => setStatesInput(e.target.value)}
                  placeholder="e.g., Maharashtra, Gujarat, Rajasthan"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter state names separated by commas</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingZone ? 'Update' : 'Create'} Zone
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {zones.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No shipping zones configured yet. Click "Add Zone" to create one.
            </CardContent>
          </Card>
        ) : (
          zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {zone.name}
                        <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Delivery: {zone.estimated_days_min}-{zone.estimated_days_max} days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(zone.id)}
                    >
                      {zone.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(zone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(zone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Base: ₹{zone.base_charge} + ₹{zone.charge_per_kg}/kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Free shipping above: ₹{zone.free_shipping_threshold}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Coverage</p>
                    {zone.pincodes.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {zone.pincodes.length} pincodes
                      </p>
                    )}
                    {zone.states.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        States: {zone.states.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
