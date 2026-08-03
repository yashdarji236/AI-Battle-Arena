import { useState, useEffect } from 'react';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Arena from './components/Arena';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync state with browser location (back / forward / URL change)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (target) => {
    let path = target;
    if (target === 'home' || target === '/') path = '/';
    else if (target === 'dashboard' || target === '/dashboard') path = '/dashboard';
    else if (target === 'arena' || target === '/arena') path = '/arena';

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  // Full-page standalone route matching
  if (currentPath === '/dashboard') {
    return (
      <Dashboard 
        onEnter={() => navigateTo('/arena')} 
        onNavigate={(p) => navigateTo(p)} 
      />
    );
  }

  if (currentPath === '/arena') {
    return (
      <Arena 
        onBackToHome={() => navigateTo('/')} 
        onNavigate={(p) => navigateTo(p)} 
      />
    );
  }

  // Default Home Page Route ('/')
  return (
    <Home 
      onEnter={() => navigateTo('/arena')} 
      onNavigate={(p) => navigateTo(p)} 
    />
  );
}
