
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

const LOGOS = [
  "Kathleen Cameron Coaching",
  "Leadership LINKS",
  "The Breakdown With Jasmine Martines",
  "Sanaa Lathan"
];

const LogoWall: React.FC = () => {
  return (
    <div className="py-12 border-y border-white/5 bg-black/20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Trusted by Authority Figures</p>
      </div>
      <div className="flex gap-32 whitespace-nowrap animate-marquee">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-32 items-center justify-around min-w-full">
            {LOGOS.map((logo) => (
              <span key={logo} className="text-2xl md:text-3xl font-black text-white/20 hover:text-white/40 transition-colors uppercase tracking-tighter italic">
                {logo}
              </span>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LogoWall;
