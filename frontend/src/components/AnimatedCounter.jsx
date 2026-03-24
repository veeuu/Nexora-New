import { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Extract the numeric part from the value (e.g., "600M+" -> 600)
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      const currentCount = Math.floor(numericValue * progress);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, trigger]);

  // Repeat animation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Extract the suffix (e.g., "M+")
  const suffix = value.replace(/[0-9]/g, '');

  return <>{count.toLocaleString()}{suffix}</>;
};

export default AnimatedCounter;
