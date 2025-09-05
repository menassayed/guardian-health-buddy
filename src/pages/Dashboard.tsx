import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Bluetooth, User, Settings, History, Heart, Gauge, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { connected, scanning, healthData, scanForDevices, disconnect } = useBluetooth();
  const { analysis, loading: aiLoading } = useAIAnalysis(healthData);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Save health data to Firebase in real-time
  useEffect(() => {
    if (healthData && auth.currentUser) {
      const saveHealthData = async () => {
        try {
          // Save to user's health data collection
          await addDoc(collection(db, 'users', auth.currentUser!.uid, 'healthData'), {
            ...healthData,
            createdAt: new Date().toISOString()
          });

          // Also save to real-time monitoring collection
          await setDoc(doc(db, 'realTimeData', auth.currentUser!.uid), {
            ...healthData,
            lastUpdated: new Date().toISOString()
          });

          console.log('Health data saved to Firebase:', healthData);
        } catch (error) {
          console.error('Error saving health data:', error);
        }
      };

      saveHealthData();
    }
  }, [healthData]);

  const handleBluetoothConnect = async () => {
    try {
      await scanForDevices();
      toast({
        title: "Success",
        description: "Device connected successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Bluetooth Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-health-good';
      case 'medium': return 'text-health-warning';
      case 'high': return 'text-health-critical';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-primary">COPD Monitor</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bluetooth Connection Card */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bluetooth className="w-5 h-5" />
              Device Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={connected ? "default" : "secondary"}>
                  {connected ? "Connected" : "Not Connected"}
                </Badge>
                {scanning && <span className="text-sm text-muted-foreground">Scanning...</span>}
              </div>
              
              <Button
                variant="bluetooth"
                onClick={connected ? disconnect : handleBluetoothConnect}
                disabled={scanning}
              >
                {connected ? "Disconnect" : scanning ? "Scanning..." : "Connect to Bluetooth"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Health Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="w-5 h-5 text-health-critical" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {healthData?.heartRate || '--'}
                <span className="text-base font-normal text-muted-foreground ml-1">bpm</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="w-5 h-5 text-primary" />
                SpO₂
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {healthData?.spO2 || '--'}
                <span className="text-base font-normal text-muted-foreground ml-1">%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wind className="w-5 h-5 text-health-good" />
                Respiration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {healthData?.respiration || '--'}
                <span className="text-base font-normal text-muted-foreground ml-1">rpm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                AI Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Risk Level:</span>
                  <Badge 
                    variant={analysis.riskLevel === 'low' ? 'default' : 'destructive'}
                    className={getRiskColor(analysis.riskLevel)}
                  >
                    {analysis.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                
                {analysis.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Insights:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Button */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Health History</h3>
                <p className="text-muted-foreground">View your past health readings and trends</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/history')}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}