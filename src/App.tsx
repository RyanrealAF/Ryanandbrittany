/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Mic2, 
  Send, 
  Check, 
  Loader2, 
  RefreshCcw, 
  Sparkles, 
  ChevronRight,
  User,
  History
} from 'lucide-react';
import { 
  generateVerseOptions, 
  generateSongAnalysis, 
  VerseOption, 
  SongAnalysis 
} from './services/gemini';

interface Verse {
  author: string;
  raw: string;
  text: string;
  num: number;
}

const TURNS = [
  { author: 'Ryan', role: 'V1', color: 'amber' },
  { author: 'Brittany', role: 'V2', color: 'rose' },
  { author: 'Ryan', role: 'V3', color: 'amber' },
  { author: 'Brittany', role: 'V4', color: 'rose' },
];

export default function App() {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<VerseOption[] | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<SongAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (options && optionsRef.current) {
      optionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [options]);

  const handleGenerateOptions = async () => {
    if (!rawInput.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setOptions(null);
    setSelectedOption(null);

    try {
      const prev = verses.map(v => ({ author: v.author, text: v.text }));
      const result = await generateVerseOptions(TURNS[currentTurn].author, rawInput, prev);
      setOptions(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate verses. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLockVerse = () => {
    if (selectedOption === null || !options) return;

    const newVerse: Verse = {
      author: TURNS[currentTurn].author,
      raw: rawInput,
      text: options[selectedOption].text,
      num: currentTurn + 1
    };

    setVerses([...verses, newVerse]);
    setOptions(null);
    setRawInput('');
    setSelectedOption(null);
    
    if (currentTurn < 3) {
      setCurrentTurn(currentTurn + 1);
    } else {
      setCurrentTurn(4); // Finished all verses
    }
  };

  const handleAnalyzeSong = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await generateSongAnalysis(verses.map(v => ({ author: v.author, text: v.text })));
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze song. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentTurn(0);
    setVerses([]);
    setRawInput('');
    setOptions(null);
    setSelectedOption(null);
    setAnalysis(null);
    setError(null);
  };

  const isRyan = TURNS[currentTurn]?.author === 'Ryan';
  const activeColor = isRyan ? 'text-amber-500' : 'text-rose-400';
  const activeBorder = isRyan ? 'border-amber-500/30' : 'border-rose-400/30';
  const activeBg = isRyan ? 'bg-amber-500/10' : 'bg-rose-400/10';

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#ffffff] font-serif selection:bg-amber-500/40">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-900/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")` }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[12px] tracking-[0.3em] text-amber-500 font-bold uppercase mb-4"
          >
            Build While Bleeding · A Co-Creation
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl md:text-6xl font-black tracking-tighter mb-4 drop-shadow-2xl"
            style={{ fontFamily: "'Abril Fatface', cursive" }}
          >
            You, me <span className="italic font-light text-[#e8e0d0]">&amp;</span> <br />
            <span className="text-amber-500">this Cherokee</span>
          </motion.h1>
          <p className="text-[#d8cdb8] italic text-sm tracking-wide font-medium">
            say it raw — the song finds what you mean
          </p>
        </header>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-12 px-2">
          {[0, 1, 2, 3, 4].map((i) => {
            const isDone = i < currentTurn;
            const isActive = i === currentTurn;
            const turn = TURNS[i];
            const isRyanStep = turn?.author === 'Ryan';

            return (
              <div key={i} className="flex flex-col items-center relative flex-1">
                {i < 4 && (
                  <div className="absolute top-4 left-[60%] w-[80%] h-[1px] bg-[#6e5e48]" />
                )}
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-[12px] font-bold transition-all duration-500 z-10
                  ${isDone ? 'bg-amber-600 border-amber-600 text-[#0a0807]' : 'bg-[#0a0807] border-[#6e5e48] text-[#d8cdb8]'}
                  ${isActive ? (isRyanStep ? 'border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'border-rose-400 text-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.6)]') : ''}
                `}>
                  {isDone ? <Check size={14} strokeWidth={3} /> : (i === 4 ? '✦' : turn.author[0])}
                </div>
                <span className={`mt-2 font-mono text-[11px] tracking-widest uppercase font-bold ${isActive ? (isRyanStep ? 'text-amber-500' : 'text-rose-400') : 'text-[#b0a090]'}`}>
                  {i === 4 ? 'Song' : turn.role}
                </span>
              </div>
            );
          })}
        </div>

        {/* Verses List */}
        <div className="space-y-6 mb-8">
          <AnimatePresence>
            {verses.map((v, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#1a1410] border border-[#5c4d3d] overflow-hidden relative shadow-2xl`}
              >
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${v.author === 'Ryan' ? 'bg-gradient-to-r from-amber-500 to-transparent' : 'bg-gradient-to-r from-rose-400 to-transparent'}`} />
                <div className="px-5 py-3 border-b border-[#5c4d3d] flex justify-between items-center bg-[#0a0807]/60">
                  <span className={`font-mono text-[11px] tracking-[0.4em] uppercase px-3 py-1 border-2 font-bold ${v.author === 'Ryan' ? 'text-amber-500 border-amber-500/60 bg-amber-500/15' : 'text-rose-400 border-rose-400/60 bg-rose-400/15'}`}>
                    {v.author}
                  </span>
                  <span className="font-mono text-[11px] text-[#d8cdb8] tracking-widest uppercase font-bold">Verse {v.num}</span>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="font-mono text-[11px] tracking-widest uppercase text-[#d8cdb8] font-bold block mb-2">Raw Input</span>
                    <p className="text-[#d8cdb8] italic text-sm leading-relaxed font-medium">"{v.raw}"</p>
                  </div>
                  <div className="h-[1px] bg-[#5c4d3d] mb-4" />
                  <div>
                    <span className={`font-mono text-[11px] tracking-widest uppercase font-bold block mb-3 ${v.author === 'Ryan' ? 'text-amber-500' : 'text-rose-400'}`}>Lyrics</span>
                    <p className="text-xl leading-[1.8] whitespace-pre-wrap tracking-wide text-[#ffffff] font-medium">{v.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Section */}
        {currentTurn < 4 && !options && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-[#1a1410] border-2 ${isRyan ? 'border-amber-500/50' : 'border-rose-400/50'} relative overflow-hidden shadow-2xl`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isRyan ? 'from-amber-500' : 'from-rose-400'} to-transparent`} />
            <div className="px-5 py-4 border-b border-[#5c4d3d] flex justify-between items-center">
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#d8cdb8] font-bold">
                {TURNS[currentTurn].role} — <span className={activeColor}>{TURNS[currentTurn].author}</span>
              </span>
              <span className="text-[#d8cdb8] italic text-[11px] font-medium">feeling · memory · anything</span>
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={currentTurn === 0 ? "Just say it. A feeling, a moment, something you saw. Don't try to make it a song — just say the thing..." : "What's it making you think of? A memory, a feeling — anything real..."}
              className="w-full bg-transparent border-none focus:ring-0 p-6 min-h-[160px] text-xl italic leading-relaxed placeholder:text-[#b0a090] resize-none text-[#ffffff] font-medium"
              disabled={isGenerating}
            />
            <div className="px-5 py-4 border-t border-[#5c4d3d] flex justify-between items-center">
              <span className="font-mono text-[11px] tracking-widest uppercase text-[#b0a090] font-bold">raw input · AI builds the verse</span>
              <button
                onClick={handleGenerateOptions}
                disabled={!rawInput.trim() || isGenerating}
                className={`flex items-center gap-3 px-6 py-3 border-2 font-mono text-[12px] tracking-[0.3em] uppercase font-bold transition-all
                  ${isRyan 
                    ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-[#0a0807] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]' 
                    : 'border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-[#0a0807] hover:shadow-[0_0_25px_rgba(251,113,133,0.6)]'}
                  disabled:opacity-20 disabled:cursor-not-allowed
                `}
              >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Make It'}
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Options Selection */}
        {options && (
          <motion.div 
            ref={optionsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1a1410] border-2 ${isRyan ? 'border-amber-500/50' : 'border-rose-400/50'} mb-8 shadow-2xl`}
          >
            <div className="px-5 py-4 border-b border-[#5c4d3d] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[11px] tracking-[0.4em] uppercase px-3 py-1 border-2 ${activeBg} ${isRyan ? 'border-amber-500/60 text-amber-500' : 'border-rose-400/60 text-rose-400'} font-bold`}>3 Options</span>
                <span className="text-[#d8cdb8] italic text-[13px] font-medium">tap the one that hits</span>
              </div>
            </div>
            
            <div className="divide-y divide-[#5c4d3d]">
              {options.map((opt, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-6 cursor-pointer transition-colors relative group ${selectedOption === idx ? activeBg : 'hover:bg-white/[0.04]'}`}
                >
                  {selectedOption === idx && (
                    <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${isRyan ? 'bg-amber-500' : 'bg-rose-400'}`} />
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] tracking-widest uppercase text-[#d8cdb8] font-bold">Option {idx + 1}</span>
                      <span className={`text-[14px] italic font-bold ${activeColor}`}>— {opt.vibe}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${selectedOption === idx 
                        ? (isRyan ? 'bg-amber-500 border-amber-500 text-[#0a0807]' : 'bg-rose-400 border-rose-400 text-[#0a0807]') 
                        : 'border-[#6e5e48] text-transparent'}
                    `}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <p className={`text-xl leading-[1.8] whitespace-pre-wrap transition-colors font-medium ${selectedOption === idx ? 'text-[#ffffff]' : 'text-[#e8e0d0]'}`}>
                    {opt.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-[#5c4d3d] flex justify-end">
              <button
                onClick={handleLockVerse}
                disabled={selectedOption === null}
                className={`flex items-center gap-3 px-6 py-3 border-2 font-mono text-[12px] tracking-[0.3em] uppercase font-bold transition-all
                  ${isRyan 
                    ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-[#0a0807]' 
                    : 'border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-[#0a0807]'}
                  disabled:opacity-20 disabled:cursor-not-allowed
                `}
              >
                Lock It In <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Final Generation Area */}
        {currentTurn === 4 && !analysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#5c4d3d]" />
              <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold">All four verses locked</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#5c4d3d]" />
            </div>
            <button
              onClick={handleAnalyzeSong}
              disabled={isAnalyzing}
              className="w-full py-8 border-2 border-amber-500 text-amber-500 font-mono text-[12px] tracking-[0.4em] uppercase font-bold flex items-center justify-center gap-4 hover:bg-amber-500 hover:text-[#0a0807] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Find the song inside these verses
            </button>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-[#1a1410] border-2 border-[#5c4d3d] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-rose-400 to-transparent" />
              <div className="px-6 py-4 border-b border-[#5c4d3d]">
                <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-amber-500 bg-amber-500/20 border-2 border-amber-500/60 px-4 py-1 font-bold">Song Analysis</span>
              </div>
              <div className="p-8 space-y-10">
                <section>
                  <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold mb-4">Narrative Arc</h3>
                  <p className="text-xl leading-relaxed text-[#e8e0d0] font-medium">{analysis.arc}</p>
                </section>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold mb-4">Core Theme</h3>
                    <p className="text-xl leading-relaxed text-[#e8e0d0] font-medium">{analysis.coreTheme}</p>
                  </section>
                  <section>
                    <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold mb-4">The Tension</h3>
                    <p className="text-xl leading-relaxed text-[#e8e0d0] font-medium">{analysis.tension}</p>
                  </section>
                </div>

                <section>
                  <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold mb-6">Hook Options</h3>
                  <div className="space-y-4">
                    {analysis.hooks.map((hook, i) => (
                      <div key={i} className="bg-black/50 border-2 border-[#5c4d3d] p-6 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-500 to-transparent" />
                        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-amber-500 font-bold mb-3">{hook.label}</div>
                        <p className="text-2xl leading-relaxed mb-3 whitespace-pre-wrap text-[#ffffff] font-bold">{hook.text}</p>
                        <p className="text-[#d8cdb8] italic text-[14px] font-medium">{hook.why}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold mb-4">Suno Style Prompt</h3>
                  <div className="bg-amber-500/20 border-2 border-amber-500/50 p-6 font-mono text-[12px] leading-relaxed text-amber-500 font-bold tracking-wide">
                    {analysis.sunoStyle}
                  </div>
                </section>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-[#5c4d3d]">
              <button 
                onClick={handleReset}
                className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#d8cdb8] font-bold hover:text-[#ffffff] transition-colors flex items-center gap-3 mx-auto"
              >
                <RefreshCcw size={14} /> Start a New Session
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-rose-500/25 border-2 border-rose-500/60 text-rose-400 font-mono text-[12px] tracking-widest uppercase font-bold text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
