import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { sessionsApi } from '../api';
import { formatRelativeTime } from '../utils/utils';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Video, Calendar, Clock, ArrowRight, MessageCircle, Phone, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past'

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await sessionsApi.listMy();
      setSessions(res.sessions || []);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    try {
      await sessionsApi.cancel(id);
      toast.success('Session cancelled');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to cancel session');
    }
  };

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.scheduled_at) >= now && s.status !== 'CANCELLED').sort((a,b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const past = sessions.filter(s => new Date(s.scheduled_at) < now || s.status === 'CANCELLED');

  const displayedSessions = activeTab === 'upcoming' ? upcoming : past;

  const renderIcon = (type) => {
    switch(type) {
      case 'VIDEO': return <Video size={16} className="text-accent-blue" />;
      case 'VOICE': return <Phone size={16} className="text-accent-green" />;
      case 'CHAT': return <MessageCircle size={16} className="text-accent-primary" />;
      default: return null;
    }
  };

  const getPartner = (session) => {
    return user.role === 'THERAPIST' ? session.patient : session.therapist.user;
  };

  const getPartnerName = (session) => {
    return user.role === 'THERAPIST' ? session.patient.username : session.therapist.full_name;
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Your Sessions</h1>
        <p className="text-text-secondary mt-1 text-lg font-medium">Manage your upcoming appointments and past records.</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        <button
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'upcoming' ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcoming.length})
          {activeTab === 'upcoming' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-accent-primary shadow-[0_0_8px_var(--accent-primary)] rounded-t-full" />}
        </button>
        <button
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'past' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
          onClick={() => setActiveTab('past')}
        >
          Past ({past.length})
          {activeTab === 'past' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-text-primary rounded-t-full" />}
        </button>
      </div>

      <div className="space-y-4">
        {displayedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-bg-card rounded-2xl border border-border border-dashed">
            <Calendar size={48} className="text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary">No sessions found</h3>
            <p className="text-text-secondary text-sm">You have no {activeTab} sessions.</p>
            {user.role === 'PATIENT' && activeTab === 'upcoming' && (
              <Button onClick={() => navigate('/therapists')} className="mt-4">Find a Therapist</Button>
            )}
          </div>
        ) : (
          displayedSessions.map(session => {
            const partner = getPartner(session);
            const partnerName = getPartnerName(session);
            const isToday = new Date(session.scheduled_at).toDateString() === now.toDateString();

            return (
              <Card key={session.id} className="transition-all hover:border-border-glow group">
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar 
                      src={partner?.avatar_url} 
                      fallback={partnerName}
                      size="lg" 
                      className="border-border shadow-md"
                    />
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg text-text-primary">{partnerName}</h4>
                        <Badge variant={session.status === 'COMPLETED' ? 'success' : session.status === 'CANCELLED' ? 'danger' : 'default'} className="text-[10px] px-2 py-0.5">
                          {session.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-secondary">
                        <span className="flex items-center gap-1.5 bg-bg-surface px-2 py-1 rounded-md border border-border/50">
                          <Calendar size={14} className="text-text-muted" /> 
                          <span className={isToday ? "text-accent-primary font-bold" : ""}>
                            {formatRelativeTime(session.scheduled_at)}
                          </span>
                        </span>
                        
                        <span className="flex items-center gap-1.5 bg-bg-surface px-2 py-1 rounded-md border border-border/50">
                          <Clock size={14} className="text-text-muted" /> 
                          {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <span className="flex items-center gap-1.5 bg-bg-surface px-2 py-1 rounded-md border border-border/50 capitalize">
                          {renderIcon(session.type)} {session.type.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                    {session.status === 'PENDING' || session.status === 'CONFIRMED' ? (
                      <>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleCancel(session.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle size={16} className="sm:mr-2" />
                          <span className="hidden sm:inline">Cancel</span>
                        </Button>
                        <Button 
                          onClick={() => navigate(`/sessions/${session.id}`)}
                          className="flex-1 sm:flex-none group-hover:shadow-[0_0_15px_rgba(108,99,255,0.4)] transition-shadow"
                        >
                          Join <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="secondary" onClick={() => navigate(`/sessions/${session.id}`)} className="w-full sm:w-auto">
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
