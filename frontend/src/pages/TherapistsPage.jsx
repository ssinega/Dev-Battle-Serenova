import { useState, useEffect } from 'react';
import { therapistsApi } from '../api';
import { TherapistCard } from '../components/features/TherapistCard';
import { BookingModal } from '../components/features/BookingModal';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';
import { Search, Filter, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  
  // Modals
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, [typeFilter, specFilter]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const res = await therapistsApi.list({ 
        limit: 50, 
        type: typeFilter || undefined,
        specialty: specFilter || undefined 
      });
      setTherapists(res.therapists || []);
    } catch (err) {
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (therapist) => {
    setSelectedTherapist(therapist);
    setIsBookingModalOpen(true);
  };

  // Client side search for names
  const filteredTherapists = therapists.filter(t => 
    t.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
          Find Your Perfect Match <span className="ml-2">🤝</span>
        </h1>
        <p className="text-text-secondary mt-2 text-lg font-medium">Connect with verified professionals specialized in your needs.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <Input 
            placeholder="Search by name..." 
            className="pl-10 bg-bg-surface" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 sm:w-auto">
          <div className="relative flex-1 sm:w-48">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
             <select 
               className="w-full h-10 pl-9 pr-4 bg-bg-surface border border-border text-text-primary rounded-lg focus:ring-2 focus:ring-accent-primary appearance-none cursor-pointer"
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="">All Session Types</option>
               <option value="VIDEO">Video Call</option>
               <option value="VOICE">Voice Call</option>
               <option value="CHAT">Text Chat</option>
             </select>
          </div>
          
          <div className="relative flex-1 sm:w-48">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
             <select 
               className="w-full h-10 pl-9 pr-4 bg-bg-surface border border-border text-text-primary rounded-lg focus:ring-2 focus:ring-accent-primary appearance-none cursor-pointer"
               value={specFilter}
               onChange={(e) => setSpecFilter(e.target.value)}
             >
               <option value="">All Specializations</option>
               <option value="Anxiety">Anxiety</option>
               <option value="Depression">Depression</option>
               <option value="Trauma & PTSD">Trauma & PTSD</option>
               <option value="Relationships">Relationships</option>
               <option value="Stress Management">Stress Management</option>
               <option value="Sleep Disorders">Sleep Disorders</option>
             </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <FullPageSpinner />
      ) : filteredTherapists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map(therapist => (
            <TherapistCard 
              key={therapist.id} 
              therapist={therapist} 
              onBook={handleBookClick} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-bg-card rounded-2xl border border-border border-dashed">
          <AlertCircle size={48} className="text-text-muted mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No therapists found</h3>
          <p className="text-text-secondary">Try adjusting your filters or search term.</p>
        </div>
      )}

      {/* Modal is unmounted when closed to reset internal state */}
      {isBookingModalOpen && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          therapist={selectedTherapist} 
        />
      )}
    </div>
  );
}
