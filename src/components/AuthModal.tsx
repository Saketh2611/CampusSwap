import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginDemoUser, activeCampus, campuses } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dorm, setDorm] = useState('');
  const [gradYear, setGradYear] = useState('2026');

  useEffect(() => {
    if (isOpen) {
      const loadDemo = async () => {
        setLoadingDemo(true);
        try {
          const list = await api.auth.getDemoUsers();
          setDemoUsers(list);
        } catch (err) {
          console.error('Failed to load demo accounts:', err);
        } finally {
          setLoadingDemo(false);
        }
      };
      loadDemo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({
          name,
          email,
          password,
          dorm,
          graduationYear: Number(gradYear),
          university: activeCampus?.name || 'Stanford University',
          campus: activeCampus?.name || 'Stanford Main Campus',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDemo = async (demoId: number) => {
    setSubmitting(true);
    setError('');
    try {
      await loginDemoUser(demoId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {mode === 'login' ? 'Student Sign In' : 'Join CampusSwap'}
            </h3>
            <p className="text-xs text-slate-500">Official Hyperlocal Campus Marketplace</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-5">
          
          {/* Quick Demo Switcher Card */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Instant 1-Click Demo Student Accounts</span>
            </div>
            <p className="text-[11px] text-emerald-800 mb-3">
              Select a pre-configured student profile to test buying, selling, messaging, and reviews instantly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoUsers.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectDemo(demo.id)}
                  disabled={submitting}
                  className="p-2.5 bg-white hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left flex items-center gap-2.5 transition group"
                >
                  <img
                    src={demo.avatar}
                    alt={demo.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 truncate">
                      {demo.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{demo.university.split(' ')[0]} • ★{demo.rating}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative text-center">
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold relative z-10">Or use university email</span>
            <div className="absolute inset-0 top-1/2 border-t border-slate-200"></div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg transition ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create .EDU Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">University .EDU Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@stanford.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dorm / Hall</label>
                  <input
                    type="text"
                    value={dorm}
                    onChange={(e) => setDorm(e.target.value)}
                    placeholder="Wilbur Soto"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 mt-4"
            >
              <span>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Student Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
