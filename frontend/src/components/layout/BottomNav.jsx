import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Video, BookHeart, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/utils';

export const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Home', icon: Home, href: '/dashboard' },
    { label: 'Therapists', icon: Users, href: '/therapists' },
    { label: 'Sessions', icon: Video, href: '/sessions' },
    { label: 'Journal', icon: BookHeart, href: '/journal' },
    { label: 'More', icon: MoreHorizontal, href: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-bg-surface/90 backdrop-blur-xl lg:hidden pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.href) || 
                         (item.href === '/settings' && ['/resources', '/crisis'].some(p => location.pathname.startsWith(p)));
                         
        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
              isActive ? "text-accent-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            {isActive && (
              <div className="absolute top-0 w-8 h-1 bg-accent-primary rounded-b-full shadow-[0_0_8px_var(--accent-primary)]" />
            )}
            <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
