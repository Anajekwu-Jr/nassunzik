import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, RotateCw } from 'lucide-react';

interface DeviceSimulatorFrameProps {
  children: React.ReactNode;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({ children }) => {
  const { theme } = useApp();
  const [isLandscapePhone, setIsLandscapePhone] = useState(false);
  const [layoutMetrics, setLayoutMetrics] = useState({
    isDesktopOnMobile: false,
    scale: 1,
    viewportH: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const isLight = theme === 'light';

  useEffect(() => {
    const evaluateLayout = () => {
      if (typeof window === 'undefined') return;

      const ua = navigator.userAgent || '';
      const isMobileUA = /Android|iPhone|iPod|iPad|Mobile|Silk|Kindle/i.test(ua);
      const smallestDimension = Math.min(window.screen.width, window.screen.height);
      const hasTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;

      // Check physical orientation
      const isLandscape = window.matchMedia('(orientation: landscape)').matches || (window.innerWidth > window.innerHeight && window.innerHeight < 700);
      const isShortHeight = window.innerHeight <= 600;
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

      // True if the physical hardware is a mobile/phone device
      const isPhoneDevice = isMobileUA || (hasTouch && smallestDimension <= 600);

      // Warning overlay if mobile phone is turned to landscape
      setIsLandscapePhone(isLandscape && (isShortHeight || isCoarsePointer || (hasTouch && isPhoneDevice)));

      // Detect if mobile browser has "Desktop site" toggled on:
      // In Desktop site mode on a phone, window.innerWidth is forced to 980px or 1024px.
      const isDesktopOnMobile = Boolean(isPhoneDevice && window.innerWidth > 500);

      // In desktop mode on mobile, scale the 430px container to fill the desktop-width viewport
      // so that on the phone's physical display, it occupies 100% of the screen with normal mobile proportions.
      const baseWidth = 430;
      const scale = isDesktopOnMobile ? window.innerWidth / baseWidth : 1;

      setLayoutMetrics({
        isDesktopOnMobile,
        scale,
        viewportH: window.innerHeight
      });
    };

    evaluateLayout();
    window.addEventListener('resize', evaluateLayout);
    window.addEventListener('orientationchange', evaluateLayout);
    return () => {
      window.removeEventListener('resize', evaluateLayout);
      window.removeEventListener('orientationchange', evaluateLayout);
    };
  }, []);

  return (
    <div
      className={`min-h-[100dvh] h-[100dvh] w-full flex justify-center items-start overflow-hidden ${
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
            <RotateCw
              className="w-7 h-7 text-white absolute -top-1 -right-1 animate-spin text-amber-300"
              style={{ animationDuration: '3s' }}
            />
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
          - Automatically fills full screen on phones in normal mobile mode
          - When mobile browser is placed in "Desktop site" mode, smoothly scales to fit viewport so layout remains 100% phone-portrait view
          - Centered in a phone-sized column (max-width 430px, full height) with a plain background on desktop monitors */}
      <div
        className={`w-full max-w-[430px] flex flex-col overflow-x-hidden relative shadow-2xl ${
          isLight
            ? 'bg-slate-50 text-slate-900 border-x border-slate-300'
            : 'bg-[#040b17] text-slate-100 border-x border-slate-900/80'
        }`}
        style={
          layoutMetrics.isDesktopOnMobile
            ? {
                width: '430px',
                minWidth: '430px',
                maxWidth: '430px',
                height: `${layoutMetrics.viewportH / layoutMetrics.scale}px`,
                minHeight: `${layoutMetrics.viewportH / layoutMetrics.scale}px`,
                maxHeight: `${layoutMetrics.viewportH / layoutMetrics.scale}px`,
                transform: `scale(${layoutMetrics.scale})`,
                transformOrigin: 'top center',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                overscrollBehavior: 'none',
                overscrollBehaviorX: 'none',
                touchAction: 'manipulation'
              }
            : {
                width: '100%',
                maxWidth: '430px',
                height: '100dvh',
                minHeight: '100dvh',
                maxHeight: '100dvh',
                transform: 'translateZ(0)',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                overscrollBehavior: 'none',
                overscrollBehaviorX: 'none',
                touchAction: 'manipulation'
              }
        }
      >
        {children}
      </div>
    </div>
  );
};
