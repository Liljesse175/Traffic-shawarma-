import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Lock, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface AdminLoginProps {
  onLogin: (token: string, username: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-316989a5/admin/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          setLockedUntil(data.lockedUntil);
          throw new Error(data.error || 'Account locked due to too many failed attempts');
        }
        
        // Handle failed login with remaining attempts
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        
        throw new Error(data.error || 'Login failed');
      }

      // Clear rate limit state on success
      setRemainingAttempts(null);
      setLockedUntil(null);
      
      toast.success('Login successful!');
      onLogin(data.token, data.username);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate remaining lockout time
  const getLockoutTime = () => {
    if (!lockedUntil) return '';
    const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-4">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="font-poppins font-bold text-3xl mb-2 text-white">
            Admin <span className="text-orange-500">Login</span>
          </h1>
          <p className="font-inter text-zinc-400">Traffic Shawarma Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          {/* Rate Limiting Warning */}
          {lockedUntil && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-poppins font-semibold text-red-500 mb-1">Account Locked</p>
                  <p className="font-inter text-sm text-red-400">
                    Too many failed login attempts. Please try again in {getLockoutTime()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Attempts Warning */}
          {!lockedUntil && remainingAttempts !== null && remainingAttempts <= 3 && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="font-inter text-sm text-yellow-400">
                  <span className="font-semibold">{remainingAttempts}</span> login attempt{remainingAttempts !== 1 ? 's' : ''} remaining before account lockout.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Label htmlFor="username" className="font-inter text-sm text-zinc-300 mb-2 block">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={isLoading || !!lockedUntil}
              />
            </div>

            <div>
              <Label htmlFor="password" className="font-inter text-sm text-zinc-300 mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={isLoading || !!lockedUntil}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !!lockedUntil}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold py-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : lockedUntil ? 'Account Locked' : 'Login'}
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-center text-sm text-zinc-500 font-inter">
              Default credentials: <span className="text-zinc-400 font-semibold">admin</span> / <span className="text-zinc-400 font-semibold">traffic_hills</span>
            </p>
            <div className="text-center text-xs text-zinc-600 font-inter border-t border-zinc-800 pt-4">
              <p className="mb-1">🔒 <span className="font-semibold">Enhanced Security:</span></p>
              <ul className="space-y-1 text-left inline-block">
                <li>• Password hashing with SHA-256</li>
                <li>• 5 login attempts per 5 minutes</li>
                <li>• 15-minute lockout after max attempts</li>
                <li>• 24-hour session with 2-hour timeout</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}