import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings as SettingsIcon,
  Store,
  Bell,
  Shield,
  Palette,
  Mail,
  CreditCard,
  Globe,
  Save,
  Upload
} from 'lucide-react';

const token = localStorage.getItem("authToken");

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    storeName: 'Exclusive Store',
    storeDescription: 'Your one-stop shop for premium products',
    storeEmail: 'admin@exclusive.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Business Street, City, State 12345',
    currency: 'KES',
    taxRate: '8.5',
    emailNotifications: true,
    orderNotifications: true,
    inventoryAlerts: true,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveProducts: false,
    enableReviews: true,
    enableWishlist: true,
    enableCompareProducts: true
  });

  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  // Get staff status
  useEffect(() => {
    async function checkUserStaffStatus() {
      try {
        const res = await fetch(`/api/checkuserstaffstatus`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
        });

        if (!res.ok) {
          console.warn('checkuserstaffstatus returned', res.status);
          setIsStaff(false);
          return;
        }

        const data = await res.json();
        // expecting { is_staff: true } or similar; adapt if different
        setIsStaff(Boolean(data.is_staff || data.staff || data.isStaff));
      } catch (err) {
        console.error("Failed to check staff status:", err);
        setIsStaff(false);
      }
    }

    checkUserStaffStatus();
  }, []);

  // Helper to update local settings state
  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Save both store details and staff/business settings (only send staff settings if isStaff)
  const handleSave = async () => {
    setLoadingSave(true);

    try {
      // 1) Update store (multipart/form-data to allow logo later)
      const storeForm = new FormData();
      storeForm.append('name', settings.storeName);
      storeForm.append('description', settings.storeDescription);
      storeForm.append('email', settings.storeEmail);
      storeForm.append('phone', settings.storePhone);
      storeForm.append('address', settings.storeAddress);

      // If you later add file upload for logo, append it here:
      // if (logoFile) storeForm.append('logo', logoFile);

      const storeRes = await fetch('/api/update_store/', {
        method: 'POST',
        headers: {
          // Note: Do NOT set Content-Type for FormData; browser will set boundary.
          "Authorization": `Token ${token}`,
        },
        body: storeForm,
        credentials: 'include'
      });

      if (!storeRes.ok) {
        const errText = await safeParseJsonOrText(storeRes);
        console.error('update_store failed', storeRes.status, errText);
        // show a simple alert/console (replace with your toast)
        alert(`Failed to update store: ${storeRes.status}`);
      } else {
        // store update succeeded
        console.log('store updated');
      }

      // 2) If staff, send store settings to storesettings endpoint (JSON)
      if (isStaff) {
        const staffPayload = {
          currency: settings.currency,
          tax_rate: settings.taxRate,
          maintenance_mode: settings.maintenanceMode,
          allow_registration: settings.allowRegistration,
          require_email_verification: settings.requireEmailVerification,
          email_notifications: settings.emailNotifications,
          order_notifications: settings.orderNotifications,
          inventory_alerts: settings.inventoryAlerts,
          auto_approve_products: settings.autoApproveProducts,
          enable_reviews: settings.enableReviews,
          enable_wishlist: settings.enableWishlist,
          enable_compare_products: settings.enableCompareProducts,
        };

        const settingsRes = await fetch('/api/storesettings/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Token ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(staffPayload),
        });

        if (!settingsRes.ok) {
          const errText = await safeParseJsonOrText(settingsRes);
          console.error('storesettings failed', settingsRes.status, errText);
          alert(`Failed to save business settings: ${settingsRes.status}`);
        } else {
          console.log('business settings saved');
        }
      }

      alert('Save completed (check console for details).');

    } catch (err) {
      console.error('Save error:', err);
      alert('An unexpected error occurred while saving.');
    } finally {
      setLoadingSave(false);
    }
  };

  // small helper to parse json or text for error debugging
  async function safeParseJsonOrText(resp: Response) {
    try {
      return await resp.json();
    } catch {
      try {
        return await resp.text();
      } catch {
        return null;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings(comming soon)
          </h1>
          <p className="text-muted-foreground mt-2">Configure your store settings and preferences</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2" disabled={loadingSave}>
          <Save className="h-4 w-4" />
          {loadingSave ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={settings.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeEmail">Contact Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={settings.storeEmail}
                onChange={(e) => handleInputChange('storeEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePhone">Phone Number</Label>
              <Input
                id="storePhone"
                value={settings.storePhone}
                onChange={(e) => handleInputChange('storePhone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress">Store Address</Label>
              <Textarea
                id="storeAddress"
                value={settings.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings — only visible to staff */}
        {isStaff && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="KES">KES - KENYAN SHILLING</option>
                    <option value="USD">USD - US DOLLAR</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange('taxRate', e.target.value)}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable the store for maintenance</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow User Registration</Label>
                      <p className="text-sm text-muted-foreground">Let new users create accounts</p>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Users must verify their email to complete registration</p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive general email notifications</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                  </div>
                  <Switch
                    checked={settings.orderNotifications}
                    onCheckedChange={(checked) => handleInputChange('orderNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alerts when products are low in stock</p>
                  </div>
                  <Switch
                    checked={settings.inventoryAlerts}
                    onCheckedChange={(checked) => handleInputChange('inventoryAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Feature Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Store Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Products</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve new products</p>
                  </div>
                  <Switch
                    checked={settings.autoApproveProducts}
                    onCheckedChange={(checked) => handleInputChange('autoApproveProducts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Reviews</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to review products</p>
                  </div>
                  <Switch
                    checked={settings.enableReviews}
                    onCheckedChange={(checked) => handleInputChange('enableReviews', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Wishlist</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to save products to wishlist</p>
                  </div>
                  <Switch
                    checked={settings.enableWishlist}
                    onCheckedChange={(checked) => handleInputChange('enableWishlist', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Product Comparison</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to compare products</p>
                  </div>
                  <Switch
                    checked={settings.enableCompareProducts}
                    onCheckedChange={(checked) => handleInputChange('enableCompareProducts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Store Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Store Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div>
                    <Button variant="outline">Upload Logo</Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommended size: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
