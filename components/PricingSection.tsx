import React from 'react';
import { Target, Music, Video, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PricingSection() {
  return (
    <section className="bg-[#F3F3F1] py-24 px-4 md:px-10">
      <div className="max-w-7xl mx-auto bg-[#1A1614] rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl">
        
        {/* TOP HEADER AREA */}
        <div className="p-8 md:p-20 text-center border-b border-white/5">
          <h2 className="text-4xl md:text-7xl font-[1000] uppercase tracking-tighter leading-[0.85] text-white mb-8">
            RISE IN YOUR PURPOSE.<br />
            <span className="text-[#FF5106]">RENDER YOUR CALLING.</span>
          </h2>
          
          <div className="max-w-3xl mx-auto flex gap-6 text-left border-l-4 border-[#FF5106] pl-6 py-2">
            <p className="text-zinc-400 text-lg md:text-xl italic leading-relaxed">
              "This is a community built primarily for creatives representing Christ. We are here to help you master the tools of the trade so you can share your message with excellence."
            </p>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-20">
          
          {/* LEFT COLUMN: STRATEGY SESSION */}
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">
                The 30-Minute Strategy Session
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                In this complimentary session, we aren't just going to talk about cameras and microphones. 
                We are going to audit your current brand visibility and identify exactly how a video podcast 
                can become a lead-generating engine for your business. On this call, we will:
              </p>
            </div>

            {/* FEATURE LIST */}
            <div className="space-y-10">
              <StrategyFeature 
                icon={<Target className="text-[#FF5106]" />}
                title="Clarify Your Content Goals"
                desc="Are we building widespread fame, deep audience trust, or a direct sales pipeline? We build the strategy to match the goal."
              />
              <StrategyFeature 
                icon={<Music className="text-[#FF5106]" />}
                title="Establish Your Sonic Brand"
                desc="Explore incorporating custom music produced by Mike Miller to give your show a 100% unique, premium audio identity."
              />
              <StrategyFeature 
                icon={<Video className="text-[#FF5106]" />}
                title="Visualize Your Set"
                desc="Choose between Modern Industrial or Light & Airy vibes to ensure your visual brand matches your message."
              />
            </div>

            <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF5106] hover:text-white transition-all flex items-center gap-3">
              Book Free Strategy Session <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT COLUMN: THE FRAMEWORK CARD */}
          <div className="bg-[#111111]/50 rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-inner">
            <div className="mb-10">
              <div className="flex items-center gap-2 text-[#FF5106] mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-sm">The "Rise" Framework</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pricing starts at <span className="text-white font-bold">$1,500/month</span>. 
                We audit your unique needs to design the exact blueprint required to scale your business. 
                Explore our core tiers:
              </p>
            </div>

            {/* TIER LIST */}
            <div className="space-y-6">
              <FrameworkTier 
                num="I" 
                name="The Ascent" 
                price="$1,500/mo"
                items={["Up to 3 hours studio time", "2 Long-form 4K videos + 4 Social Clips", "Standard thumbnails & YT Management"]}
              />
              <FrameworkTier 
                num="II" 
                name="The Summit" 
                price="$3,000/mo"
                items={["Up to 5 hours studio time", "4 Long-form 4K videos + 12 Social Clips", "Advanced YouTube Management"]}
              />
              <FrameworkTier 
                num="III" 
                name="The Horizon" 
                price="$5,000/mo"
                items={["Up to 8 hours (Batch Days!)", "8 Long-form 4K videos + 20 Social Clips", "In-Depth Strategy & Premier Support"]}
              />
            </div>

            <button className="w-full mt-10 bg-[#FF5106] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all">
              Apply For Retainer
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

// Helper Component for the Left Side
function StrategyFeature({ icon, title, desc }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="bg-[#241F1D] p-4 rounded-2xl">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Helper Component for the Right Side Card
function FrameworkTier({ num, name, price, items }) {
  return (
    <div className="bg-[#1A1614] p-6 rounded-2xl border border-white/5 hover:border-[#FF5106]/30 transition-all group">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-black uppercase tracking-tight text-lg italic">
          {num}. {name}
        </h4>
        <span className="text-[#FF5106] font-bold text-xs">{price}</span>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-zinc-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#FF5106] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
