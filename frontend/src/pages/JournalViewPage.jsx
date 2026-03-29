import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { journalApi } from '../api';
import { Button } from '../components/ui/Button';
import { FullPageSpinner } from '../components/ui/Spinner';
import { ArrowLeft, Save, Trash2, Edit3, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = ['HAPPY', 'CALM', 'ANXIOUS', 'SAD', 'ANGRY'];
const EMOJIS = { HAPPY: '😊', CALM: '🙂', ANXIOUS: '😐', SAD: '😔', ANGRY: '😞' };

export default function JournalViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const res = await journalApi.get(id);
      setEntry(res.entry);
      setTitle(res.entry.title);
      setContent(res.entry.content); // Pre-decrypted by backend
      setMood(res.entry.mood_tag || '');
    } catch (err) {
      toast.error('Entry not found or access denied');
      navigate('/journal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await journalApi.update(id, { title, content, mood_tag: mood || undefined });
      toast.success('Updated successfully');
      setIsEditing(false);
      fetchEntry(); // Refresh data
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this entry?')) return;
    try {
      await journalApi.delete(id);
      toast.success('Entry deleted');
      navigate('/journal');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading || !entry) return <FullPageSpinner />;

  return (
    <div className="h-[calc(100vh-100px)] lg:h-[calc(100vh-60px)] -mt-4 lg:-mt-8 flex flex-col max-w-4xl mx-auto animate-fade-in relative z-10">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pt-4 border-b border-border/50 pb-4">
        <button 
          onClick={() => navigate('/journal')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted bg-bg-surface px-2 py-1 rounded-md border border-border mr-2">
             <Lock size={12} /> Decrypted Locally
          </div>
          
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => { setIsEditing(false); setTitle(entry.title); setContent(entry.content); setMood(entry.mood_tag); }} size="sm">
                Cancel
              </Button>
              <Button onClick={handleUpdate} isLoading={isSaving} className="gap-2" size="sm">
                <Save size={16} /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={handleDelete} className="bg-transparent hover:bg-accent-red/10 border-transparent gap-2 px-3" size="sm">
                <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
              </Button>
              <Button onClick={() => setIsEditing(true)} variant="secondary" className="gap-2 px-3 hover:border-accent-primary" size="sm">
                <Edit3 size={16} /> Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-transparent px-2 lg:px-8 py-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-text-muted">
             {new Date(entry.created_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2 bg-bg-surface p-1.5 rounded-xl border border-border">
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`text-xl transition-all ${mood === m ? 'scale-125 filter drop-shadow-md' : 'opacity-40 hover:opacity-100 hover:scale-110 grayscale-[0.8]'}`}
                >
                  {EMOJIS[m]}
                </button>
              ))}
            </div>
          ) : (
             entry.mood_tag && (
               <div className="flex items-center gap-2 bg-bg-surface px-3 py-1.5 rounded-full border border-border text-2xl filter drop-shadow-sm">
                 {EMOJIS[entry.mood_tag]}
               </div>
             )
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl lg:text-4xl font-display font-bold bg-transparent border-none text-text-primary focus:outline-none w-full border-b border-border/50 pb-2"
          />
        ) : (
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-text-primary">
            {entry.title}
          </h1>
        )}

        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 min-h-[300px] resize-none bg-transparent border-none text-lg text-text-secondary leading-relaxed focus:outline-none custom-scrollbar"
          />
        ) : (
          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-p:text-lg prose-p:leading-relaxed">
            {entry.content?.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
