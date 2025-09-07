import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { useAuthContext } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuthContext();
  const [showLanding, setShowLanding] = React.useState(!user);
  const [showLogin, setShowLogin] = React.useState(false);

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
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;