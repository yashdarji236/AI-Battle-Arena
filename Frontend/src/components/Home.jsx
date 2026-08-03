import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

// Import subcomponents
import DriftingClouds from './landing/DriftingClouds';
import CustomCursor from './landing/CustomCursor';
import Topbar from './landing/Topbar';
import Hero from './landing/Hero';
import BentoGrid from './landing/BentoGrid';
import CombatStream from './landing/CombatStream';
import FeaturesTrack from './landing/FeaturesTrack';
import DiffComparison from './landing/DiffComparison';
import FaqAccordion from './landing/FaqAccordion';
import SandboxStage from './landing/SandboxStage';
import Footer from './landing/Footer';

// Helper to draw horizontal tape measure ruler on canvas
const drawRuler = (cv, scrollY) => {
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  const h = cv.clientHeight;

  // Set canvas dimension based on device pixel ratio for sharp rendering
  if (cv.width !== w * dpr || cv.height !== h * dpr) {
    cv.width = w * dpr;
    cv.height = h * dpr;
  }

  const ctx = cv.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  ctx.font = '9px "Space Mono", ui-monospace, monospace';
  ctx.lineWidth = 1;

  const offset = -scrollY;
  // Start drawing ticks from a multiple of 10 that matches the scroll position
  const startX = Math.floor(scrollY / 10) * 10;

  for (let x = startX; x <= startX + w + 50; x += 10) {
    const drawX = x + offset;
    const maj = (x % 100 === 0);
    ctx.strokeStyle = maj ? 'rgba(241, 246, 250, 0.4)' : 'rgba(241, 246, 250, 0.18)';
    ctx.beginPath();
    ctx.moveTo(drawX + 0.5, h);
    ctx.lineTo(drawX + 0.5, maj ? h - 12 : (x % 50 === 0 ? h - 8 : h - 5));
    ctx.stroke();

    if (maj && drawX > 0 && drawX < w) {
      ctx.fillStyle = 'rgba(241, 246, 250, 0.55)';
      ctx.fillText(x, drawX + 3, h - 14);
    }
  }
  ctx.restore();
};

export default function Home({ onEnter, onNavigate }) {
  const [matterLoaded, setMatterLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [istHour, setIstHour] = useState(12);

  const rulerTopRef = useRef(null);

  // Dynamic day-night cycles (IST clocks) and Matter.js library loaders
  useEffect(() => {
    // Matter.js library loader
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
    script.async = true;
    script.onload = () => setMatterLoaded(true);
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch (_) { }
    };
  }, []);

  // Time Clocks (IST Clocks)
  useEffect(() => {
    const pad = (n) => (n < 10 ? '0' : '') + n;
    const updateTime = () => {
      const d = new Date();
      // IST is UTC + 5:30
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (3600000 * 5.5));
      const hours = ist.getHours();
      const mins = ist.getMinutes();
      const secs = ist.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      setIstHour(hours);
      setCurrentTime(`${pad(displayHours)}:${pad(mins)}:${pad(secs)} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Page Scroll Listeners for the top tape measure ruler
  useEffect(() => {
    const handleScroll = () => {
      drawRuler(rulerTopRef.current, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Initial draw
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="om-theme-wrapper">
      {/* Drifting Clouds Background */}
      <DriftingClouds />

      {/* Ticks Tape Measure Header Ruler */}


      {/* Navigation Topbar */}
      <Topbar onEnter={onEnter} onNavigate={onNavigate} currentView="home" />

      {/* Hero Section */}
      <Hero onEnter={onEnter} />

      {/* Bento Grid */}
      <BentoGrid />

      {/* Combat Slack-like logs stream */}
      <CombatStream />

      {/* Horizontal panning services features track */}
      <FeaturesTrack />

      {/* Top Contenders & Us vs Them Comparison */}
      <DiffComparison onEnter={onEnter} onNavigate={onNavigate} />

      {/* Collapsible FAQ Panels */}
      <FaqAccordion />

      {/* Matter.js Drop Sandbox Playground */}
      <SandboxStage matterLoaded={matterLoaded} />

      {/* Clocks Footer */}
      <Footer currentTime={currentTime} istHour={istHour} onEnter={onEnter} />

      {/* LERP custom cursor */}
      <CustomCursor />
    </div>
  );
}
