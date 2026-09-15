'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { X, Terminal, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { status } = useSession();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetFeedback = () => {
    setError(null);
    setInfoMessage(null);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetFeedback();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetFeedback();
    setPassword('');
    onClose();
  };

  const handleForgotPassword = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      // Deliberately identical messaging whether or not the account exists —
      // matches the backend's intentional non-disclosure.
      setInfoMessage(body.message || 'If that email has an account, a reset link has been sent.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (mode === 'forgot') {
      await handleForgotPassword();
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Could not create account.');
          setIsSubmitting(false);
          return;
        }
        // Registration succeeded — immediately sign them in with the same credentials.
      }

      const result = await signIn('credentials', { email, password, redirect: false });

      if (result?.error) {
        setError('Incorrect email or password.');
        setIsSubmitting(false);
        return;
      }

      // Success — clear fields; the parent's useSession() picking up
      // 'authenticated' is what actually closes this modal.
      setEmail('');
      setPassword('');
      setName('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
      setIsSubmitting(false);
    }
  };

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create your account' : 'Reset password';
  const subtitle =
    mode === 'signin'
      ? 'Access your RemoteVM workspace.'
      : mode === 'signup'
      ? 'Open to everyone — no invite required.'
      : "We'll email you a link to reset it.";
  const submitLabel = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="auth-modal"
        className="relative w-full max-w-sm rounded-2xl border border-zinc-700/90 bg-zinc-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-zinc-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Name</label>
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || status === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitLabel}</span>
          </button>

          <div className="pt-1 text-center text-xs text-zinc-400">
            {mode === 'signin' && (
              <span>
                Need an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Sign up
                </button>
              </span>
            )}
            {mode === 'signup' && (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Sign in
                </button>
              </span>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => switchMode('signin')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
