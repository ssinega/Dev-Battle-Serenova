import { useState, useEffect } from 'react';

export const BreathingCircle = () => {
  const [phase, setPhase] = useState('Inhale...');
  
  useEffect(() => {
    // Phase sync matches CSS keyframes: 4s inhale, 4s hold, 6s exhale (14s total)
    const cycle = () => {
      setPhase('Inhale...');
      setTimeout(() => setPhase('Hold...'), 4000);
      setTimeout(() => setPhase('Exhale...'), 8000); // 4 + 4
    };

    cycle();
    const interval = setInterval(cycle, 14000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full min-h-[400px]">
      <div className="relative flex items-center justify-center">
        {/* Glow behind */}
        <div className="absolute w-64 h-64 rounded-full bg-accent-primary/10 blur-3xl" />
        
        {/* Animated Circle */}
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-accent-blue/80 to-accent-primary/80 shadow-[0_0_40px_rgba(108,99,255,0.4)] animate-breathe flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-bg-base/20 backdrop-blur-sm" />
        </div>
        
        {/* TextOverlay */}
        <div className="absolute text-3xl font-display font-bold text-white tracking-widest pointer-events-none drop-shadow-md">
          {phase}
        </div>
      </div>
      <p className="mt-20 text-text-secondary text-sm font-medium tracking-wide">
        Follow the circle to regulate your nervous system.
      </p>
    </div>
  );
};
