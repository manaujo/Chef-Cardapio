import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { currentUser } = useApp();
  const [showLanding, setShowLanding] = React.useState(true);

  if (showLanding && !currentUser) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;