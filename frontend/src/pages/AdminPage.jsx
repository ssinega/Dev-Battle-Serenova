import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FullPageSpinner } from '../components/ui/Spinner';
import { ShieldCheck, UserCheck, Activity, Users, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ptRes] = await Promise.all([
        apiClient.get('/admin/stats').then(res => res.data),
        apiClient.get('/admin/therapists/pending').then(res => res.data),
      ]);
      setStats(statsRes.stats);
      setPendingTherapists(ptRes.therapists || []);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await apiClient.patch(`/admin/therapists/${id}/verify`);
      toast.success('Therapist verified successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to verify therapist');
    }
  };

  if (loading || !stats) return <FullPageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">System Control <span className="ml-2 text-accent-blue">⚙️</span></h1>
        <p className="text-text-secondary mt-1 text-lg font-medium">Platform analytics and administrative actions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} color="text-accent-primary" bg="bg-accent-primary/10" label="Total Users" value={stats.users} />
        <StatCard icon={ShieldCheck} color="text-accent-green" bg="bg-accent-green/10" label="Therapists" value={stats.therapists} />
        <StatCard icon={Activity} color="text-accent-blue" bg="bg-accent-blue/10" label="Total Sessions" value={stats.sessions} />
        <StatCard icon={Database} color="text-accent-amber" bg="bg-accent-amber/10" label="Journal Entries" value={stats.journals} />
      </div>

      <Card className="border-accent-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCheck className="text-accent-primary" /> Pending Therapist Verifications</CardTitle>
          <p className="text-sm text-text-muted">Review credentials and activate therapist accounts.</p>
        </CardHeader>
        <CardContent>
          {pendingTherapists.length === 0 ? (
            <div className="text-center py-8 text-text-muted font-medium bg-bg-surface rounded-xl border border-border border-dashed">
              No pending verifications. All caught up!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTherapists.map(t => (
                <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-bg-surface border border-border rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-text-primary text-lg">{t.full_name}</h4>
                      <Badge variant="warning" className="text-[10px]">PENDING</Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{t.user?.email}</p>
                    <div className="flex flex-wrap gap-2">
                       {t.specializations?.map(spec => <Badge key={spec}>{spec}</Badge>)}
                    </div>
                    {t.credentials_url && (
                      <a href={t.credentials_url} target="_blank" rel="noreferrer" className="text-xs text-accent-blue hover:underline mt-2 inline-block font-medium border border-accent-blue/30 px-2 py-0.5 rounded-md bg-accent-blue/10">
                        View Credentials
                      </a>
                    )}
                  </div>
                  <Button onClick={() => handleVerify(t.id)} className="w-full sm:w-auto mt-2 sm:mt-0 shadow-lg shadow-accent-primary/20">
                    Verify & Activate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div className="bg-bg-card border border-border p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-border-glow transition-colors group">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <Icon className={color} size={24} />
    </div>
    <div className="text-2xl font-display font-bold text-text-primary mb-1">{value}</div>
    <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</div>
  </div>
);
