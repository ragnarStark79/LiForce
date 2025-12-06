import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../hooks/useTheme';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const UserSettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    donationReminders: true,
    newsletterUpdates: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await userService.getSettings();
      if (data.settings) {
        setSettings({
          emailNotifications: data.settings.emailNotifications ?? true,
          smsNotifications: data.settings.smsNotifications ?? true,
          donationReminders: data.settings.donationReminders ?? true,
          newsletterUpdates: data.settings.newsletterUpdates ?? false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await userService.updateSettings({ settings });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-800">
          Settings
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <Checkbox
            name="emailNotifications"
            label="Email notifications for blood requests"
            checked={settings.emailNotifications}
            onChange={handleCheckboxChange}
          />
          <Checkbox
            name="smsNotifications"
            label="SMS notifications for urgent requests"
            checked={settings.smsNotifications}
            onChange={handleCheckboxChange}
          />
          <Checkbox
            name="donationReminders"
            label="Donation eligibility reminders"
            checked={settings.donationReminders}
            onChange={handleCheckboxChange}
          />
          <Checkbox
            name="newsletterUpdates"
            label="Newsletter and platform updates"
            checked={settings.newsletterUpdates}
            onChange={handleCheckboxChange}
          />
        </div>
        <div className="mt-6">
          <Button variant="primary" onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Theme</p>
            <p className="text-sm text-neutral-600 mt-1">
              Choose your preferred theme
            </p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </Button>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-neutral-800 mb-2">Change Password</p>
            <Button variant="secondary">Update Password</Button>
          </div>
          <div>
            <p className="font-medium text-neutral-800 mb-2">Two-Factor Authentication</p>
            <Button variant="secondary">Enable 2FA</Button>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Account Management
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-neutral-800 mb-2">Download Your Data</p>
            <p className="text-sm text-neutral-600 mb-3">
              Export all your data including donations and requests
            </p>
            <Button variant="secondary">Download Data</Button>
          </div>
          <div className="pt-4 border-t border-neutral-100">
            <p className="font-medium text-danger-600 mb-2">Deactivate Account</p>
            <p className="text-sm text-neutral-600 mb-3">
              Temporarily deactivate your account
            </p>
            <Button variant="danger">Deactivate Account</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserSettingsPage;
