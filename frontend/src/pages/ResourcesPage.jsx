import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourcesApi } from '../api';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BookOpen, Search, Filter, Headphones, MonitorPlay, FileText } from 'lucide-react';
import { Input } from '../components/ui/Input';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, [category]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourcesApi.list({ category: category || undefined });
      setResources(res.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const getTypeIcon = (type) => {
    switch(type) {
      case 'VIDEO': return <MonitorPlay size={16} className="text-accent-blue" />;
      case 'AUDIO': return <Headphones size={16} className="text-accent-primary" />;
      case 'WORKSHEET': return <FileText size={16} className="text-accent-green" />;
      default: return <BookOpen size={16} className="text-text-muted" />;
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Resource Library 📚</h1>
        <p className="text-text-secondary mt-2 text-lg font-medium">Curated content to support your mental wellness journey.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <Input 
            placeholder="Search resources..." 
            className="pl-10 bg-bg-surface" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative w-full sm:w-64">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
           <select 
             className="w-full h-10 pl-9 pr-4 bg-bg-surface border border-border text-text-primary rounded-lg focus:ring-2 focus:ring-accent-primary appearance-none cursor-pointer"
             value={category}
             onChange={(e) => setCategory(e.target.value)}
           >
             <option value="">All Categories</option>
             <option value="ANXIETY">Anxiety & Panic</option>
             <option value="DEPRESSION">Depression</option>
             <option value="STRESS">Stress Management</option>
             <option value="SLEEP">Sleep Hygiene</option>
             <option value="MINDFULNESS">Mindfulness</option>
           </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <Card key={item.id} className="flex flex-col h-full group hover:border-accent-primary/50 transition-all cursor-pointer overflow-hidden shadow-md" onClick={() => navigate(`/resources/${item.id}`)}>
            {item.thumbnail_url ? (
              <div className="h-48 w-full bg-bg-surface overflow-hidden relative">
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute top-3 left-3 bg-bg-card/90 backdrop-blur-md px-2 py-1 rounded-md border border-border flex items-center gap-1.5 text-xs font-bold text-text-primary uppercase tracking-wider">
                  {getTypeIcon(item.type)} {item.type}
                </div>
              </div>
            ) : (
              <div className="h-48 w-full bg-gradient-to-br from-bg-surface to-bg-elevated flex items-center justify-center border-b border-border/50 relative">
                 <BookOpen size={48} className="text-border drop-shadow-lg" />
                 <div className="absolute top-3 left-3 bg-bg-card/90 backdrop-blur-md px-2 py-1 rounded-md border border-border flex items-center gap-1.5 text-xs font-bold text-text-primary uppercase tracking-wider">
                   {getTypeIcon(item.type)} {item.type}
                 </div>
              </div>
            )}
            
            <CardContent className="p-5 flex flex-col flex-1">
              <span className="text-[10px] font-bold tracking-widest text-accent-primary uppercase mb-2">{item.category}</span>
              <h3 className="font-display font-semibold text-lg text-text-primary group-hover:text-accent-blue transition-colors mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-text-secondary text-sm line-clamp-3 mb-4 flex-1">{item.description}</p>
              
              <div className="mt-auto pt-4 border-t border-border flex justify-between items-center text-accent-primary group-hover:text-white transition-colors">
                <span className="text-sm font-semibold">Access Resource</span>
                <span className="font-bold">→</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
