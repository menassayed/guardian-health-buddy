import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Gauge, Wind, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HealthRecord {
  id: string;
  heartRate: number;
  spO2: number;
  respiration: number;
  timestamp: number;
  createdAt: string;
}

interface HealthStats {
  avgHeartRate: number;
  avgSpO2: number;
  avgRespiration: number;
  lastCheck: string;
  totalReadings: number;
}

export default function History() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHealthHistory();
  }, []);

  const loadHealthHistory = async () => {
    if (!auth.currentUser) return;

    try {
      const healthDataRef = collection(db, 'users', auth.currentUser.uid, 'healthData');
      
      // Get recent readings (last 50)
      const recentQuery = query(
        healthDataRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(recentQuery);
      const healthRecords: HealthRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        healthRecords.push({
          id: doc.id,
          heartRate: data.heartRate,
          spO2: data.spO2,
          respiration: data.respiration,
          timestamp: data.timestamp,
          createdAt: data.createdAt
        });
      });

      setRecords(healthRecords);

      // Calculate statistics
      if (healthRecords.length > 0) {
        const avgHeartRate = Math.round(
          healthRecords.reduce((sum, record) => sum + record.heartRate, 0) / healthRecords.length
        );
        const avgSpO2 = Math.round(
          healthRecords.reduce((sum, record) => sum + record.spO2, 0) / healthRecords.length
        );
        const avgRespiration = Math.round(
          healthRecords.reduce((sum, record) => sum + record.respiration, 0) / healthRecords.length
        );
        
        setStats({
          avgHeartRate,
          avgSpO2,
          avgRespiration,
          lastCheck: healthRecords[0].createdAt,
          totalReadings: healthRecords.length
        });
      }
    } catch (error) {
      console.error('Error loading health history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVitalStatus = (type: 'heartRate' | 'spO2' | 'respiration', value: number) => {
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'warning';
        return 'normal';
      case 'spO2':
        if (value < 95) return 'critical';
        if (value < 98) return 'warning';
        return 'normal';
      case 'respiration':
        if (value < 12 || value > 20) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-health-critical text-white';
      case 'warning': return 'bg-health-warning text-white';
      case 'normal': return 'bg-health-good text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading health history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Health History</h1>
          <p className="text-muted-foreground">Review your past health readings and trends</p>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="w-5 h-5 text-health-critical" />
                  Avg. Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stats.avgHeartRate}
                  <span className="text-base font-normal text-muted-foreground ml-1">bpm</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="w-5 h-5 text-primary" />
                  Avg. SpO₂
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stats.avgSpO2}
                  <span className="text-base font-normal text-muted-foreground ml-1">%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wind className="w-5 h-5 text-health-good" />
                  Avg. Respiration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stats.avgRespiration}
                  <span className="text-base font-normal text-muted-foreground ml-1">rpm</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  Last Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-foreground">
                  {formatDateTime(stats.lastCheck)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.totalReadings} total readings
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Readings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Health Readings</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No health data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect your device to start monitoring your health.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-sm text-muted-foreground min-w-[140px]">
                        {formatDateTime(record.createdAt)}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-health-critical" />
                          <span className="font-medium">{record.heartRate}</span>
                          <span className="text-xs text-muted-foreground">bpm</span>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(getVitalStatus('heartRate', record.heartRate))}
                          >
                            {getVitalStatus('heartRate', record.heartRate)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-primary" />
                          <span className="font-medium">{record.spO2}</span>
                          <span className="text-xs text-muted-foreground">%</span>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(getVitalStatus('spO2', record.spO2))}
                          >
                            {getVitalStatus('spO2', record.spO2)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-health-good" />
                          <span className="font-medium">{record.respiration}</span>
                          <span className="text-xs text-muted-foreground">rpm</span>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(getVitalStatus('respiration', record.respiration))}
                          >
                            {getVitalStatus('respiration', record.respiration)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}