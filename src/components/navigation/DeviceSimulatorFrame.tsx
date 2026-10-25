import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, RotateCw } from 'lucide-react';

interface DeviceSimulatorFrameProps {
  children: React.ReactNode;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({ children }) => {
  const { theme } = useApp();
  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    const checkOrientation = () => {
      // Check if mobile/touch device is held in landscape mode
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isShortHeight = window.innerHeight <= 600;
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      // Trigger rotate overlay if landscape on mobile or small height
      setIsLandscapePhone(isLandscape && (isShortHeight || isCoarsePointer));
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <div
      className={`min-h-[100dvh] h-[100dvh] w-full flex justify-center items-stretch overflow-x-hidden ${
        isLight ? 'bg-slate-200' : 'bg-[#020617]'
      }`}
      style={{
        overscrollBehavior: 'none',
        overscrollBehaviorX: 'none',
        touchAction: 'manipulation'
      }}
    >
      {/* Landscape Warning Overlay for Mobile/Rotated Phones */}
      {isLandscapePhone && (
        <aside
          aria-label="Orientation notification"
          className="fixed inset-0 z-[9999] bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="relative mb-5 flex items-center justify-center">
            <Smartphone className="w-16 h-16 text-amber-400 opacity-80" />
            <RotateCw className="w-7 h-7 text-white absolute -top-1 -right-1 animate-spin text-amber-300" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-2 text-slate-100">
            Please rotate your phone to portrait
          </h2>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            NASS UNIZIK is designed for vertical portrait orientation. Turn your device upright to continue.
          </p>
        </aside>
      )}

      {/* Fixed Phone-Portrait Column:
          - Fills full screen on mobile phones (width <= 430px)
          - Centered in a phone-sized column (max-width 430px, full 100dvh height) on wide screens/desktop
          - Plain background surrounding it on desktop
          - Zero horizontal scroll, handles safe-area insets */}
      <div
        className={`w-full max-w-[430px] min-h-[100dvh] h-[100dvh] flex flex-col overflow-x-hidden relative shadow-2xl ${
          isLight ? 'bg-slate-50 text-slate-900 border-x border-slate-300' : 'bg-[#040b17] text-slate-100 border-x border-slate-900/80'
        }`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          overscrollBehavior: 'none',
          overscrollBehaviorX: 'none',
          touchAction: 'manipulation'
        }}
      >
        {children}
      </div>
    </div>
  );
};
