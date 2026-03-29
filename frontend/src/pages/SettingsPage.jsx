import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi, usersApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Download, ShieldCheck, Mail, Key, EyeOff, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, incognitoMode, setIncognito, updateUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleExport = async () => {
    try {
      const blob = await usersApi.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serenova-export-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Journal exported successfully');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await usersApi.changePassword({ oldPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Settings & Privacy</h1>
        <p className="text-text-secondary mt-1 text-lg font-medium">Control your account, security, and data preferences.</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCircle size={20} className="text-accent-blue" /> Account Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-bg-surface border border-border rounded-xl items-center">
            <div className="w-16 h-16 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center text-xl font-bold border-2 border-accent-primary/50">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-text-primary text-lg">{user?.username}</h3>
              <p className="text-sm text-text-muted flex items-center justify-center sm:justify-start gap-1">
                <Mail size={14} /> {user?.email || 'Anonymous Account (No Email)'}
              </p>
            </div>
            
            {user?.role === 'PATIENT' && !user.is_anonymous && !user.is_verified && (
              <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs font-bold px-3 py-1.5 rounded-md text-center">
                Unverified Email
              </div>
            )}
            
            <div className="bg-bg-elevated px-4 py-2 rounded-lg border border-border text-center">
              <span className="block text-xs uppercase tracking-wider text-text-muted font-bold mb-1">Role</span>
              <span className="font-semibold text-text-primary capitalize">{user?.role?.toLowerCase()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Incognito */}
      <Card className="border-accent-primary/20 shadow-[0_0_30px_rgba(108,99,255,0.05)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><EyeOff size={20} className="text-accent-primary" /> Privacy & Device</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Incognito Mode</h4>
              <p className="text-sm text-text-secondary">When enabled, the screen automatically blurs if you switch to another tab or app, protecting your data from prying eyes.</p>
            </div>
            <div className="shrink-0 mt-1">
              <Toggle checked={incognitoMode} onChange={setIncognito} />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Export Health Data</h4>
              <p className="text-sm text-text-secondary">Download a PDF package containing your journal entries, mood history, and safety plan. Only you hold the keys.</p>
            </div>
            <Button variant="secondary" onClick={handleExport} className="shrink-0"><Download size={16} className="mr-2" /> Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={20} className="text-accent-green" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Two-Factor Authentication (2FA)</h4>
              <p className="text-sm text-text-secondary">Add an extra layer of security using an authenticator app (Google Authenticator, Authy).</p>
            </div>
            <div className="shrink-0 mt-1">
              {user?.two_fa_enabled ? (
                <div className="bg-accent-green/10 text-accent-green border border-accent-green/20 px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Enabled
                </div>
              ) : (
                <Button variant="secondary" onClick={() => navigate('/settings/2fa')}>Setup 2FA</Button>
              )}
            </div>
          </div>

          {!user?.is_anonymous && (
            <div className="pt-6 border-t border-border">
              <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><Key size={16} /> Change Password</h4>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                <Input 
                  type="password" 
                  placeholder="Current Password" 
                  value={passwords.current}
                  onChange={e => setPasswords({...passwords, current: e.target.value})}
                  required
                />
                <Input 
                  type="password" 
                  placeholder="New Password" 
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  required
                />
                <Input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  required
                />
                <Button type="submit" isLoading={loading}>Update Password</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
