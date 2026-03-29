import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FullPageSpinner } from '../components/ui/Spinner';
import { ShieldCheck, Copy, ArrowRight, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TwoFAPage() {
  const { updateUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    init2FA();
  }, []);

  const init2FA = async () => {
    try {
      setLoading(true);
      const res = await authApi.enable2FA();
      setSetupData(res);
    } catch (err) {
      toast.error('Failed to initialize 2FA setup');
      navigate('/settings');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token || token.length < 6) return;
    
    setVerifying(true);
    try {
      await authApi.verify2FA({ token });
      toast.success('2FA enabled successfully!');
      updateUser({ two_fa_enabled: true });
      navigate('/settings');
    } catch (err) {
      toast.error('Invalid code. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(setupData.secret);
    toast.success('Secret copied to clipboard');
  };

  if (loading || !setupData) return <FullPageSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-10 mt-8">
      
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-accent-primary/10 rounded-full flex items-center justify-center border-4 border-accent-primary/20 shadow-lg shadow-accent-primary/20">
          <ShieldCheck size={40} className="text-accent-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Secure Your Account</h1>
        <p className="text-text-secondary text-lg font-medium max-w-md mx-auto">
          Add an extra layer of defense to keep your health data private and encrypted.
        </p>
      </div>

      <Card className="border-accent-primary/20 bg-bg-surface overflow-hidden">
        <div className="bg-accent-primary/5 p-6 border-b border-border text-center flex flex-col items-center">
           <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4"><Smartphone size={18} /> 1. Scan the QR Code</h3>
           <div className="bg-white p-4 rounded-xl shadow-md inline-block">
             <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
           </div>
           <p className="text-sm text-text-muted mt-4 max-w-sm">Open your authenticator app (Google Authenticator, Authy, etc.) and scan this code.</p>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Can't scan the QR code?</h3>
            <div className="flex bg-bg-elevated border border-border rounded-lg overflow-hidden">
              <div className="flex-1 p-3 text-sm font-mono tracking-widest text-text-primary flex items-center justify-center bg-bg-base/50">
                {setupData.secret}
              </div>
              <button onClick={handleCopy} className="px-4 bg-bg-surface hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors border-l border-border flex items-center gap-2 font-medium text-sm">
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold text-text-primary mb-4">2. Enter the generated code</h3>
            <form onSubmit={handleVerify} className="flex gap-4 items-end">
               <div className="flex-1">
                 <Input 
                   type="text" 
                   placeholder="000000" 
                   value={token}
                   onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                   className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                   maxLength={6}
                   required
                 />
               </div>
               <Button type="submit" size="lg" className="h-14 px-8 text-base shadow-lg shadow-accent-primary/25" isLoading={verifying} disabled={token.length < 6}>
                 Verify <ArrowRight size={18} className="ml-2" />
               </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
