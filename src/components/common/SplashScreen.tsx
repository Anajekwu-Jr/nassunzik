import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDisplayTimeMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDisplayTimeMs = 2200
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, minDisplayTimeMs);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, minDisplayTimeMs + 450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [minDisplayTimeMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      aria-label="App launch splash screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-b from-[#030814] via-[#051124] to-[#040916] text-white transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top subtle decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#850b05]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top University Identity Banner */}
      <div className="relative z-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400/90 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 shadow-sm">
          UNIZIK · AWKA
        </span>
        <p className="text-[11px] text-slate-300 font-medium mt-2 tracking-wide">
          Faculty of Physical Sciences
        </p>
      </div>

      {/* Center: NASS Logo and Titles */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto animate-in zoom-in-95 fade-in duration-700">
        {/* Crest container with rich dark blue & gold border */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-600 via-amber-500 to-[#850b05] opacity-70 blur-sm animate-pulse" />
          <div className="relative w-28 h-28 rounded-full p-1 bg-[#061226] border-2 border-amber-500/60 shadow-2xl overflow-hidden flex items-center justify-center">
            <img
              src="/resources/images/nass-logo.jpg"
              alt="NASS UNIZIK Logo"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // In case image fallback is needed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* NASS & Department Titles */}
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          NASS UNIZIK
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 max-w-xs">
          National Association of Statistical Science Students
        </p>
        <p className="text-[11px] text-slate-300 font-medium mb-3">
          Department of Statistics
        </p>
        <span className="text-[10px] text-slate-400 italic">
          "Facts from Figures"
        </span>

        {/* Loading subtle indicator line */}
        <div className="w-32 h-1 bg-slate-800/80 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-[#850b05] rounded-full animate-[shimmer_1.5s_infinite] w-full" />
        </div>
      </div>

      {/* Bottom requirement: "powered by PhanCore" */}
      <div className="relative z-10 flex flex-col items-center text-center pb-2 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150">
        <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">
          powered by
        </span>
        <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-md bg-[#091b36] border border-blue-500/30 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-extrabold tracking-wider text-white">
            PhanCore
          </span>
        </div>
        <p className="text-[9px] text-slate-500 mt-2">
          Official Student Information System · UNIZIK Chapter
        </p>
      </div>
    </div>
  );
};
