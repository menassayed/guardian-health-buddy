import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Save user profile to Firebase
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone
        },
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: '',
          dateOfBirth: '',
          address: ''
        },
        medicalInfo: {
          conditions: [],
          medications: [],
          allergies: []
        },
        emergencyPreferences: {
          autoAlert: true,
          shareLocation: true,
          shareMedicalInfo: true
        },
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">COPD Monitor</CardTitle>
          <p className="text-muted-foreground">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <div className="space-y-4 pt-2 border-t">
              <h3 className="font-semibold text-sm text-foreground">Emergency Contact</h3>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input
                  id="emergencyName"
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="medical"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                type="button"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}