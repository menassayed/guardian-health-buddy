import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { User, Heart, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
  };
  medicalInfo: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  emergencyPreferences: {
    autoAlert: boolean;
    shareLocation: boolean;
    shareMedicalInfo: boolean;
  };
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: ''
    },
    medicalInfo: {
      conditions: [],
      medications: [],
      allergies: []
    },
    emergencyContact: {
      name: '',
      phone: ''
    },
    emergencyPreferences: {
      autoAlert: true,
      shareLocation: true,
      shareMedicalInfo: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!auth.currentUser) return;
    
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          personalInfo: data.personalInfo || profile.personalInfo,
          medicalInfo: data.medicalInfo || profile.medicalInfo,
          emergencyContact: data.emergencyContact || profile.emergencyContact,
          emergencyPreferences: data.emergencyPreferences || profile.emergencyPreferences
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        personalInfo: profile.personalInfo,
        medicalInfo: profile.medicalInfo,
        emergencyContact: profile.emergencyContact,
        emergencyPreferences: profile.emergencyPreferences,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateEmergencyContact = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };

  const updateEmergencyPreference = (field: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      emergencyPreferences: { ...prev.emergencyPreferences, [field]: value }
    }));
  };

  const updateMedicalArray = (field: 'conditions' | 'medications' | 'allergies', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setProfile(prev => ({
      ...prev,
      medicalInfo: { ...prev.medicalInfo, [field]: items }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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
            
            <Button
              variant="medical"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal, medical, and emergency information</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="gap-2">
              <User className="w-4 h-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="medical" className="gap-2">
              <Heart className="w-4 h-4" />
              Medical
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-2">
              <Phone className="w-4 h-4" />
              Emergency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.personalInfo.dateOfBirth}
                      onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.personalInfo.address}
                    onChange={(e) => updatePersonalInfo('address', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Textarea
                    id="conditions"
                    placeholder="Enter conditions separated by commas (e.g., COPD, Hypertension, Diabetes)"
                    value={profile.medicalInfo.conditions.join(', ')}
                    onChange={(e) => updateMedicalArray('conditions', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="Enter medications separated by commas (e.g., Albuterol, Prednisone)"
                    value={profile.medicalInfo.medications.join(', ')}
                    onChange={(e) => updateMedicalArray('medications', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="Enter allergies separated by commas (e.g., Penicillin, Peanuts)"
                    value={profile.medicalInfo.allergies.join(', ')}
                    onChange={(e) => updateMedicalArray('allergies', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Emergency Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Contact Name</Label>
                      <Input
                        id="emergencyName"
                        value={profile.emergencyContact.name}
                        onChange={(e) => updateEmergencyContact('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={profile.emergencyContact.phone}
                        onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoAlert"
                        checked={profile.emergencyPreferences.autoAlert}
                        onCheckedChange={(checked) => updateEmergencyPreference('autoAlert', checked as boolean)}
                      />
                      <Label htmlFor="autoAlert">Auto-alert emergency contact during critical events</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shareLocation"
                        checked={profile.emergencyPreferences.shareLocation}
                        onCheckedChange={(checked) => updateEmergencyPreference('shareLocation', checked as boolean)}
                      />
                      <Label htmlFor="shareLocation">Share location during emergency</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shareMedicalInfo"
                        checked={profile.emergencyPreferences.shareMedicalInfo}
                        onCheckedChange={(checked) => updateEmergencyPreference('shareMedicalInfo', checked as boolean)}
                      />
                      <Label htmlFor="shareMedicalInfo">Share medical information with responders</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}