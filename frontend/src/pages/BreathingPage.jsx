import { BreathingCircle } from '../components/features/BreathingCircle';
import { Card, CardContent } from '../components/ui/Card';
import { Wind, Flower2 } from 'lucide-react';

export default function BreathingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight inline-flex items-center gap-2">
           Find Your Center <Flower2 className="text-accent-primary animate-pulse" />
        </h1>
        <p className="text-text-secondary mt-2 text-lg font-medium max-w-lg mx-auto">
          Take a moment for yourself. Follow the guide to regulate your nervous system and reduce acute stress.
        </p>
      </div>

      <div className="bg-bg-card rounded-3xl border border-border p-8 lg:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.4),_0_0_50px_rgba(108,99,255,0.05)] relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(56,189,248,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <BreathingCircle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-bg-surface border-border">
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Wind className="text-accent-blue" size={18} /> The 4-4-6 Technique
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              This adapted box breathing technique activates the parasympathetic nervous system. 
              The longer exhale effectively slows your heart rate and signals safety to your brain, 
              reducing anxiety and promoting calm focus.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-bg-surface border-border">
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-3 cursor-default">
               Tips for Success
            </h3>
            <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
              <li>Keep your shoulders relaxed and down.</li>
              <li>Breathe deep into your belly, not your chest.</li>
              <li>Close your eyes if it helps you focus inward.</li>
              <li>Practice silently anywhere, anytime.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
