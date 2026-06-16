import { useState } from 'react';
import { resetPassword } from '@/services/auth/firebase-auth';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">🔑</div>
        <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500">We'll send a reset link to your email</p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">📧</div>
          <p className="text-sm text-gray-600">Check your email for the reset link!</p>
          <button onClick={onBack} className="btn-secondary">Back to Login</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" required />
          </div>
          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={onBack} className="btn-secondary">Back to Login</button>
        </form>
      )}
    </div>
  );
}
