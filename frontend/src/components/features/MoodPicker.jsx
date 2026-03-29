import { useState } from 'react';
import { motion } from 'framer-motion';
import { moodApi } from '../../api';
import toast from 'react-hot-toast';

const MOODS = [
  { label: 'Angry', score: 1, emoji: '😞', color: 'bg-accent-red/20 text-accent-red hover:bg-accent-red/30' },
  { label: 'Sad', score: 2, emoji: '😔', color: 'bg-text-muted/20 text-text-secondary hover:bg-text-muted/30' },
  { label: 'Neutral', score: 3, emoji: '😐', color: 'bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/20' },
  { label: 'Calm', score: 4, emoji: '🙂', color: 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20' },
  { label: 'Happy', score: 5, emoji: '😊', color: 'bg-accent-green/10 text-accent-green hover:bg-accent-green/20' },
];

export const MoodPicker = ({ initialScore = null, onSubmitted }) => {
  const [selected, setSelected] = useState(initialScore);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (score) => {
    if (isSubmitting) return;
    setSelected(score);
    setIsSubmitting(true);
    
    try {
      await moodApi.checkin({ mood_score: score, note: '' });
      toast.success('Mood logged for today');
      if (onSubmitted) onSubmitted(score);
    } catch (err) {
      toast.error('Failed to log mood');
      setSelected(initialScore); // Reset on fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-2 sm:gap-4 p-2 bg-bg-surface rounded-2xl border border-border mt-4">
      {MOODS.map((mood) => {
        const isSelected = selected === mood.score;
        return (
          <motion.button
            key={mood.score}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(mood.score)}
            disabled={isSubmitting}
            className={`flex flex-col flex-1 items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-300 ${
              isSelected
                ? mood.color.replace('/10', '/30').replace('/20', '/40') + ' shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105 border border-border/50'
                : 'hover:bg-bg-elevated grayscale-[0.8] hover:grayscale-0 opacity-70 hover:opacity-100'
            }`}
          >
            <span className="text-3xl sm:text-4xl leading-none mb-1 sm:mb-2 filter drop-shadow-md">
              {mood.emoji}
            </span>
            <span className={`text-[10px] sm:text-xs font-semibold ${isSelected ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              {mood.label}
            </span>
            
            {isSelected && (
              <motion.div
                layoutId="moodIndicator"
                className="absolute inset-0 rounded-xl rounded-b-none border-b-2 border-white/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
