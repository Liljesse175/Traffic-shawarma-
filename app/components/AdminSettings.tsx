import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Store, Phone, MapPin, Clock, DollarSign, Instagram, Facebook, Twitter, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi } from '@/utils/api';

interface Settings {
  restaurantName: string;
  whatsappNumber: string;
  phone: string;
  address: string;
  openingHours: string;
  deliveryFee: number;
  minimumOrder?: number;
  isOpen: boolean;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    restaurantName: 'TRAFFIC SHAWARMA',
    whatsappNumber: '+233200172160',
    phone: '+233246801890',
    address: 'Madina Junction, Near Total Filling Station, Accra',
    openingHours: 'Mon-Sat: 10:00 AM - 10:00 PM, Sun: 12:00 PM - 9:00 PM',
    deliveryFee: 10,
    minimumOrder: 20,
    isOpen: true,
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Settings] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setHasChanges(false);
    toast.info('Settings reset to saved values');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-inter text-zinc-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-zinc-900 mb-1">
            Restaurant Settings
          </h1>
          <p className="font-inter text-sm text-zinc-600">
            Manage your restaurant information and preferences
          </p>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-inter"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Restaurant Status */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-lg text-zinc-900">Restaurant Status</h3>
                <p className="font-inter text-sm text-zinc-600">
                  {settings.isOpen ? 'Currently accepting orders' : 'Currently closed for orders'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleChange('isOpen', !settings.isOpen)}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                settings.isOpen ? 'bg-green-500' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                  settings.isOpen ? 'translate-x-11' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-zinc-900">Basic Information</h3>
          </div>

          <div className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <Label htmlFor="restaurantName" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                Restaurant Name
              </Label>
              <Input
                id="restaurantName"
                value={settings.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900"
                placeholder="e.g., Traffic Shawarma"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900 resize-none"
                rows={2}
                placeholder="Full restaurant address"
              />
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900"
                  placeholder="+233 24 680 189"
                />
              </div>

              <div>
                <Label htmlFor="whatsappNumber" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900"
                  placeholder="+233 20 017 216"
                />
                <p className="text-xs text-zinc-500 mt-1 font-inter">
                  Used for WhatsApp ordering
                </p>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <Label htmlFor="openingHours" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Opening Hours
              </Label>
              <Textarea
                id="openingHours"
                value={settings.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900 resize-none"
                rows={2}
                placeholder="Mon-Sat: 10:00 AM - 10:00 PM"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Pricing */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-zinc-900">Delivery & Pricing</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Delivery Fee */}
            <div>
              <Label htmlFor="deliveryFee" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                Delivery Fee (GH₵)
              </Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', parseFloat(e.target.value) || 0)}
                className="bg-white border-zinc-300 text-zinc-900"
                placeholder="10.00"
              />
              <p className="text-xs text-zinc-500 mt-1 font-inter">
                Standard delivery charge
              </p>
            </div>

            {/* Minimum Order */}
            <div>
              <Label htmlFor="minimumOrder" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                Minimum Order (GH₵)
              </Label>
              <Input
                id="minimumOrder"
                type="number"
                step="0.01"
                value={settings.minimumOrder || 0}
                onChange={(e) => handleChange('minimumOrder', parseFloat(e.target.value) || 0)}
                className="bg-white border-zinc-300 text-zinc-900"
                placeholder="20.00"
              />
              <p className="text-xs text-zinc-500 mt-1 font-inter">
                Minimum order value required
              </p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-zinc-900">Social Media</h3>
          </div>

          <div className="space-y-5">
            {/* Instagram */}
            <div>
              <Label htmlFor="instagram" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={settings.socialMedia.instagram}
                onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900"
                placeholder="https://instagram.com/trafficshawarma"
              />
            </div>

            {/* Facebook */}
            <div>
              <Label htmlFor="facebook" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                <Facebook className="w-4 h-4 inline mr-1" />
                Facebook
              </Label>
              <Input
                id="facebook"
                value={settings.socialMedia.facebook}
                onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900"
                placeholder="https://facebook.com/trafficshawarma"
              />
            </div>

            {/* Twitter */}
            <div>
              <Label htmlFor="twitter" className="font-inter text-sm font-semibold text-zinc-700 mb-2 block">
                <Twitter className="w-4 h-4 inline mr-1" />
                Twitter / X
              </Label>
              <Input
                id="twitter"
                value={settings.socialMedia.twitter}
                onChange={(e) => handleChange('socialMedia.twitter', e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900"
                placeholder="https://twitter.com/trafficshawarma"
              />
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-inter text-sm text-blue-800">
            💡 <strong>Tip:</strong> Changes will take effect immediately after saving. Make sure to test your WhatsApp number and social media links to ensure they work correctly.
          </p>
        </div>

        {/* Bottom Save Button (for mobile convenience) */}
        {hasChanges && (
          <div className="flex gap-2 sm:hidden">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-inter"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
