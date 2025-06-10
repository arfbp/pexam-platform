import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface LoginFormProps {
  onLogin: (user: {
    id: string;
    username: string;
    role: string;
  }) => void;
}
const LoginForm = ({
  onLogin
}: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return btoa(hashHex);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Hash the input password
      const hashedPassword = await hashPassword(password);

      // Query the users table to check credentials
      const {
        data: users,
        error
      } = await supabase.from('users').select('*').eq('username', username).eq('password_hash', hashedPassword);
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: "An error occurred during login",
          variant: "destructive"
        });
        return;
      }
      if (!users || users.length === 0) {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
        return;
      }
      const user = users[0];

      // All users are now admin by default
      onLogin({
        id: user.id.toString(),
        username: user.username,
        role: 'admin'
      });
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) {
        toast({
          title: "Google login failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during Google login",
        variant: "destructive"
      });
    }
  };

  // Check for Google OAuth session on component mount
  React.useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Create or get user profile for Google users
        const googleUser = session.user;
        onLogin({
          id: googleUser.id,
          username: googleUser.email || 'Google User',
          role: 'admin' // All Google users are admin by default
        });
        toast({
          title: "Login successful",
          description: `Welcome, ${googleUser.email}!`
        });
      }
    };
    checkSession();

    // Listen for auth state changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const googleUser = session.user;
        onLogin({
          id: googleUser.id,
          username: googleUser.email || 'Google User',
          role: 'admin'
        });
        toast({
          title: "Login successful",
          description: `Welcome, ${googleUser.email}!`
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [onLogin, toast]);
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Exam Platform</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Login Button */}
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Local Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </div>;
};
export default LoginForm;