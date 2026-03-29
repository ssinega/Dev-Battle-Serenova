import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AnonRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const handleAnonSignup = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.registerAnonymous();
      loginAction(res.user, res.accessToken);
      toast.success(`Anonymous alias created: ${res.user.username}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to create anonymous account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-base relative">
      <Card className="w-full max-w-md relative z-10 glass-panel border-accent-primary/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(108,99,255,0.1)]">
        
        <Link to="/login" className="absolute top-4 left-4 p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-elevated transition-colors">
          <ArrowLeft size={20} />
        </Link>
        
        <CardHeader className="text-center pt-10 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-elevated border border-border shadow-md mb-4">
            <span className="text-4xl">🕵️</span>
          </div>
          <CardTitle className="text-2xl font-display font-bold text-text-primary tracking-wide">
            Anonymous Mode
          </CardTitle>
          <p className="text-text-muted text-sm mt-2 font-medium">100% Private. No Email Required.</p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          
          <div className="bg-bg-surface border border-border rounded-xl p-4 text-sm text-text-secondary text-left space-y-3">
            <p className="flex gap-2"><span className="text-accent-green">✓</span> We will generate a random alias for you.</p>
            <p className="flex gap-2"><span className="text-accent-green">✓</span> Your journal and messages are still E2E encrypted.</p>
            <p className="flex gap-2"><span className="text-accent-green">✓</span> You can book anonymous text/voice sessions.</p>
            <div className="flex items-start gap-2 pt-2 border-t border-border mt-2 text-accent-amber pl-1">
               <ShieldAlert size={16} className="shrink-0 mt-0.5" />
               <span>Warning: If you log out or clear your browser data, you will permanently lose access to this identity. You can link an email later in Settings if desired.</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleAnonSignup}
            isLoading={isLoading}
          >
            Generate Identity & Continue
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
