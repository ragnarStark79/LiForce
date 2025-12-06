import Card from '../../components/common/Card';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import { useTheme } from '../../hooks/useTheme';

const AdminSettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  // TODO: Fetch system settings from API
  // TODO: Save settings to backend
  // TODO: Configure blood request rules and thresholds

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-800">
          System Settings
        </h1>
        <p className="text-neutral-600 mt-2">
          Configure hospital and system preferences
        </p>
      </div>

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

      {/* Blood Request Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Blood Request Configuration
        </h3>
        <div className="space-y-4">
          <Checkbox
            name="autoAssign"
            label="Auto-assign requests to available staff"
            checked={false}
          />
          <Checkbox
            name="criticalAlerts"
            label="Send alerts for critical requests"
            checked={true}
          />
          <Checkbox
            name="lowStockWarnings"
            label="Enable low stock warnings"
            checked={true}
          />
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Notifications
        </h3>
        <div className="space-y-4">
          <Checkbox
            name="emailNotifications"
            label="Email notifications for critical events"
            checked={true}
          />
          <Checkbox
            name="smsNotifications"
            label="SMS notifications for urgent requests"
            checked={false}
          />
          <Checkbox
            name="staffApprovalNotify"
            label="Notify staff upon approval"
            checked={true}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
