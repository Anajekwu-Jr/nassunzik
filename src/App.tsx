import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceSimulatorFrame } from './components/navigation/DeviceSimulatorFrame';
import { AppHeader } from './components/navigation/AppHeader';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { SplashScreen } from './components/common/SplashScreen';

import { HomeScreen } from './screens/HomeScreen';
import { AcademicsScreen } from './screens/AcademicsScreen';
import { ResourcesScreen } from './screens/ResourcesScreen';
import { DepartmentScreen } from './screens/DepartmentScreen';
import { EventsScreen } from './screens/EventsScreen';

import { SearchModal } from './components/modals/SearchModal';
import { DocumentViewerModal } from './components/modals/DocumentViewerModal';
import { CourseDetailSheet } from './components/modals/CourseDetailSheet';
import { StaffDetailSheet } from './components/modals/StaffDetailSheet';
import { NotificationSheet } from './components/modals/NotificationSheet';
import { SettingsSheet } from './components/modals/SettingsSheet';
import { AnnouncementDetailModal } from './components/modals/AnnouncementDetailModal';
import { EventDetailModal } from './components/modals/EventDetailModal';

const MainScreenContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 flex flex-col w-full max-w-md mx-auto">
      {activeTab === 'home' && <HomeScreen />}
      {activeTab === 'academics' && <AcademicsScreen />}
      {activeTab === 'resources' && <ResourcesScreen />}
      {activeTab === 'department' && <DepartmentScreen />}
      {activeTab === 'events' && <EventsScreen />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      {/* App launch splash screen with NASS logo and "powered by PhanCore" */}
      <SplashScreen />

      <DeviceSimulatorFrame>
        <AppHeader />
        <MainScreenContent />
        <BottomTabBar />

        {/* Global Overlays & Bottom Sheets */}
        <SearchModal />
        <DocumentViewerModal />
        <CourseDetailSheet />
        <StaffDetailSheet />
        <NotificationSheet />
        <SettingsSheet />
        <AnnouncementDetailModal />
        <EventDetailModal />
      </DeviceSimulatorFrame>
    </AppProvider>
  );
}
