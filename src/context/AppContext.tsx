import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicLevel,
  SemesterNumber,
  Course,
  CourseResource,
  StaffMember,
  Executive,
  EventItem,
  Announcement
} from '../types';

export type TabType = 'home' | 'academics' | 'resources' | 'department' | 'events';
export type PlatformStyle = 'ios' | 'android';
export type DeviceSimulatorMode = 'iphone' | 'pixel' | 'fullscreen';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedLevel: AcademicLevel;
  setSelectedLevel: (lvl: AcademicLevel) => void;
  selectedSemester: SemesterNumber;
  setSelectedSemester: (sem: SemesterNumber) => void;
  platformStyle: PlatformStyle;
  setPlatformStyle: (p: PlatformStyle) => void;
  deviceMode: DeviceSimulatorMode;
  setDeviceMode: (d: DeviceSimulatorMode) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  isOnline: boolean;
  
  // Overlays
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  installModalOpen: boolean;
  setInstallModalOpen: (open: boolean) => void;
  samOpen: boolean;
  setSamOpen: (open: boolean) => void;
  samInitialCourse: string | null;
  setSamInitialCourse: (code: string | null) => void;
  
  // Selected Detail Models
  activeCourse: Course | null;
  setActiveCourse: (c: Course | null) => void;
  activeStaff: StaffMember | null;
  setActiveStaff: (s: StaffMember | null) => void;
  activeResource: CourseResource | null;
  setActiveResource: (r: CourseResource | null) => void;
  activeEvent: EventItem | null;
  setActiveEvent: (e: EventItem | null) => void;
  activeAnnouncement: Announcement | null;
  setActiveAnnouncement: (a: Announcement | null) => void;
  
  // Bookmarks
  bookmarkedCourses: number[];
  toggleBookmarkCourse: (id: number) => void;
  bookmarkedResources: number[];
  toggleBookmarkResource: (id: number) => void;

  // Haptic feedback simulation
  triggerHaptic: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabType>('home');
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel>(100);
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber>(1);
  const [platformStyle, setPlatformStyle] = useState<PlatformStyle>('ios');
  const [deviceMode, setDeviceMode] = useState<DeviceSimulatorMode>(() => {
    // If running on a phone/touchscreen screen width < 768, default to fullscreen!
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'fullscreen';
    }
    return 'iphone';
  });
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('nass_app_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const setTheme = (t: 'dark' | 'light') => {
    triggerHaptic();
    setThemeState(t);
    try {
      localStorage.setItem('nass_app_theme', t);
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      } else {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
        document.body.style.backgroundColor = '#040a17';
        document.body.style.color = '#f1f5f9';
      }
    }
  }, [theme]);

  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Overlays
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [samOpen, setSamOpen] = useState(false);
  const [samInitialCourse, setSamInitialCourse] = useState<string | null>(null);

  // Detail Sheet States
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);
  const [activeResource, setActiveResource] = useState<CourseResource | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  // Bookmarks
  const [bookmarkedCourses, setBookmarkedCourses] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('stats_app_bookmarked_courses');
      return saved ? JSON.parse(saved) : [1, 5];
    } catch {
      return [1, 5];
    }
  });

  const [bookmarkedResources, setBookmarkedResources] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('stats_app_bookmarked_resources');
      return saved ? JSON.parse(saved) : [101];
    } catch {
      return [101];
    }
  });

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Ignore
    }
  };

  const setActiveTab = (tab: TabType) => {
    triggerHaptic();
    setActiveTabState(tab);
    // Scroll window/container to top on tab switch
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggleBookmarkCourse = (id: number) => {
    triggerHaptic();
    setBookmarkedCourses(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('stats_app_bookmarked_courses', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleBookmarkResource = (id: number) => {
    triggerHaptic();
    setBookmarkedResources(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('stats_app_bookmarked_resources', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedLevel,
        setSelectedLevel,
        selectedSemester,
        setSelectedSemester,
        platformStyle,
        setPlatformStyle,
        deviceMode,
        setDeviceMode,
        theme,
        setTheme,
        isOnline,
        searchOpen,
        setSearchOpen,
        notificationsOpen,
        setNotificationsOpen,
        settingsOpen,
        setSettingsOpen,
        installModalOpen,
        setInstallModalOpen,
        samOpen,
        setSamOpen,
        samInitialCourse,
        setSamInitialCourse,
        activeCourse,
        setActiveCourse,
        activeStaff,
        setActiveStaff,
        activeResource,
        setActiveResource,
        activeEvent,
        setActiveEvent,
        activeAnnouncement,
        setActiveAnnouncement,
        bookmarkedCourses,
        toggleBookmarkCourse,
        bookmarkedResources,
        toggleBookmarkResource,
        triggerHaptic
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
