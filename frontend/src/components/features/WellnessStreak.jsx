import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { moodApi } from '../../api';

export const WellnessStreak = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    moodApi.getStreak().then(data => setStreak(data.streak || 0)).catch(console.error);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
        streak > 0 
          ? 'bg-accent-amber/10 text-accent-amber shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
          : 'bg-bg-surface text-text-muted border border-border'
      }`}>
        <Flame className={`h-6 w-6 ${streak > 0 ? 'animate-pulse' : ''}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">Wellness Streak</p>
        <p className="text-2xl font-display font-bold text-text-primary mt-[-2px]">
          {streak} {streak === 1 ? 'day' : 'days'}
        </p>
      </div>
    </div>
  );
};
