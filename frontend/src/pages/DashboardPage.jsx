import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { sessionsApi } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { MoodPicker } from '../components/features/MoodPicker';
import { WellnessStreak } from '../components/features/WellnessStreak';
import { formatRelativeTime } from '../utils/utils';
import { BookHeart, Library, Wind, ShieldAlert, ArrowRight, Video, MessageCircle, Phone } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await sessionsApi.listMy({ status: 'CONFIRMED' });
        if (res.sessions?.length > 0) {
          // Find next future session
          const future = res.sessions
            .filter(s => new Date(s.scheduled_at) > new Date())
            .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
          setUpcomingSession(future || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const QUOTES = [
    "Healing takes time, and asking for help is a courageous step.",
    "Your present circumstances don't determine where you can go.",
    "Breathe. You're going to be okay. Breathe and remember that you've been in this place before.",
    "You don't have to control your thoughts. You just have to stop letting them control you."
  ];
  const todayQuote = QUOTES[new Date().getDay() % QUOTES.length];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            {getGreeting()}, {user?.username || 'friend'} <span className="text-2xl ml-1">👋</span>
          </h1>
          <p className="text-text-secondary mt-2 text-lg font-medium italic">"{todayQuote}"</p>
        </div>
        
        <WellnessStreak />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Mood Check-in */}
          <Card className="border-accent-primary/20 bg-gradient-to-br from-bg-card to-bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodPicker />
            </CardContent>
          </Card>

          {/* Quick Actions Grid (2x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard 
              icon={BookHeart} 
              title="Journal" 
              desc="Reflect on your thoughts" 
              color="bg-accent-primary/10 text-accent-primary border-accent-primary/20"
              onClick={() => navigate('/journal')}
            />
            <ActionCard 
              icon={Wind} 
              title="Breathe" 
              desc="4-7-8 deep breathing" 
              color="bg-accent-blue/10 text-accent-blue border-accent-blue/20"
              onClick={() => navigate('/breathing')}
            />
            <ActionCard 
              icon={Library} 
              title="Resources" 
              desc="Self-guided content" 
              color="bg-accent-green/10 text-accent-green border-accent-green/20"
              onClick={() => navigate('/resources')}
            />
            <ActionCard 
              icon={ShieldAlert} 
              title="Crisis Support" 
              desc="Always available 24/7" 
              color="bg-accent-red/10 text-accent-red border-accent-red/20"
              onClick={() => navigate('/crisis')}
            />
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Session */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
              <CardTitle className="text-lg">Upcoming Session</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')} className="text-xs p-0 h-auto gap-1 text-accent-primary">
                View all <ArrowRight size={14} />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-bg-surface rounded-lg"></div>
                  <div className="h-12 bg-bg-surface rounded-lg"></div>
                </div>
              ) : upcomingSession ? (
                <div className="flex flex-col flex-1 justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-bg-surface rounded-2xl border border-border">
                      <Avatar src={upcomingSession.therapist.user.avatar_url} fallback={upcomingSession.therapist.full_name} size="lg" />
                      <div>
                        <h4 className="font-semibold text-text-primary">{upcomingSession.therapist.full_name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1 font-medium bg-bg-elevated w-max px-2 py-0.5 rounded-md">
                          {upcomingSession.type === 'VIDEO' && <Video size={12} className="text-accent-blue" />}
                          {upcomingSession.type === 'VOICE' && <Phone size={12} className="text-accent-green" />}
                          {upcomingSession.type === 'CHAT' && <MessageCircle size={12} className="text-accent-primary" />}
                          <span>{upcomingSession.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-bg-elevated p-4 rounded-xl border border-border border-l-4 border-l-accent-primary flex flex-col gap-1">
                      <span className="text-sm font-semibold tracking-wide text-accent-primary uppercase">Scheduled For</span>
                      <span className="text-lg font-bold text-text-primary">{formatRelativeTime(upcomingSession.scheduled_at)}</span>
                      <span className="text-sm font-medium text-text-secondary">{new Date(upcomingSession.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({upcomingSession.duration_minutes} min)</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 shadow-lg shadow-accent-primary/25 hover:shadow-accent-primary/40 group" 
                    size="lg"
                    onClick={() => navigate(`/sessions/${upcomingSession.id}`)}
                  >
                    Enter Session Room
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center border border-border mb-2">
                    <Video className="text-text-muted" size={28} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">No upcoming sessions</h4>
                    <p className="text-sm text-text-muted px-4">Book a session to start your wellness journey.</p>
                  </div>
                  <Button onClick={() => navigate('/therapists')} variant="secondary" className="mt-4 border-accent-primary/50 text-accent-primary hover:bg-accent-primary/10">
                    Find a Therapist
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}

const ActionCard = ({ icon: Icon, title, desc, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-start gap-4 p-5 rounded-2xl bg-bg-card border border-border hover:border-border-glow hover:bg-bg-surface transition-all duration-300 text-left group"
  >
    <div className={`p-3 rounded-xl ${color} mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="font-bold text-text-primary mb-1 tracking-wide">{title}</h3>
      <p className="text-sm text-text-secondary font-medium">{desc}</p>
    </div>
  </button>
);
