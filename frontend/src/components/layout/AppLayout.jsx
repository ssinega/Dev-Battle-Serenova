import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';
import { useInactivity } from '../../hooks/useInactivity';
import { useEffect } from 'react';

export const AppLayout = () => {
  const { isAuthenticated, user, incognitoMode } = useAuthStore();
  const location = useLocation();

  // Initialize auto-logout timer
  useInactivity(5); // 5 minutes

  // Handle incognito mode blur on visibility change
  useEffect(() => {
    if (!incognitoMode) return;
    
    const handleVisibilityChange = () => {
      const root = document.getElementById('root');
      if (document.hidden) {
        root.style.filter = 'blur(10px) grayscale(50%)';
      } else {
        root.style.filter = 'none';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [incognitoMode]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle unverified user access (except setting up 2FA or verifying email)
  if (!user?.is_verified && !user?.is_anonymous && location.pathname !== '/settings') {
    // Optionally redirect to "verify email" wall
    // Proceeding to dashboard for ease of testing during development
  }

  return (
    <div className="flex min-h-screen w-full bg-bg-base text-text-primary">
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 lg:ml-[260px] pb-16 lg:pb-0 min-h-[100dvh]">
        {/* Mobile TopBar */}
        <TopBar />

        {/* Main Content Area with Page Transitions */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-8 lg:p-10 relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mx-auto max-w-6xl w-full h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
