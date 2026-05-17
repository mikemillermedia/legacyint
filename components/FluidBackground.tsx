/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.7 + 0.3
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white will-change-[opacity,transform]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            transform: 'translateZ(0)'
          }}
          initial={{ opacity: star.opacity, scale: 1 }}
          animate={{
            opacity: [star.opacity, 1, star.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#131313]">
      
      <StarField />

      {/* Blob 1: Brand Orange/Amber */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[90vw] h-[90vw] bg-[#ff4d00] rounded-full mix-blend-soft-light filter blur-[100px] opacity-10 will-change-transform"
        animate={{
          x: [0, 30, -15, 0],
          y: [0, -15, 15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 2: Deep Slate */}
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[100vw] h-[80vw] bg-[#333] rounded-full mix-blend-screen filter blur-[120px] opacity-20 will-change-transform"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 3: Warm Glow */}
      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-[#f97316] rounded-full mix-blend-overlay filter blur-[100px] opacity-5 will-change-transform"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Static Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
      ></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black pointer-events-none" />
    </div>
  );
};

export default FluidBackground;
