
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const StudioWorkflowDiagram: React.FC = () => {
  return (
    <div className="mt-24 w-full bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
      
      <div className="text-center mb-12 relative z-10">
         <h3 className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-widest">The Connection <span className="text-[#ff4d00]">Blueprint</span></h3>
         <p className="text-slate-400 max-w-2xl mx-auto">
           This specific signal flow is designed to eliminate technical failure points. 
           We separate audio and video recording for maximum reliability.
         </p>
      </div>

      <div className="relative z-10 w-full aspect-[4/3] md:aspect-[21/9] bg-white/[0.02] rounded-3xl border border-white/5 p-4 md:p-12 flex items-center justify-center">
         {/* Diagram SVG */}
         <svg viewBox="0 0 1000 500" className="w-full h-full drop-shadow-2xl">
            <defs>
                <marker id="arrow-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ff4d00" />
                </marker>
                 <marker id="arrow-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* --- ZONES --- */}
            {/* Subject Zone */}
            <rect x="50" y="50" width="300" height="400" rx="20" fill="white" fillOpacity="0.02" stroke="white" strokeOpacity="0.1" strokeDasharray="5 5" />
            <text x="200" y="80" textAnchor="middle" fill="white" opacity="0.3" fontSize="14" letterSpacing="2">TALENT ZONE</text>

            {/* Desk/Control Zone */}
            <rect x="400" y="50" width="550" height="400" rx="20" fill="white" fillOpacity="0.02" stroke="white" strokeOpacity="0.1" strokeDasharray="5 5" />
            <text x="675" y="80" textAnchor="middle" fill="white" opacity="0.3" fontSize="14" letterSpacing="2">CAPTURE ZONE</text>

            {/* --- AUDIO PATH (Top) --- */}
            
            {/* Node: Mic */}
            <g transform="translate(200, 150)">
               <circle r="40" fill="#111" stroke="#ff4d00" strokeWidth="2" />
               <path d="M -15 -10 L 15 -10 L 15 25 L -15 25 Z" fill="white" />
               <path d="M -15 -10 Q 0 -35 15 -10" fill="white" />
               <text x="0" y="55" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">Shure MV7+</text>
            </g>

            {/* Node: Interface */}
            <g transform="translate(500, 150)">
               <rect x="-60" y="-30" width="120" height="60" rx="8" fill="#111" stroke="white" strokeWidth="2" />
               <circle cx="-30" cy="0" r="10" fill="#333" />
               <circle cx="30" cy="0" r="10" fill="#333" />
               <text x="0" y="50" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">Focusrite 2i2</text>
            </g>

            {/* Node: Computer */}
            <g transform="translate(800, 250)">
               <rect x="-70" y="-50" width="140" height="100" rx="10" fill="#111" stroke="#ff4d00" strokeWidth="3" filter="url(#glow)" />
               <text x="0" y="5" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">COMPUTER</text>
               <text x="0" y="30" textAnchor="middle" fill="#ff4d00" fontSize="12">Recording Hub</text>
            </g>

            {/* --- VIDEO PATH (Bottom) --- */}

            {/* Node: Camera */}
            <g transform="translate(200, 350)">
               <rect x="-40" y="-30" width="80" height="60" rx="5" fill="#111" stroke="white" strokeWidth="2" />
               <circle cx="0" cy="0" r="15" fill="#333" stroke="white" strokeWidth="1" />
               <text x="0" y="50" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">Sony ZV-E10</text>
            </g>

            {/* Node: SD Card */}
            <g transform="translate(500, 350)">
               <path d="M -25 -30 L 15 -30 L 25 -20 L 25 30 L -25 30 Z" fill="#111" stroke="white" strokeWidth="2" />
               <text x="0" y="50" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">SD Card</text>
               <text x="0" y="70" textAnchor="middle" fill="#888" fontSize="12">(Internal 4K)</text>
            </g>

            {/* --- CONNECTIONS --- */}

            {/* Path: Mic -> Interface */}
            <path d="M 240 150 L 440 150" stroke="#ff4d00" strokeWidth="3" markerEnd="url(#arrow-orange)" />
            <rect x="310" y="135" width="60" height="20" rx="4" fill="#000" stroke="#ff4d00" strokeWidth="1" />
            <text x="340" y="149" textAnchor="middle" fill="#ff4d00" fontSize="10" fontWeight="bold">XLR CABLE</text>

            {/* Path: Interface -> Computer */}
            <path d="M 560 150 L 730 150 Q 800 150 800 200" stroke="#ff4d00" strokeWidth="3" fill="none" markerEnd="url(#arrow-orange)" />
            <rect x="620" y="135" width="50" height="20" rx="4" fill="#000" stroke="#ff4d00" strokeWidth="1" />
            <text x="645" y="149" textAnchor="middle" fill="#ff4d00" fontSize="10" fontWeight="bold">USB-C</text>

            {/* Path: Camera -> SD Card */}
            <path d="M 240 350 L 470 350" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow-gray)" />
            <text x="355" y="340" textAnchor="middle" fill="#64748b" fontSize="12" fontStyle="italic">Internal Recording</text>

            {/* Path: SD Card -> Computer (Sync) */}
            <path d="M 525 350 L 800 350 L 800 300" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" fill="none" markerEnd="url(#arrow-gray)" />
             <rect x="620" y="335" width="80" height="20" rx="4" fill="#000" stroke="#64748b" strokeWidth="1" />
            <text x="660" y="349" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">POST-SYNC IMPORT</text>

         </svg>
      </div>

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent opacity-30" />
    </div>
  );
};

export default StudioWorkflowDiagram;
