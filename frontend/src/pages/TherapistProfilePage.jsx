import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { therapistsApi } from '../api';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BookingModal } from '../components/features/BookingModal';
import { Star, Video, Phone, MessageCircle, MapPin, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TherapistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await therapistsApi.get(id);
        setTherapist(res.therapist);
      } catch (err) {
        toast.error('Failed to load profile');
        navigate('/therapists');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

  if (loading) return <FullPageSpinner />;
  if (!therapist) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/therapists')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4 font-medium"
      >
        <ArrowLeft size={18} /> Back to Directory
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6 border-accent-primary/20 shadow-xl shadow-accent-primary/5">
            <Avatar 
              src={therapist.user?.avatar_url} 
              fallback={therapist.full_name} 
              size="2xl" 
              className="mx-auto mb-4 border-4 border-bg-base ring-2 ring-accent-primary/30" 
            />
            <h1 className="text-xl font-display font-bold text-text-primary mb-1">{therapist.full_name}</h1>
            
            <div className="flex items-center justify-center gap-1.5 text-accent-amber font-bold mb-4 bg-accent-amber/10 w-max mx-auto px-3 py-1 rounded-full">
              <Star size={16} className="fill-current" />
              <span>{therapist.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-text-muted font-medium text-sm">({therapist.total_reviews} reviews)</span>
            </div>

            <Button size="lg" className="w-full text-base" onClick={() => setIsBookingModalOpen(true)}>
              Book Session
            </Button>
            <p className="text-sm font-bold mt-4 text-text-primary">
              ${therapist.hourly_rate} <span className="text-text-muted font-medium">/ 60 min session</span>
            </p>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-text-primary border-b border-border pb-2">Languages</h3>
              <div className="flex items-center gap-3 text-text-secondary">
                <Globe size={18} className="text-accent-primary" />
                <span className="font-medium">{therapist.languages?.join(', ') || 'English'}</span>
              </div>
              
              <h3 className="font-semibold text-text-primary border-b border-border pb-2 mt-4">Session Types</h3>
              <div className="flex flex-col gap-3">
                {therapist.session_types?.includes('VIDEO') && (
                  <div className="flex items-center gap-3 text-text-secondary font-medium">
                    <Video size={18} className="text-accent-blue" /> Video Call
                  </div>
                )}
                {therapist.session_types?.includes('VOICE') && (
                  <div className="flex items-center gap-3 text-text-secondary font-medium">
                    <Phone size={18} className="text-accent-green" /> Voice Call
                  </div>
                )}
                {therapist.session_types?.includes('CHAT') && (
                  <div className="flex items-center gap-3 text-text-secondary font-medium">
                    <MessageCircle size={18} className="text-accent-primary" /> Text Chat
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-display font-bold text-text-primary">About Me</h2>
                {therapist.is_verified && <CheckCircle2 className="text-accent-green h-6 w-6" />}
              </div>
              
              <div className="prose prose-invert max-w-none text-text-secondary font-medium leading-relaxed">
                {therapist.bio?.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                )) || <p>No bio provided.</p>}
              </div>

              <h3 className="text-xl font-display font-bold text-text-primary mt-8 mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.specializations?.map(spec => (
                  <Badge key={spec} variant="primary" className="px-4 py-1.5 text-sm">{spec}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          therapist={therapist} 
        />
      )}
    </div>
  );
}
