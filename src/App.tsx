import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
import { TraditionalCouncilScreen } from './screens/TraditionalCouncilScreen';

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
      {activeTab === 'traditional-council' && <TraditionalCouncilScreen />}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col scroll-touch">
          <MainScreenContent />
        </div>
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

      {/* Vercel Web Analytics & Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </AppProvider>
  );
}
