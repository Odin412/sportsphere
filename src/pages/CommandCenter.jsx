import React, { useState, lazy, Suspense } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Bot, Users, BarChart3, Gauge, ScrollText, HeartPulse,
  ChevronRight,
} from 'lucide-react';

const OverviewDashboard = lazy(() => import('@/components/command-center/OverviewDashboard'));
const BotSquadPanel = lazy(() => import('@/components/command-center/BotSquadPanel'));
const UserManagement = lazy(() => import('@/components/command-center/UserManagement'));
const AppAnalytics = lazy(() => import('@/components/command-center/AppAnalytics'));
const PerformancePanel = lazy(() => import('@/components/command-center/PerformancePanel'));
const MaintenanceLogs = lazy(() => import('@/components/command-center/MaintenanceLogs'));
const SystemHealth = lazy(() => import('@/components/command-center/SystemHealth'));

const SECTIONS = [
  { key: 'overview',     label: 'Overview',     icon: LayoutDashboard },
  { key: 'bots',         label: 'Bot Squad',    icon: Bot },
  { key: 'users',        label: 'Users',        icon: Users },
  { key: 'analytics',    label: 'Analytics',    icon: BarChart3 },
  { key: 'performance',  label: 'Performance',  icon: Gauge },
  { key: 'maintenance',  label: 'Maintenance',  icon: ScrollText },
  { key: 'health',       label: 'System Health', icon: HeartPulse },
];

const SectionLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-6 h-6 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

export default function CommandCenter() {
  const { user, isLoadingAuth } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // Wait for auth to resolve before making access decisions
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Admin guard — reject non-admin and unauthenticated users
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':    return <OverviewDashboard />;
      case 'bots':        return <BotSquadPanel />;
      case 'users':       return <UserManagement />;
      case 'analytics':   return <AppAnalytics />;
      case 'performance': return <PerformancePanel />;
      case 'maintenance': return <MaintenanceLogs />;
      case 'health':      return <SystemHealth />;
      default:            return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Command Center</h1>
              <p className="text-[11px] text-gray-500 leading-none">Sportsphere Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">{user?.email}</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] font-semibold uppercase">Admin</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Sidebar nav */}
        <nav className="hidden md:flex flex-col w-52 flex-shrink-0 border-r border-gray-800/40 min-h-[calc(100vh-52px)] py-3 px-2">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left mb-0.5 ${
                activeSection === key
                  ? 'bg-blue-600/15 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {activeSection === key && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        {/* Mobile tab bar */}
        <div className="md:hidden flex overflow-x-auto border-b border-gray-800/40 px-2 gap-1 py-2 scrollbar-hide">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === key
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          <Suspense fallback={<SectionLoader />}>
            {renderSection()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
