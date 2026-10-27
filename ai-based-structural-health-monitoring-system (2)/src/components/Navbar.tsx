import React from 'react';
import {
  Activity,
  Layers,
  Search,
  Radio,
  History,
  FileText,
  Settings,
  ShieldAlert,
  PlayCircle,
  Sparkles,
  Database
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTryDemo: () => void;
  hasActiveInspection: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTryDemo,
  hasActiveInspection,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analysis', label: 'Image Analysis', icon: Layers },
    { id: 'crack-map', label: 'Crack Detection', icon: Search, badge: hasActiveInspection ? 'Active' : undefined },
    { id: 'ai-documents', label: 'AI Documents', icon: Sparkles, badge: 'AI' },
    { id: 'data-mining', label: 'Data Mining', icon: Database, badge: 'Mining' },
    { id: 'iot', label: 'IoT Monitoring', icon: Radio },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner font-mono font-bold text-lg">
              SHM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-100">
                  AI-Based Structural Health Monitoring System
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  CV + IoT Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI-powered visual inspection for detecting and analyzing structural cracks and damage
              </p>
            </div>
          </div>

          {/* Quick Demo Button */}
          <div className="flex items-center gap-2">
            <button
              id="try-demo-nav-btn"
              onClick={onTryDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Run instant demo scenario"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Try Demo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/80 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                    item.badge === 'AI' 
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
