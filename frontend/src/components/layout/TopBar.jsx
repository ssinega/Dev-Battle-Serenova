import { useNavigate } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

export const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-bg-surface/90 px-4 backdrop-blur-xl lg:hidden">
      <div className="flex items-center">
        <img 
          src="/serenova-logo.png" 
          alt="Serenova Logo" 
          className="h-10 w-auto object-contain"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/crisis')}
          className="flex items-center justify-center rounded-full bg-accent-red/10 p-2 text-accent-red animate-pulse-glow"
          aria-label="Crisis Support"
        >
          <LifeBuoy className="h-5 w-5" />
        </button>
        <div onClick={() => navigate('/settings')} className="cursor-pointer">
          <Avatar src={user?.avatar_url} fallback={user?.username} size="sm" />
        </div>
      </div>
    </header>
  );
};
