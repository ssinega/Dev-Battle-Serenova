import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourcesApi } from '../api';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowLeft, ExternalLink, BookOpen, MonitorPlay, Headphones, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await resourcesApi.get(id);
        setResource(res.resource);
      } catch (err) {
        toast.error('Resource not found');
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, navigate]);

  if (loading || !resource) return <FullPageSpinner />;

  const getTypeIcon = (type) => {
    switch(type) {
      case 'VIDEO': return <MonitorPlay className="text-accent-blue" size={24} />;
      case 'AUDIO': return <Headphones className="text-accent-primary" size={24} />;
      case 'WORKSHEET': return <FileText className="text-accent-green" size={24} />;
      default: return <BookOpen className="text-text-muted" size={24} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      
      <button 
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Library
      </button>

      <Card className="overflow-hidden border-border/50 shadow-2xl">
        {resource.thumbnail_url && (
          <div className="w-full h-64 md:h-80 relative overflow-hidden bg-bg-base flex items-center justify-center border-b border-border/50">
             <img 
               src={resource.thumbnail_url} 
               alt={resource.title} 
               className="w-full h-full object-cover opacity-60 blur-md absolute inset-0 z-0" 
             />
             <img 
               src={resource.thumbnail_url} 
               alt={resource.title} 
               className="h-full object-contain relative z-10 drop-shadow-2xl" 
             />
          </div>
        )}
        
        <CardContent className="p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-bg-surface rounded-xl border border-border shadow-inner">
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-accent-primary uppercase">{resource.category}</span>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary mt-1">{resource.title}</h1>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-p:text-lg prose-p:leading-relaxed border-t border-border pt-6">
            <p>{resource.description}</p>
          </div>

          <div className="bg-bg-elevated/50 p-6 rounded-2xl border border-border mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-semibold text-text-primary flex items-center justify-center md:justify-start gap-2">
                <CheckCircle2 size={18} className="text-accent-green" /> Ready to begin?
              </h3>
              <p className="text-sm text-text-secondary">This is external content curated by Serenova experts.</p>
            </div>
            
            <Button 
              size="lg" 
              className="w-full md:w-auto shadow-lg shadow-accent-primary/25 group whitespace-nowrap px-8"
              onClick={() => window.open(resource.url, '_blank')}
            >
              Open {resource.type.toLowerCase()} <ExternalLink size={16} className="ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
