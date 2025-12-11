import React, { useEffect, useState } from 'react';
import './App.css';
import Auth from './pages/Auth';
import Home from './pages/Home';
import ProfileDetail from './pages/ProfileDetail';

function App() {
  const [userId, setUserId] = useState(null);
  const [view, setView] = useState('auth'); // auth | home | profile

  useEffect(() => {
    // restore from localStorage
    const saved = localStorage.getItem('sd_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setUserId(parsed.id);
          setView('home');
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleAuth = (id) => {
    setUserId(id);
    localStorage.setItem('sd_user', JSON.stringify({ id }));
    setView('home');
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('sd_user');
    setView('auth');
  };

  const handleOpenProfile = () => setView('profile');
  const handleBackToHome = () => setView('home');

  return (
    <div className="App-root">
      {view === 'auth' && <Auth onAuth={handleAuth} />}
      {view === 'home' && (
        <Home onOpenProfile={handleOpenProfile} onLogout={handleLogout} />
      )}
      {view === 'profile' && (
        <ProfileDetail userId={userId} onBack={handleBackToHome} onAccountDeleted={handleLogout} />
      )}
    </div>
  );
}

export default App;
