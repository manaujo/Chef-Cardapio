import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { SuccessPage } from './components/SuccessPage';
import { PublicMenuPage } from './components/PublicMenuPage';
import { useAuthContext } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuthContext();
  const [showLanding, setShowLanding] = React.useState(!user);
  const [showLogin, setShowLogin] = React.useState(false);

  // Forçar limpeza se não há usuário mas há dados em localStorage
  React.useEffect(() => {
    if (!user && !loading) {
      try {
        const hasStoredData = localStorage.getItem('supabase.auth.token') || 
                             sessionStorage.getItem('supabase.auth.token');
        if (hasStoredData) {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (error) {
        console.warn('Could not check/clear storage:', error);
      }
    }
  }, [user, loading]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  // If showing landing page
  if (showLanding && !showLogin) {
    return (
      <LandingPage 
        onGetStarted={() => {
          setShowLanding(false);
          setShowLogin(false);
        }}
        onLogin={() => {
          setShowLanding(false);
          setShowLogin(true);
        }}
      />
    );
  }

  // If showing login page
  if (showLogin) {
    return (
      <Login 
        onBack={() => {
          setShowLanding(true);
          setShowLogin(false);
        }}
      />
    );
  }

  // Default to login
  return (
    <Login 
      onBack={() => {
        setShowLanding(true);
        setShowLogin(false);
      }}
    />
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public menu route */}
          <Route path="/menu/:restaurantId" element={<PublicMenuRoute />} />
          
          {/* Success page route */}
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Main app routes */}
          <Route path="/*" element={
            <AppProvider>
              <AppContent />
            </AppProvider>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function PublicMenuRoute() {
  const params = new URLSearchParams(window.location.search);
  const restaurantId = window.location.pathname.split('/menu/')[1];
  
  return <PublicMenuPage restaurantId={restaurantId} />;
}

export default App;