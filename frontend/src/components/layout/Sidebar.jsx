import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, Users, Video, BookHeart, Library, Settings, LogOut, LifeBuoy } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/utils';
import apiClient from '../../api/client';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Therapists', icon: Users, href: '/therapists' },
    { label: 'Sessions', icon: Video, href: '/sessions' },
    { label: 'Journal', icon: BookHeart, href: '/journal' },
    { label: 'Resources', icon: Library, href: '/resources' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-border bg-bg-surface/95 backdrop-blur-xl transition-transform lg:flex glass-panel">
      {/* Logo Area */}
      <div className="flex h-20 items-center px-6">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/serenova-logo.png" 
            alt="Serenova Logo" 
            className="h-14 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-inner"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-accent-primary" : "text-text-muted group-hover:text-text-primary")} />
              {item.label}
              {isActive && (
                <div className="absolute left-0 h-8 w-1 rounded-r-full bg-accent-primary shadow-[0_0_10px_var(--accent-primary)]" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-border/50 space-y-4 bg-bg-base/50">
        {/* Crisis Button */}
        <button
          onClick={() => navigate('/crisis')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-red/10 px-4 py-3 text-sm font-semibold text-accent-red border border-accent-red/20 transition-all hover:bg-accent-red hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
        >
          <LifeBuoy className="h-5 w-5" />
          Crisis Support
        </button>

        {/* User Profile */}
        <div className="flex flex-col gap-3 rounded-xl bg-bg-elevated p-3 border border-border">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar_url} fallback={user?.username || 'User'} size="sm" />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-text-primary">{user?.username || 'Anonymous'}</span>
              <span className="text-xs text-text-muted truncate capitalize">{user?.role?.toLowerCase() || 'Patient'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bg-surface py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary border border-border"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};
