'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export default function SignInPage() {
  const { user, login } = useAuthStore();
  const router = useRouter();

  // Auth Form State
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const authSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address structure.');
      return;
    }

    // Aggressive domain typo catching
    const domain = email.split('@')[1]?.toLowerCase();

    // Block anything resembling gmail that isn't exactly gmail.com
    if (domain !== 'gmail.com' && (domain.includes('gmai') || domain.includes('gamil') || domain.includes('gmal') || domain.includes('gma.') || domain === 'gmail.co' || domain === 'gmail.con')) {
      toast.error(`Invalid Domain: Did you mean @gmail.com?`);
      return;
    }
    // Block anything resembling yahoo that isn't exactly yahoo.com
    if (domain !== 'yahoo.com' && (domain.includes('yaho.') || domain.includes('yahoo.ca') || domain.includes('yahoo.co') && domain !== 'yahoo.com')) {
      toast.error(`Invalid Domain: Did you mean @yahoo.com?`);
      return;
    }
    // Block anything resembling hotmail that isn't exactly hotmail.com
    if (domain !== 'hotmail.com' && (domain.includes('hotmal') || domain.includes('hotmai.') || domain === 'hotmail.co')) {
      toast.error(`Invalid Domain: Did you mean @hotmail.com?`);
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginView) {
        const { data } = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users/login', { email, password });
        
        if (data.role === 'ADMIN') {
          toast.error('Admin restricted: Please use the official Admin Portal (/login).');
          setIsLoading(false);
          return;
        }

        login(data);
        toast.success('Successfully deployed back to Command Center.');
        router.push('/profile');
      } else {
        const { data } = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users', { name, email, password });
        login(data);
        toast.success(`Account created successfully! Welcome, ${data.name}.`);
        router.push('/profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication sequence failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-[50px] -z-10" />
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {isLoginView ? 'Buyer Portal' : 'Join the Matrix'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            {isLoginView ? 'Access your command center and orders.' : 'Create your buyer profile instantly.'}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={authSubmitHandler}>
          <AnimatePresence mode="wait">
            {!isLoginView && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  required={!isLoginView}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
                  placeholder="John Doe"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
              placeholder="buyer@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 text-background font-black uppercase tracking-widest rounded-xl transition-all shadow-lg ${isLoginView ? 'bg-cyan-400 hover:bg-cyan-300 hover:shadow-cyan-400/20' : 'bg-purple-400 hover:bg-purple-300 hover:shadow-purple-400/20'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : (isLoginView ? 'Secure Sign In' : 'Establish Profile')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground pt-4 border-t border-white/10 mt-6 pt-6">
          {isLoginView ? "Don't have a profile yet?" : "Already established a link?"}
          <button
            type="button"
            onClick={() => setIsLoginView(!isLoginView)}
            className="ml-2 font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-all"
          >
            {isLoginView ? 'Sign up here' : 'Sign in here'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
