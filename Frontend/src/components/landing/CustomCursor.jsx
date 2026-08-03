import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isTouchOrMobile, setIsTouchOrMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 1024 || 
                       window.matchMedia('(pointer: coarse)').matches || 
                       'ontouchstart' in window;
      setIsTouchOrMobile(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isTouchOrMobile) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const nameEl = cursor.querySelector('.name');
      const isInTopbar = target.closest('.topbar');
      const yc = target.closest('.ph-yc');
      const w = target.closest('.witem');
      const a = !isInTopbar && target.closest('a, button, .btn, .layer, .cta, .pill, .fx-head, .foot-totop');

      if (yc) {
        cursor.classList.add('hot');
        if (nameEl) {
          nameEl.textContent = 'the flex';
          nameEl.style.backgroundColor = '#F0531C';
        }
      } else if (w) {
        cursor.classList.add('hot');
        if (nameEl) {
          nameEl.textContent = 'view';
          nameEl.style.backgroundColor = '#F0531C';
        }
      } else if (a) {
        cursor.classList.add('hot');
        if (nameEl) {
          nameEl.textContent = 'click';
          nameEl.style.backgroundColor = '#0D99FF';
        }
      } else {
        cursor.classList.remove('hot');
        if (nameEl) {
          nameEl.textContent = 'You';
          nameEl.style.backgroundColor = '#0D99FF';
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    let raf;
    const updateCursor = () => {
      const dx = mouseX - curX;
      const dy = mouseY - curY;
      curX += dx * 0.25;
      curY += dy * 0.25;

      cursor.style.transform = `translate(${curX}px, ${curY}px)`;

      raf = requestAnimationFrame(updateCursor);
    };
    raf = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(raf);
    };
  }, [isTouchOrMobile]);

  if (isTouchOrMobile) {
    return null;
  }

  return (
    <div ref={cursorRef} className="fcursor" style={{ transform: 'translate(-100px, -100px)' }}>
      <svg viewBox="0 0 24 24">
        <path d="M5 3l14 7-6 2-2 6z" fill="#0D99FF" stroke="#fff" strokeWidth="1.2" />
      </svg>
      <span className="name" style={{ backgroundColor: '#0D99FF' }}>You</span>
    </div>
  );
}
