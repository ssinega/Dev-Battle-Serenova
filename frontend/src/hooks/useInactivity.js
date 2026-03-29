import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

export const useInactivity = (timeoutMinutes = 5) => {
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeout;
    
    // Auto logout handler
    const handleInactivity = async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // ignore errors on logout
      }
      logout();
      toast('You were logged out due to inactivity', { icon: '🔒' });
    };

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(handleInactivity, timeoutMinutes * 60 * 1000);
    };

    // Initial timer
    resetTimer();

    // Listen to user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    return () => {
      if (timeout) clearTimeout(timeout);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, logout, timeoutMinutes]);
};
