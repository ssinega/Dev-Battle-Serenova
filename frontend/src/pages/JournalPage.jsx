import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalApi } from '../api';
import { MoodHeatmap } from '../components/features/MoodHeatmap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatRelativeTime, getMoodEmoji, getMoodColor } from '../utils/utils';
import { Plus, BookHeart, Lock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await journalApi.list({ limit: 10 });
      setEntries(res.entries || []);
    } catch (err) {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Your Journal</h1>
          <p className="text-text-secondary mt-1 text-lg font-medium flex items-center gap-2">
            <Lock size={16} /> 100% End-to-End Encrypted
          </p>
        </div>
        <Button onClick={() => navigate('/journal/new')} className="gap-2 shadow-lg shadow-accent-primary/25">
          <Plus size={18} /> New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-display font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
            <BookHeart size={20} className="text-accent-primary" /> Recent Entries
          </h2>
          
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-bg-card rounded-2xl border border-border border-dashed text-center">
              <BookHeart size={48} className="text-text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-text-primary">Blank Canvas</h3>
              <p className="text-text-secondary text-sm max-w-sm mt-2">
                Your journal is empty. Start writing to track your thoughts, feelings, and progress over time.
              </p>
              <Button onClick={() => navigate('/journal/new')} className="mt-6" variant="secondary">Start Writing</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div 
                  key={entry.id}
                  onClick={() => navigate(`/journal/${entry.id}`)}
                  className="bg-bg-card border border-border rounded-2xl p-5 hover:border-accent-primary/50 transition-all cursor-pointer group hover:bg-bg-surface"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-accent-primary transition-colors">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      {entry.mood_tag && (
                        <span className={`text-xl ${getMoodColor(entry.mood_tag)} filter drop-shadow-sm`}>
                          {getMoodEmoji(entry.mood_tag)}
                        </span>
                      )}
                      <span className="text-xs font-medium text-text-muted bg-bg-elevated px-2 py-1 rounded-md">
                        {formatRelativeTime(entry.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                    {entry.preview}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-gradient-to-br from-bg-card to-bg-surface border-accent-primary/10">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar size={18} className="text-accent-primary" /> Mood Heatmap
              </CardTitle>
              <p className="text-xs text-text-muted">A visual record of your emotional states</p>
            </CardHeader>
            <CardContent>
              <MoodHeatmap />
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
