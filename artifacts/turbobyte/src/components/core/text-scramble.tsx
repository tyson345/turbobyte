import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface TextScrambleProps {
  children: string;
  className?: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  trigger?: boolean;
  onScrambleComplete?: () => void;
}

const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

export function TextScramble({
  children,
  className,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  as: Component = 'span',
  trigger = true,
  onScrambleComplete,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children);
  const prefersReducedMotion = useReducedMotion();
  const isAnimating = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(children);
      return;
    }

    if (!trigger) {
      return;
    }

    let iteration = 0;
    isAnimating.current = true;
    
    const frameRate = speed * 1000;
    const maxIterations = (duration * 1000) / frameRate;
    
    const scramble = () => {
      setDisplayText(() => {
        const textArray = children.split('');
        const scrambled = textArray.map((char, index) => {
          if (char === ' ') return ' ';
          if (index < (iteration / maxIterations) * children.length) {
            return children[index];
          }
          return characterSet[Math.floor(Math.random() * characterSet.length)];
        });
        
        return scrambled.join('');
      });
      
      iteration++;
      
      if (iteration >= maxIterations) {
        setDisplayText(children);
        isAnimating.current = false;
        onScrambleComplete?.();
      } else {
        timeoutRef.current = setTimeout(scramble, frameRate);
      }
    };
    
    timeoutRef.current = setTimeout(scramble, frameRate);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [children, duration, speed, characterSet, trigger, prefersReducedMotion]);

  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
}
