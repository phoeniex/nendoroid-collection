import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader } from 'lucide-react';

export function AuthModal({ onClose, auth }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const { error: err } = mode === 'signin'
      ? await auth.signIn(email, password)
      : await auth.signUp(email, password);

    setLoading(false);

    if (err) {
      setError(err.message);
    } else if (mode === 'signup') {
      setInfo('Check your email to confirm your account, then sign in.');
      setMode('signin');
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="glass-panel w-full max-w-sm p-8 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <h2 className="text-2xl font-black text-gradient mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            {mode === 'signin' ? 'Sign in to sync your collection.' : 'Sign up to save your collection across devices.'}
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input w-full pl-10 glass-panel focus:outline-none focus:border-accent/50 !rounded-xl placeholder:text-zinc-600 text-white"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input w-full pl-10 glass-panel focus:outline-none focus:border-accent/50 !rounded-xl placeholder:text-zinc-600 text-white"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {info && <p className="text-green-400 text-sm">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn bg-gradient-modern border-none text-white shadow-lg shadow-accent/20 rounded-xl w-full"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-zinc-500 text-sm text-center mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
              className="text-accent hover:text-white transition-colors font-medium"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
