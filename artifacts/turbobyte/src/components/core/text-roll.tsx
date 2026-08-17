import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

export interface TextRollProps {
  children: string;
  className?: string;
  variants?: {
    enter: { initial: any; animate: any };
    exit: { initial: any; animate: any };
  };
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  onAnimationComplete?: () => void;
}

export function TextRoll({
  children,
  className,
  variants,
  duration = 0.5,
  getEnterDelay = (i) => i * 0.05,
  onAnimationComplete,
}: TextRollProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <span className={className}>{children}</span>;
  }

  const defaultVariants = {
    initial: { y: '100%', rotateX: -90, opacity: 0 },
    animate: { y: 0, rotateX: 0, opacity: 1 },
  };

  const activeVariants = variants?.enter || defaultVariants;

  return (
    <span className={`inline-flex overflow-hidden ${className || ''}`} style={{ perspective: '1000px' }}>
      {children.split('').map((char, index) => (
        <motion.span
          key={index}
          initial="initial"
          animate="animate"
          variants={activeVariants}
          transition={{
            duration,
            delay: getEnterDelay(index),
            ease: [0.33, 1, 0.68, 1], // easeOutCubic
          }}
          onAnimationComplete={index === children.length - 1 ? onAnimationComplete : undefined}
          className="inline-block whitespace-pre"
          style={{ transformOrigin: '50% 50% -20px' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
