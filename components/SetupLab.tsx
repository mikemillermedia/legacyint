
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Trash2, ArrowRight, Loader2, Sparkles, MessageSquareWarning } from 'lucide-react';
import { critiqueSetup } from '../services/geminiService';

const SetupLab: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [critique, setCritique] = useState<string | null>(null);
  const [answers, setAnswers] = useState({
    frustration: '',
    time: '',
    hate: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    const result = await critiqueSetup(image, answers);
    setCritique(result);
    setIsAnalyzing(false);
    setStep(4);
  };

  const reset = () => {
    setImage(null);
    setStep(0);
    setCritique(null);
    setAnswers({ frustration: '', time: '', hate: '' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-[#ff4d00]" />
          <h3 className="text-2xl font-bold uppercase tracking-widest">The Setup Lab</h3>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-12"
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md mx-auto aspect-video border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4d00]/50 hover:bg-[#ff4d00]/5 transition-all group"
              >
                <Upload className="w-12 h-12 text-slate-500 mb-4 group-hover:text-[#ff4d00] transition-colors" />
                <p className="text-slate-400 font-medium">Upload a photo of your current setup</p>
                <p className="text-slate-600 text-xs mt-2">I'll point out exactly where your friction is coming from.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </motion.div>
          )}

          {(step >= 1 && step <= 3) && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                <img src={image!} alt="Your setup" className="w-full h-full object-cover opacity-60" />
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="mb-8">
                  <span className="text-[#ff4d00] text-xs font-bold tracking-widest uppercase mb-2 block">Step {step} of 3</span>
                  {step === 1 && (
                    <>
                      <h4 className="text-2xl font-bold mb-4">What's your single biggest frustration right now?</h4>
                      <div className="space-y-3">
                        {['Consistency', 'Quality', 'Editing Time', 'Technical Setup'].map(opt => (
                          <button 
                            key={opt}
                            onClick={() => { setAnswers({...answers, frustration: opt}); nextStep(); }}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${answers.frustration === opt ? 'bg-[#ff4d00] border-[#ff4d00]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h4 className="text-2xl font-bold mb-4">How long does it take you to go from "Idea" to "Hitting Record"?</h4>
                      <input 
                        autoFocus
                        type="text"
                        placeholder="e.g. 45 minutes of cable hunting..."
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-[#ff4d00] mb-6"
                        value={answers.time}
                        onChange={(e) => setAnswers({...answers, time: e.target.value})}
                      />
                      <button onClick={nextStep} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h4 className="text-2xl font-bold mb-4">Which piece of gear do you feel most "unreliable"?</h4>
                      <input 
                        autoFocus
                        type="text"
                        placeholder="e.g. My flickering ring light..."
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-[#ff4d00] mb-6"
                        value={answers.hate}
                        onChange={(e) => setAnswers({...answers, hate: e.target.value})}
                      />
                      <button onClick={handleSubmit} className="bg-[#ff4d00] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2">
                        Analyze My Chaos <Sparkles className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="critique"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6"
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-[#ff4d00] animate-spin" />
                  <p className="text-[#ff4d00] font-bold animate-pulse">Running Diagnostic on Setup Efficiency...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                   <div className="md:col-span-5">
                      <div className="rounded-2xl overflow-hidden border border-[#ff4d00]/30 shadow-[0_0_20px_rgba(255,77,0,0.15)]">
                        <img src={image!} alt="Your setup" className="w-full h-auto" />
                      </div>
                      <button onClick={reset} className="mt-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm">
                        <Trash2 className="w-4 h-4" /> Start Over
                      </button>
                   </div>
                   <div className="md:col-span-7">
                      <div className="flex items-center gap-2 text-[#ff4d00] mb-4">
                        <MessageSquareWarning className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest text-sm">Strategic Critique</span>
                      </div>
                      <div className="prose prose-invert prose-orange max-w-none">
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {critique}
                        </div>
                      </div>
                      <div className="mt-8 p-6 bg-[#ff4d00]/10 border border-[#ff4d00]/30 rounded-2xl">
                        <p className="text-sm italic text-orange-200">
                          "Optimization isn't about more gear. It's about removing the gear that makes you think too much."
                        </p>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SetupLab;
