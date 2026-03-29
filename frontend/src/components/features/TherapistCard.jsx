import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Star, Video, Phone, MessageCircle } from 'lucide-react';

export const TherapistCard = ({ therapist, onBook }) => {
  const { user, full_name, specializations, hourly_rate, rating, total_reviews, session_types } = therapist;

  const renderSessionIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video size={14} className="text-accent-blue" />;
      case 'VOICE': return <Phone size={14} className="text-accent-green" />;
      case 'CHAT': return <MessageCircle size={14} className="text-accent-primary" />;
      default: return null;
    }
  };

  return (
    <Card className="flex flex-col h-full hover:border-accent-primary/50 transition-colors group">
      <CardContent className="p-6 flex flex-col flex-1">
        
        {/* Header: Avatar, Info, Rating */}
        <div className="flex items-start gap-4">
          <Avatar src={user.avatar_url} fallback={full_name} size="lg" className="border-accent-primary/20 bg-accent-primary/5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-text-primary truncate">{full_name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
              <span className="text-sm font-bold text-text-primary">{rating.toFixed(1)}</span>
              <span className="text-sm text-text-muted">({total_reviews})</span>
            </div>
            
            {/* Session type icons available */}
            <div className="flex items-center gap-2 mt-2">
              {session_types?.map((type) => (
                <div key={type} className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-surface border border-border" title={type}>
                  {renderSessionIcon(type)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-accent-primary">${hourly_rate}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">/ session</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4 flex-1">
          {specializations?.slice(0, 3).map((spec) => (
            <Badge key={spec}>{spec}</Badge>
          ))}
          {(specializations?.length || 0) > 3 && (
            <Badge variant="default" className="bg-bg-surface border-none text-text-muted">
              +{specializations.length - 3}
            </Badge>
          )}
        </div>

        {/* Action */}
        <Button 
          className="w-full mt-6" 
          variant="secondary"
          onClick={() => onBook(therapist)}
        >
          View & Book
        </Button>
      </CardContent>
    </Card>
  );
};
