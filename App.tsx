
import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  TrendingUp, 
  Settings, 
  BarChart3, 
  Rocket, 
  Calendar, 
  Bell, 
  LogOut,
  Layers,
  FileText,
  GanttChart,
  Package,
  CheckCircle2,
  Info,
  AlertCircle,
  X,
  Maximize,
  Minimize,
  Calculator,
  Zap,
  History
} from 'lucide-react';
import Chessboard from './components/Chessboard';
import PricingSimulator from './components/analytics/PricingSimulator';
import DemandStimulator from './components/analytics/DemandStimulator';
import Dashboard from './components/Dashboard';
import GroupingManager from './components/settings/GroupingManager';
import SalesPlanManager from './components/settings/SalesPlanManager';
import RulesEngine from './components/settings/RulesEngine';
import HistoryManager from './components/settings/HistoryManager';
import ReevaluationManager from './components/settings/ReevaluationManager';
import AssortmentManager from './components/settings/AssortmentManager';
import StartSalesPricing from './components/StartSalesPricing';

enum AppTab {
  SETTINGS = 'settings',
  REEVALUATION = 'reevaluation',
  ASSORTMENT = 'assortment',
  ANALYTICS = 'analytics',
  START_SALES = 'start_sales'
}

enum AnalyticsSubTab {
  DASHBOARD = 'dashboard',
  DEMAND_STIMULATOR = 'demand_stimulator',
  PRICING_SIMULATOR = 'pricing_simulator'
}

enum SettingsSubTab {
  GROUPING = 'grouping',
  SALES_PLAN = 'sales_plan',
  RULES = 'rules',
  LOGS = 'logs'
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.START_SALES);
  const [settingsTab, setSettingsTab] = useState<SettingsSubTab>(SettingsSubTab.GROUPING);
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsSubTab>(AnalyticsSubTab.DASHBOARD);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleNotify = (e: any) => {
      const { message, type = 'success' } = e.detail;
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('app-notify' as any, handleNotify);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('app-notify' as any, handleNotify);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderSettings = () => (
    <div className="flex flex-col gap-6">
      <div className="flex border-b border-slate-200 gap-8">
        {[
          { id: SettingsSubTab.GROUPING, label: 'Группировка', icon: Layers },
          { id: SettingsSubTab.SALES_PLAN, label: 'План продаж', icon: GanttChart },
          { id: SettingsSubTab.RULES, label: 'Создание правил', icon: FileText },
          { id: SettingsSubTab.LOGS, label: 'История', icon: History },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all border-b-2 ${
              settingsTab === tab.id 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {settingsTab === SettingsSubTab.GROUPING && <GroupingManager />}
        {settingsTab === SettingsSubTab.SALES_PLAN && <SalesPlanManager />}
        {settingsTab === SettingsSubTab.RULES && <RulesEngine />}
        {settingsTab === SettingsSubTab.LOGS && <HistoryManager />}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.START_SALES:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ценообразование для старта продаж</h1>
              </div>
            </div>
            <StartSalesPricing />
          </div>
        );
      case AppTab.REEVALUATION:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-700">Модуль переоценки</h1>
            </div>
            <ReevaluationManager />
          </div>
        );
      case AppTab.ASSORTMENT:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-700">Работа с резервами</h1>
            </div>
            <AssortmentManager />
          </div>
        );
      case AppTab.SETTINGS:
        return renderSettings();
      case AppTab.ANALYTICS:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Аналитика</h1>
              </div>
            </div>
            <div className="flex border-b border-slate-200 gap-8">
              {[
                { id: AnalyticsSubTab.DASHBOARD, label: 'Панель управления', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAnalyticsTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all border-b-2 ${
                    analyticsTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              {analyticsTab === AnalyticsSubTab.DASHBOARD && <Dashboard />}
            </div>
          </div>
        );
      default:
        return <div className="flex items-center justify-center h-96 text-slate-400">Модуль находится в разработке</div>;
    }
  };

  const mainContent = (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Global Notifications Container */}
      <div className="fixed top-24 right-8 z-[1000] flex flex-col gap-3 w-80 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`pointer-events-auto animate-in slide-in-from-right duration-500 bg-white border-l-4 rounded-2xl p-4 shadow-2xl flex items-start gap-3 ${
              n.type === 'success' ? 'border-success' : n.type === 'error' ? 'border-danger' : 'border-primary'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              n.type === 'success' ? 'bg-success/10' : n.type === 'error' ? 'bg-danger/10' : 'bg-primary/10'
            }`}>
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-danger" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-slate-800 leading-tight mb-0.5">
                {n.type === 'success' ? 'Успешно' : n.type === 'error' ? 'Ошибка' : 'Информация'}
              </p>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {[
              { id: AppTab.SETTINGS, label: 'Общие настройки', icon: Settings },
              { id: AppTab.REEVALUATION, label: 'Переоценка', icon: TrendingUp },
              { id: AppTab.ASSORTMENT, label: 'Работа с резервами', icon: Package },
              { id: AppTab.ANALYTICS, label: 'Аналитика', icon: BarChart3 },
              { id: AppTab.START_SALES, label: 'ДЦО для старта продаж', icon: Rocket },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                  ? 'text-primary bg-blue-50' 
                  : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-primary transition rounded-xl hover:bg-slate-50"
            title={isFullscreen ? "Выйти из полноэкранного режима" : "Развернуть на весь экран"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button className="relative p-2 text-slate-400 hover:text-primary transition rounded-xl hover:bg-slate-50">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">{renderContent()}</main>
    </div>
  )

  return mainContent;
};

export default App;
