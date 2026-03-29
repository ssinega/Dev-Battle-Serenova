import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sessionsApi, therapistsApi } from '../../api';
import toast from 'react-hot-toast';
import { Calendar, Clock, Video, Phone, MessageCircle } from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, therapist }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [availability, setAvailability] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (isOpen && therapist) {
      // Fetch fresh availability or use initial
      therapistsApi.getAvailability(therapist.id)
        .then(res => setAvailability(res.availability || therapist.availability_json))
        .catch(() => setAvailability(therapist.availability_json));
      
      // Select first available type
      if (therapist.session_types?.length) {
        setSelectedType(therapist.session_types[0]);
      }
    } else {
      // Reset state on close
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedType('');
    }
  }, [isOpen, therapist]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedType) return;
    
    setIsBooking(true);
    try {
      // Construct date string (simplistic for demo: next occurrence of that weekday)
      const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(selectedDate);
      const today = new Date();
      let d = today.getDay();
      let diff = dayIndex - d;
      if (diff <= 0) diff += 7; // Next occurrence
      
      const scheduledDate = new Date();
      scheduledDate.setDate(today.getDate() + diff);
      
      const [hours, minutes] = selectedTime.split(':');
      scheduledDate.setHours(parseInt(hours), parseInt(minutes || 0), 0, 0);

      await sessionsApi.book({
        therapist_id: therapist.id,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes: 60,
        type: selectedType
      });

      toast.success('Session booked successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  const availableDays = availability ? Object.keys(availability).filter(k => availability[k]?.length > 0) : [];
  const availableTimes = selectedDate && availability ? availability[selectedDate] : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a Session" maxWidth="max-w-xl">
      {therapist && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-bg-surface rounded-xl border border-border">
            <h4 className="font-semibold text-text-primary flex-1">{therapist.full_name}</h4>
            <span className="text-xl font-bold text-accent-primary">${therapist.hourly_rate}</span>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-text-secondary">
              <Calendar size={16} /> 1. Select Day
            </label>
            <div className="flex flex-wrap gap-2">
              {availableDays.map(day => (
                <button
                  key={day}
                  onClick={() => { setSelectedDate(day); setSelectedTime(''); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    selectedDate === day 
                      ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' 
                      : 'bg-bg-elevated text-text-primary hover:bg-bg-surface border border-border'
                  }`}
                >
                  {day}
                </button>
              ))}
              {availableDays.length === 0 && <span className="text-sm text-accent-red">No availability found.</span>}
            </div>
          </div>

          <AnimateHeight show={selectedDate !== null}>
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-text-secondary">
                <Clock size={16} /> 2. Select Time
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTimes?.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time 
                        ? 'bg-accent-blue text-bg-base font-bold shadow-lg shadow-accent-blue/20' 
                        : 'bg-bg-elevated text-text-primary hover:bg-bg-surface border border-border'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </AnimateHeight>

          <AnimateHeight show={selectedTime !== ''}>
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">3. Session Type</label>
              <div className="flex gap-4">
                {therapist.session_types?.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl gap-2 transition-all border ${
                      selectedType === type
                        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                        : 'bg-bg-surface border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type === 'VIDEO' && <Video size={24} />}
                    {type === 'VOICE' && <Phone size={24} />}
                    {type === 'CHAT' && <MessageCircle size={24} />}
                    <span className="text-xs font-bold uppercase">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </AnimateHeight>

          <div className="pt-4 border-t border-border mt-6">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime || !selectedType || isBooking}
              isLoading={isBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const AnimateHeight = ({ show, children }) => (
  <div className={`transition-all duration-300 overflow-hidden ${show ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
    {children}
  </div>
);
