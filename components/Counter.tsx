'use client';

import React, { useState, useEffect } from 'react';

function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = end * eased;
      if (progress >= 1) {
        setCount(end);
        return;
      }
      setCount(Math.floor(nextValue * 10) / 10);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [end, duration]);

  return <span className="font-mono font-bold">{count.toLocaleString()}{suffix}</span>;
}

export default Counter;
