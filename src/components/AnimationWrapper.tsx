import React, { useEffect, useRef, useState } from 'react';

interface AnimationWrapperProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounceIn';
  delay?: number;
  className?: string;
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'slideInLeft':
        return 'animate-slide-in-left';
      case 'slideInRight':
        return 'animate-slide-in-right';
      case 'scaleIn':
        return 'animate-scale-in';
      case 'bounceIn':
        return 'animate-bounce-in';
      default:
        return 'animate-fade-in-up';
    }
  };

  return (
    <div
      ref={ref}
      className={`${className} ${
        isVisible ? getAnimationClass() : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};

export default AnimationWrapper;