import { useState, useEffect, useRef } from 'react';

const AnimatedStatCard = ({ 
  number, 
  label, 
  cardClass, 
  numberClass, 
  labelClass,
  showProgressBar = true,
  maxValue = 100000
}) => {
  const [displayNumber, setDisplayNumber] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Extract numeric value from number string (e.g., "100K+" -> 100000)
  const extractNumericValue = (str) => {
    const match = str.match(/(\d+)/);
    if (!match) return 0;
    const num = parseInt(match[1]);
    if (str.includes('K')) return num * 1000;
    if (str.includes('M')) return num * 1000000;
    return num;
  };

  const numericValue = extractNumericValue(number);
  const progressPercentage = (numericValue / maxValue) * 100;

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counter
  useEffect(() => {
    if (!isVisible) return;

    let animationFrame;
    let currentValue = 0;
    const duration = 5000; // 5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = 1 - Math.pow(1 - progress, 2);
      currentValue = Math.floor(numericValue * easeOutQuad);

      setDisplayNumber(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, numericValue]);

  // Format display number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      const formatted = (num / 1000000).toFixed(1);
      return formatted.replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      const formatted = (num / 1000).toFixed(1);
      return formatted.replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <div 
      ref={cardRef}
      className={`home-stat-card ${cardClass}`}
      style={{
        animation: isVisible ? 'slideInUp 0.6s ease-out' : 'none',
        opacity: isVisible ? 1 : 0.8
      }}
    >
      <div className={`home-stat-number ${numberClass}`}>
        {formatNumber(displayNumber)}+
      </div>
      
      <div className={`home-stat-label ${labelClass}`}>
        {label}
      </div>
    </div>
  );
};

export default AnimatedStatCard;
