import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth.tsx';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import ContentCalendar from './pages/ContentCalendar';
import MediaLibrary from './pages/MediaLibrary';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';
import SocialAccounts from './pages/SocialAccounts';
import Login from './pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="generate" element={<ContentGenerator />} />
        <Route path="calendar" element={<ContentCalendar />} />
        <Route path="templates" element={<Templates />} />
        <Route path="accounts" element={<SocialAccounts />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
