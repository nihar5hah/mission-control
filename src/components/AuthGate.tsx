'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Command, ArrowLeft, Loader2, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [mode, setMode] = useState<'select' | 'admin-login'>('select');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || submitting) return;

    setError('');
    setSubmitting(true);

    const result = await login('admin', password);

    if (!result.success) {
      setError(result.error || 'Invalid password');
      setSubmitting(false);
    }
  };

  const handleViewerLogin = async () => {
    await login('viewer');
  };

  // Loading state — check sessionStorage
  if (isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--gradient-metallic)',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.1)',
              border: '0.5px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Command className="w-6 h-6 text-black" />
            </motion.div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Loading...
          </p>
        </motion.div>
      </div>
    );
  }

  // Already authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Login screen
  return (
    <div
      className="flex h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 600px 400px at 50% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'var(--gradient-metallic)',
              boxShadow: '0 8px 30px rgba(255, 255, 255, 0.1)',
              border: '0.5px solid rgba(255, 255, 255, 0.2)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Command className="w-8 h-8 text-black" />
            </motion.div>
          </motion.div>

          <h1
            className="text-2xl font-bold text-gradient-metallic mb-1"
            style={{ letterSpacing: '-0.02em' }}
          >
            Nihar's Mission Control
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            AI Agent Operations Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="apple-card p-6">
          <AnimatePresence mode="wait">
            {mode === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Select Access Mode
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Choose how you'd like to access the dashboard
                </p>

                <div className="space-y-3">
                  {/* Admin Button */}
                  <motion.button
                    onClick={() => {
                      setMode('admin-login');
                      setError('');
                      setPassword('');
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '0.5px solid var(--border)',
                    }}
                    whileHover={{
                      scale: 1.01,
                      borderColor: 'var(--border-hover)',
                    }}
                    whileTap={{ scale: 0.99 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.background = 'var(--bg-overlay)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'var(--color-blue-muted)',
                        border: '0.5px solid rgba(10, 132, 255, 0.2)',
                      }}
                    >
                      <Shield
                        className="w-5 h-5"
                        style={{ color: 'var(--color-blue)' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Admin Access
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Full control — requires password
                      </div>
                    </div>
                    <ArrowLeft
                      className="w-4 h-4 rotate-180 flex-shrink-0"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </motion.button>

                  {/* Viewer Button */}
                  <motion.button
                    onClick={handleViewerLogin}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '0.5px solid var(--border)',
                    }}
                    whileHover={{
                      scale: 1.01,
                      borderColor: 'var(--border-hover)',
                    }}
                    whileTap={{ scale: 0.99 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.background = 'var(--bg-overlay)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'var(--color-green-muted)',
                        border: '0.5px solid rgba(48, 209, 88, 0.2)',
                      }}
                    >
                      <Eye
                        className="w-5 h-5"
                        style={{ color: 'var(--color-green)' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        View Only
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Browse the dashboard — no password needed
                      </div>
                    </div>
                    <ArrowLeft
                      className="w-4 h-4 rotate-180 flex-shrink-0"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admin-login"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Back button */}
                <motion.button
                  onClick={() => {
                    setMode('select');
                    setError('');
                    setPassword('');
                  }}
                  className="flex items-center gap-1.5 mb-5 text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  whileHover={{ x: -2 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </motion.button>

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'var(--color-blue-muted)',
                      border: '0.5px solid rgba(10, 132, 255, 0.2)',
                    }}
                  >
                    <Lock
                      className="w-5 h-5"
                      style={{ color: 'var(--color-blue)' }}
                    />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Admin Login
                    </h2>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Enter your password to continue
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter admin password"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl text-sm"
                      style={{
                        background: 'var(--bg-input)',
                        border: error
                          ? '1px solid var(--color-red)'
                          : '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        if (!error) {
                          e.currentTarget.style.borderColor = 'var(--border-focus)';
                          e.currentTarget.style.boxShadow =
                            '0 0 0 3px var(--accent-glow)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!error) {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    />

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-1.5 mt-2"
                        >
                          <AlertCircle
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: 'var(--color-red)' }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: 'var(--color-red)' }}
                          >
                            {error}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting || !password.trim()}
                    className="btn-apple-primary w-full py-3 flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          style={{ color: 'var(--bg-base)' }}
                        />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--text-tertiary)' }}
        >
          View mode lets you explore the dashboard without making changes
        </p>
      </motion.div>
    </div>
  );
}
