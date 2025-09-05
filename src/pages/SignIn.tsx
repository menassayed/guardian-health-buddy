import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({
        title: "Success",
        description: "Signed in successfully!",
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
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left">
          <div className="mx-auto lg:mx-0 w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">COPD Monitor</h1>
          <p className="text-xl text-muted-foreground mb-8">Advanced respiratory health monitoring for COPD patients</p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Real-time vital sign monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">AI-powered health analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Emergency contact system</span>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Form */}
        <Card className="w-full shadow-medical">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Patient Portal</CardTitle>
            <p className="text-muted-foreground">Connect with your wearable device for real-time monitoring</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                variant="medical"
                className="flex-1"
                disabled
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@email.com"
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

              <Button 
                type="submit" 
                className="w-full" 
                variant="medical"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In to Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}