import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface DeviceSimulatorFrameProps {
  children: React.ReactNode;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({ children }) => {
  const { deviceMode, setDeviceMode, platformStyle, setPlatformStyle, theme } = useApp();
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // On true mobile devices or when fullscreen is selected, render edge-to-edge
  if (isMobileScreen || deviceMode === 'fullscreen') {
    return (
      <div
        className={`w-full min-h-screen flex flex-col transition-colors duration-200 ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#040b17] text-slate-100'
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] py-6 px-4 flex flex-col items-center justify-start">
      {/* Device Mode Switcher Top Bar for Desktop Reviewers */}
      <aside aria-label="Device simulation mode" className="mb-4 flex items-center gap-2 bg-[#061226] border border-blue-900/50 rounded-full px-3 py-1.5 shadow-lg">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          Preview Mode:
        </span>

        <button
          type="button"
          onClick={() => {
            setDeviceMode('iphone');
            setPlatformStyle('ios');
          }}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
            deviceMode === 'iphone'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          iPhone 16 Pro (iOS)
        </button>

        <button
          type="button"
          onClick={() => {
            setDeviceMode('pixel');
            setPlatformStyle('android');
          }}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
            deviceMode === 'pixel'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Google Pixel 9 (Android)
        </button>

        <button
          type="button"
          onClick={() => setDeviceMode('fullscreen')}
          className="text-xs px-2.5 py-1 rounded-full font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
        >
          <Monitor className="w-3 h-3" />
          Full Viewport
        </button>
      </aside>

      {/* Realistic Phone Device Chassis */}
      <div
        className={`relative w-[400px] h-[850px] bg-[#071328] rounded-[50px] p-3 shadow-2xl ring-1 ring-blue-950 ${
          deviceMode === 'iphone'
            ? 'border-[10px] border-slate-900'
            : 'border-[8px] border-zinc-900 rounded-[44px]'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(11, 29, 58, 0.3)'
        }}
      >
        {/* Device Screen Area */}
        <div
          className={`relative w-full h-full rounded-[40px] overflow-hidden flex flex-col transition-colors ${
            isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#040b17] text-slate-100'
          }`}
        >
          {/* Status Bar */}
          <div
            className={`h-10 w-full px-7 flex items-center justify-between text-xs z-40 backdrop-blur select-none transition-colors ${
              isLight ? 'bg-white/95 text-slate-900 border-b border-slate-100' : 'bg-[#061226]/95 text-white'
            }`}
          >
            <span className="font-semibold tracking-tight text-[13px]">{currentTime}</span>

            {/* Dynamic Island / Camera cutout */}
            {deviceMode === 'iphone' ? (
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900/90" />
                <div className="w-2 h-2 rounded-full bg-amber-500/20" />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 bg-black rounded-full" />
            )}

            <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-white'}`} />
            </div>
          </div>

          {/* Mobile Screen Body */}
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col relative transition-colors ${
              isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#040b17] text-slate-100'
            }`}
          >
            {children}
          </div>

          {/* iOS / Android Home Indicator Bar */}
          <div
            className={`h-5 w-full flex items-center justify-center pointer-events-none z-40 transition-colors ${
              isLight ? 'bg-white/95' : 'bg-[#061226]/95'
            }`}
          >
            <div className={`w-32 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
