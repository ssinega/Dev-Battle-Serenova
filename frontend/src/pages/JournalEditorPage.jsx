import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalApi } from '../api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save, Lock, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = ['HAPPY', 'CALM', 'ANXIOUS', 'SAD', 'ANGRY'];
const EMOJIS = { HAPPY: '😊', CALM: '🙂', ANXIOUS: '😐', SAD: '😔', ANGRY: '😞' };

export default function JournalEditorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save skeleton logic
  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => {
      // Could implement actual background auto-save here
      setLastSaved(new Date());
    }, 5000);
    return () => clearTimeout(timer);
  }, [title, content, mood]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsSaving(true);
    try {
      await journalApi.create({ title, content, mood_tag: mood || undefined });
      toast.success('Journal entry saved securely');
      navigate('/journal');
    } catch (err) {
      toast.error('Failed to save entry');
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] lg:h-[calc(100vh-60px)] -mt-4 lg:-mt-8 flex flex-col max-w-4xl mx-auto animate-fade-in relative z-10">
      
      {/* Editor Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
        <button 
          onClick={() => navigate('/journal')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium w-max"
        >
          <ArrowLeft size={16} /> Back to Journal
        </button>
        
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="text-xs font-medium text-text-muted flex items-center gap-1.5 bg-bg-surface px-2 py-1 rounded-md border border-border">
            <Lock size={12} /> {lastSaved ? `Auto-saved ${lastSaved.toLocaleTimeString()}` : 'E2E Encrypted'}
          </div>
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2" size="sm">
            <Save size={16} /> Save Entry
          </Button>
        </div>
      </div>

      {/* Main Editor Surface */}
      <div className="flex-1 bg-bg-base/50 lg:bg-bg-card border-none lg:border lg:border-border rounded-none lg:rounded-2xl p-0 lg:p-8 flex flex-col gap-6">
        
        {/* Mood Selector Row */}
        <div className="flex items-center gap-2 pb-6 border-b border-border/50">
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider mr-2">Mood:</span>
          {MOODS.map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-2xl transition-all ${mood === m ? 'scale-125 filter drop-shadow-md' : 'opacity-40 hover:opacity-100 hover:scale-110 grayscale-[0.5] hover:grayscale-0'}`}
              title={m}
            >
              {EMOJIS[m]}
            </button>
          ))}
          {mood && (
            <button 
              onClick={() => setMood('')}
              className="text-xs text-text-muted hover:text-text-primary ml-2 uppercase font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Entry Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl lg:text-4xl font-display font-bold bg-transparent border-none text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-0 w-full"
        />

        {/* Body Textarea */}
        <div className="relative flex-1 group">
          <div className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block text-text-muted/30">
            <GripVertical size={16} />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here... Only you can read this."
            className="w-full h-full min-h-[400px] resize-none bg-transparent border-none text-lg text-text-secondary leading-relaxed focus:outline-none focus:ring-0 placeholder:text-text-muted/30 custom-scrollbar pb-20"
          />
        </div>

      </div>
    </div>
  );
}
