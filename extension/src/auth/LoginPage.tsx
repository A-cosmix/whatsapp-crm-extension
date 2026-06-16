import { useState } from 'react';
import { signIn } from '@/services/auth/firebase-auth';
import { saveLocalProfile } from '@/services/storage/indexed-db';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignup, onSwitchToForgot }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await signIn(email, password);
      await saveLocalProfile(profile as unknown as Record<string, unknown>);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">💬</div>
        <h1 className="text-xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-sm text-gray-500">Login to continue simplifying the internet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" required />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
        </div>

        {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-center space-y-2">
        <button onClick={onSwitchToForgot} className="text-sm text-brand-600 hover:underline">Forgot password?</button>
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-brand-600 font-semibold hover:underline">Sign up free</button>
        </p>
      </div>
    </div>
  );
}
