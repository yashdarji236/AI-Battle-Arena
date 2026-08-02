import { useState } from 'react';
import Home from './components/Home';
import Arena from './components/Arena';

export default function App() {
  const [view, setView] = useState('home');

  if (view === 'home') {
    return <Home onEnter={() => setView('arena')} />;
  }

  return <Arena onBackToHome={() => setView('home')} />;
}
