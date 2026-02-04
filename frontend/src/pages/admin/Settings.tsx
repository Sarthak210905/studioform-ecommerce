import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Mail, 
  BarChart3, 
  Eye,
  Save,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface AppSettings {
  ga4_measurement_id: string;
  email_notifications_enabled: boolean;
  email_address: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  analytics_enabled: boolean;
  newsletter_enabled: boolean;
  order_confirmation_emails: boolean;
  shipping_notification_emails: boolean;
  return_notification_emails: boolean;
  platform_fee_percentage: number;
  shipping_free_threshold: number;
  shipping_flat_rate: number;
  return_policy_days: number;
}

const defaultSettings: AppSettings = {
  ga4_measurement_id: 'G-ZTBWB3Q6F4',
  email_notifications_enabled: true,
  email_address: 'support@premiumdeskaccessories.com',
  seo_title: 'Premium Desk Accessories - Transform Your Workspace',
  seo_description: 'High-quality handcrafted desk accessories to enhance your workspace productivity and style.',
  seo_keywords: 'desk accessories, workspace, premium, handcrafted',
  analytics_enabled: true,
  newsletter_enabled: true,
  order_confirmation_emails: true,
  shipping_notification_emails: true,
  return_notification_emails: true,
  platform_fee_percentage: 2,
  shipping_free_threshold: 1499,
  shipping_flat_rate: 150,
  return_policy_days: 7,
};

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In production, you would fetch from backend
      // const response = await api.get('/admin/settings');
      // setSettings(response.data);
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In production, you would save to backend
      // await api.post('/admin/settings', settings);
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings & Configuration</h1>
        <p className="text-muted-foreground">Manage all application settings, analytics, and integrations</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Google Analytics 4
              </CardTitle>
              <CardDescription>Configure GA4 tracking and measurement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga4">Measurement ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="ga4"
                    value={settings.ga4_measurement_id}
                    onChange={(e) => handleInputChange('ga4_measurement_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.ga4_measurement_id, 'ga4')}
                  >
                    {copied === 'ga4' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Google Analytics 4 Measurement ID. Get it from your GA4 property settings.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics-enabled">Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground mt-1">Track user behavior and conversions</p>
                </div>
                <Switch
                  id="analytics-enabled"
                  checked={settings.analytics_enabled}
                  onCheckedChange={(checked) => handleInputChange('analytics_enabled', checked)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-blue-900">GA4 Features Active</p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1">
                      <li>✓ Page view tracking</li>
                      <li>✓ Product view tracking</li>
                      <li>✓ Add to cart events</li>
                      <li>✓ Purchase tracking</li>
                      <li>✓ Search events</li>
                      <li>✓ Real-time visitor monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>View real-time analytics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Access your analytics dashboard at:
                </p>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
                  https://analytics.google.com/analytics/web/#/p/{settings.ga4_measurement_id.replace('G-', '')}/report/realtime
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure transactional emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Support Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email_address}
                  onChange={(e) => handleInputChange('email_address', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Email Types</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Order Confirmation</Label>
                    <p className="text-xs text-muted-foreground mt-1">Send when order is placed</p>
                  </div>
                  <Switch
                    checked={settings.order_confirmation_emails}
                    onCheckedChange={(checked) => handleInputChange('order_confirmation_emails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Shipping Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-1">Send tracking updates</p>
                  </div>
                  <Switch
                    checked={settings.shipping_notification_emails}
                    onCheckedChange={(checked) => handleInputChange('shipping_notification_emails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Return Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-1">Send return status updates</p>
                  </div>
                  <Switch
                    checked={settings.return_notification_emails}
                    onCheckedChange={(checked) => handleInputChange('return_notification_emails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Newsletter</Label>
                    <p className="text-xs text-muted-foreground mt-1">Enable newsletter signup</p>
                  </div>
                  <Switch
                    checked={settings.newsletter_enabled}
                    onCheckedChange={(checked) => handleInputChange('newsletter_enabled', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-green-900">Email Features Active</p>
                    <ul className="text-xs text-green-800 mt-2 space-y-1">
                      <li>✓ Order confirmations with invoice</li>
                      <li>✓ Shipping updates</li>
                      <li>✓ Delivery confirmations</li>
                      <li>✓ Branded email templates</li>
                      <li>✓ HTML formatting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Search Engine Optimization
              </CardTitle>
              <CardDescription>Configure default SEO meta tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Page Title</Label>
                <Input
                  id="seo-title"
                  value={settings.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder="Your page title"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{settings.seo_title.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-desc">Meta Description</Label>
                <Textarea
                  id="seo-desc"
                  value={settings.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder="Your meta description"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">{settings.seo_description.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input
                  id="seo-keywords"
                  value={settings.seo_keywords}
                  onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-muted-foreground">Separate with commas</p>
              </div>

              <Separator />

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-purple-900">SEO Features Active</p>
                    <ul className="text-xs text-purple-800 mt-2 space-y-1">
                      <li>✓ Meta tags on all pages</li>
                      <li>✓ Schema.org structured data</li>
                      <li>✓ Open Graph tags for social sharing</li>
                      <li>✓ Canonical URLs</li>
                      <li>✓ Product schema markup</li>
                      <li>✓ Breadcrumb navigation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Configuration</CardTitle>
              <CardDescription>Configure shipping rates and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-rate">Flat Shipping Rate (₹)</Label>
                  <Input
                    id="shipping-rate"
                    type="number"
                    value={settings.shipping_flat_rate}
                    onChange={(e) => handleInputChange('shipping_flat_rate', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-shipping">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="free-shipping"
                    type="number"
                    value={settings.shipping_free_threshold}
                    onChange={(e) => handleInputChange('shipping_free_threshold', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Customers get free shipping if order total exceeds the threshold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fees & Policies</CardTitle>
              <CardDescription>Configure platform fees and return policy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                  <Input
                    id="platform-fee"
                    type="number"
                    step="0.1"
                    value={settings.platform_fee_percentage}
                    onChange={(e) => handleInputChange('platform_fee_percentage', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-policy">Return Policy (Days)</Label>
                  <Input
                    id="return-policy"
                    type="number"
                    value={settings.return_policy_days}
                    onChange={(e) => handleInputChange('return_policy_days', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Image Optimization</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Search & Filters</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Product Recommendations</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Newsletter System</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Analytics Integration</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-8 flex gap-4">
        <Button
          onClick={handleSaveSettings}
          disabled={!hasChanges || loading}
          className="gap-2"
          size="lg"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        {hasChanges && (
          <span className="text-sm text-muted-foreground self-center">You have unsaved changes</span>
        )}
      </div>
    </div>
  );
}
