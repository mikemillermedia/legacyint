
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Initialize off-screen to prevent flash
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Smooth spring animation
  const springConfig = { damping: 25, stiffness: 400, mass: 0.1 }; 
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const clickable = target.closest('button') || 
                        target.closest('a') || 
                        target.closest('[data-hover="true"]');
      setIsHovering(!!clickable);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center hidden md:flex will-change-transform"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
    >
      {/* Viewfinder / Lens Reticle Cursor */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          width: isHovering ? 60 : 40,
          height: isHovering ? 60 : 40,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Outer Ring/Corners */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-white/20"
          animate={{ 
            borderColor: isHovering ? '#ff4d00' : 'rgba(255, 255, 255, 0.2)',
            scale: isHovering ? 1 : 0.8,
            borderWidth: isHovering ? 2 : 1
          }}
        />

        {/* Crosshair Lines (Video Camera Style) */}
        <motion.div 
          className="absolute bg-white/30"
          style={{ width: 1, height: '100%' }}
          animate={{ 
            height: isHovering ? '30%' : '100%',
            opacity: isHovering ? 0 : 0.5
          }}
        />
        <motion.div 
          className="absolute bg-white/30"
          style={{ width: '100%', height: 1 }}
          animate={{ 
            width: isHovering ? '30%' : '100%',
            opacity: isHovering ? 0 : 0.5
          }}
        />

        {/* Center Recording Dot */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            width: isHovering ? 12 : 4,
            height: isHovering ? 12 : 4,
            backgroundColor: isHovering ? '#ff4d00' : '#ffffff',
          }}
        />

        {/* REC Label */}
        <motion.div
          className="absolute -top-5 bg-[#ff4d00] text-white text-[8px] font-black px-1.5 py-[1px] rounded-[2px] uppercase tracking-widest shadow-lg shadow-orange-500/20"
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: isHovering ? 1 : 0,
            y: isHovering ? -5 : 5
          }}
        >
          REC
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
