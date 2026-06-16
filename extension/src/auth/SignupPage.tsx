import { useState } from 'react';
import { signUp } from '@/services/auth/firebase-auth';
import { saveLocalProfile } from '@/services/storage/indexed-db';
import { FREE_TRIAL_DAYS } from '@/types';

interface SignupPageProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const profile = await signUp(email, password, name);
      await saveLocalProfile(profile as unknown as Record<string, unknown>);
      onSignup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="text-center space-y-2">
        <div className="text-4xl">🚀</div>
        <h1 className="text-xl font-bold text-gray-900">Start Learning Free</h1>
        <p className="text-sm text-gray-500">{FREE_TRIAL_DAYS}-day free trial • No credit card needed</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your name" required />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" required />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" required />
        </div>

        {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Free Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-brand-600 font-semibold hover:underline">Login</button>
      </p>
    </div>
  );
}
