import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import toast from 'react-hot-toast';

import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(2, "Username is too short"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function LoginPage() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  // Forms
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  const onLogin = async (data) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data);
      loginAction(res.user, res.accessToken);
      
      if (res.user.two_fa_enabled) {
        // Simple bypass for demo: just proceed. Real app would redirect to 2FA verify page
        toast.success(`Welcome back, ${res.user.username}`);
        navigate('/dashboard');
      } else {
        toast.success(`Welcome back, ${res.user.username}`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data) => {
    setIsLoading(true);
    try {
      const { email, password, username } = data;
      await authApi.register({ email, password, username });
      toast.success('Registration successful. Please login.');
      setIsLoginTab(true);
      loginForm.setValue('email', email);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-bg-base relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent-blue/20 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 glass-panel border-white/5 backdrop-blur-2xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex justify-center">
            <img 
              src="/serenova-logo.png" 
              alt="Serenova Logo" 
              className="h-28 w-auto object-contain drop-shadow-xl"
            />
          </div>
          <p className="text-text-muted text-sm -mt-2">Your secure mental wellness companion</p>
        </CardHeader>

        <CardContent>
          {/* Tabs */}
          <div className="flex p-1 mb-8 rounded-xl bg-bg-elevated border border-border">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isLoginTab ? 'bg-bg-card shadow-md text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setIsLoginTab(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isLoginTab ? 'bg-bg-card shadow-md text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setIsLoginTab(false)}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLoginTab ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />
                
                <div className="space-y-1">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    error={loginForm.formState.errors.password?.message}
                  />
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-accent-primary hover:underline" onClick={() => toast("Forgot password flow not mocked in client demo", { icon: '🚧' })}>
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                  Sign In
                </Button>

                {/* Auto-fill dev helpers */}
                <div className="pt-4 border-t border-border mt-6 text-center text-xs text-text-muted space-y-2">
                  <p>Demo Accounts:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" className="underline hover:text-text-primary" 
                      onClick={() => { loginForm.setValue('email', 'patient@demo.com'); loginForm.setValue('password', 'Demo@1234'); }}>
                      Set Patient
                    </button>
                    <span>|</span>
                    <button type="button" className="underline hover:text-text-primary" 
                      onClick={() => { loginForm.setValue('email', 'therapist@demo.com'); loginForm.setValue('password', 'Demo@1234'); }}>
                      Set Therapist
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4"
              >
                <Input
                  label="Display Name"
                  type="text"
                  placeholder="How should we call you?"
                  {...registerForm.register('username')}
                  error={registerForm.formState.errors.username?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  {...registerForm.register('email')}
                  error={registerForm.formState.errors.email?.message}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register('password')}
                  error={registerForm.formState.errors.password?.message}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register('confirmPassword')}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />

                <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                  Create Account
                </Button>

                <div className="mt-4 text-center">
                  <Link 
                    to="/register/anonymous" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors border border-border px-4 py-2 rounded-lg bg-bg-surface hover:bg-bg-elevated w-full justify-center"
                  >
                   <span className="text-xl">🕵️</span> Register Anonymously
                  </Link>
                  <p className="text-[10px] text-text-muted mt-2">No email. No tracking. Complete privacy.</p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* HIPAA / E2E Badge */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center text-xs font-semibold text-text-muted gap-4 uppercase tracking-widest z-0">
        <span className="flex items-center gap-1">🔒 E2E Encrypted</span>
        <span className="flex items-center gap-1">🛡️ HIPAA Aligned</span>
      </div>
    </div>
  );
}
