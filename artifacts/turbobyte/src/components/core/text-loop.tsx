import React, { useState, useEffect, Children } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants, Transition } from 'framer-motion';

export interface TextLoopProps {
  children: React.ReactNode;
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
}

export function TextLoop({
  children,
  className,
  interval = 2.5,
  transition = { duration: 0.3 },
  variants,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const items = Children.toArray(children);

  useEffect(() => {
    if (prefersReducedMotion || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [items.length, interval, prefersReducedMotion]);

  const defaultVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  if (prefersReducedMotion) {
    return <div className={className}>{items[currentIndex]}</div>;
  }

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants || defaultVariants}
          transition={transition}
          className="inline-block whitespace-nowrap"
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
