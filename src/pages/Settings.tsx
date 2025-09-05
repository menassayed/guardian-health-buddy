import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your app preferences and configurations</p>
        </div>

        {/* Appearance Settings */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Settings */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Device & Connectivity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Bluetooth Auto-Connect
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically connect to previously paired devices
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Data Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sync health data to Firebase in real-time
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Health Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your vitals are outside normal ranges
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Emergency Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send emergency alerts to your emergency contact
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  AI Insights
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive AI-powered health analysis and recommendations
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Data Encryption
                </Label>
                <p className="text-sm text-muted-foreground">
                  All health data is encrypted before storage
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Anonymous Analytics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app by sharing anonymous usage data
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>App Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs">
                  COPD Monitor helps you track your respiratory health in real-time 
                  with AI-powered insights and emergency response capabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}