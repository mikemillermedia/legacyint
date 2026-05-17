
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "Barron D.",
    text: "Mike came over to my home and provided me with guidance on how to setup my podcast and best practices to help my video podcast get started. I have since recorded many special guests and have a radio spot at a local station."
  },
  {
    name: "Jasmine M.",
    text: "Mike came to our consult prepared with ideas that helped give birth my logo and podcast. I wasn't sure what to expect, as it wasn't a process I had gone through before. However, thanks to his curiosity and suggestions, I trusted that I had chosen the right person."
  },
  {
    name: "Iyahna B.",
    text: "Absolutely these video edits. Thanks sooo much!! So glad I got my branding together now...thanks to you. Appreciate your help!"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Client <span className="text-[#ff4d00]">Success</span></h2>
          <p className="text-slate-400">Hear from the experts who moved from hidden to highly visible.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 relative group overflow-hidden"
            >
              {/* Background Quote Watermark */}
              <Quote className="w-24 h-24 text-[#ff4d00]/20 absolute -bottom-4 -right-4 rotate-12 pointer-events-none" />
              
              <p className="text-slate-300 mb-8 leading-relaxed italic relative z-10">"{t.text}"</p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff4d00] to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                  {t.name[0]}
                </div>
                <div className="font-bold text-white tracking-wide">{t.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
