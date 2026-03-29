import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AnonRegisterPage from './pages/AnonRegisterPage';
import DashboardPage from './pages/DashboardPage';
import TherapistsPage from './pages/TherapistsPage';
import TherapistProfilePage from './pages/TherapistProfilePage';
import SessionsPage from './pages/SessionsPage';
import SessionRoomPage from './pages/SessionRoomPage';
import JournalPage from './pages/JournalPage';
import JournalEditorPage from './pages/JournalEditorPage';
import JournalViewPage from './pages/JournalViewPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourcePage from './pages/ResourcePage';
import CrisisPage from './pages/CrisisPage';
import SettingsPage from './pages/SettingsPage';
import TwoFAPage from './pages/TwoFAPage';
import AdminPage from './pages/AdminPage';
import BreathingPage from './pages/BreathingPage';

const PrivateRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireRole && user?.role !== requireRole) return <Navigate to="/dashboard" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register/anonymous" element={<PublicRoute><AnonRegisterPage /></PublicRoute>} />

        {/* Protected App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Therapists Directory */}
          <Route path="/therapists" element={<TherapistsPage />} />
          <Route path="/therapists/:id" element={<TherapistProfilePage />} />
          
          {/* Sessions */}
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/:id" element={<SessionRoomPage />} />
          
          {/* Journal */}
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/new" element={<JournalEditorPage />} />
          <Route path="/journal/:id" element={<JournalViewPage />} />
          
          {/* Resources */}
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourcePage />} />
          
          {/* Support & Breathing */}
          <Route path="/crisis" element={<CrisisPage />} />
          <Route path="/breathing" element={<BreathingPage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/2fa" element={<TwoFAPage />} />
          
          {/* Admin */}
          <Route 
            path="/admin" 
            element={<PrivateRoute requireRole="ADMIN"><AdminPage /></PrivateRoute>} 
          />
        </Route>
        
        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
