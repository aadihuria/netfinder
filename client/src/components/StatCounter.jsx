import React, { useState, useEffect, useRef } from 'react';

export default function StatCounter({ target, label, colorClass, suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !target) return;
    started.current = true;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return (
    <div className="stat-item">
      <div className={`stat-val${colorClass ? ' ' + colorClass : ''}`}>{val}{suffix}</div>
      <div>{label}</div>
    </div>
  );
}
