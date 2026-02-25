
import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Zap, 
  History,
  Activity
} from 'lucide-react';
import PriceChangeReport from './analytics/PriceChangeReport';
import WashoutMonitoring from './analytics/WashoutMonitoring';
import DemandForecast from './analytics/DemandForecast';
import RulesEfficiency from './analytics/RulesEfficiency';
import WashoutAnalysis from './analytics/WashoutAnalysis';

enum AnalyticsTab {
  PRICE_LOGS = 'price_logs',
  WASHOUT_MONITORING = 'washout_monitoring',
  WASHOUT_ANALYSIS = 'washout_analysis',
  FORECAST = 'forecast',
  EFFICIENCY = 'efficiency'
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(AnalyticsTab.PRICE_LOGS);

  const tabs = [
    { id: AnalyticsTab.PRICE_LOGS, label: 'Изменения цен', icon: History },
    { id: AnalyticsTab.WASHOUT_MONITORING, label: 'Мониторинг вымываемости', icon: Activity },
    { id: AnalyticsTab.WASHOUT_ANALYSIS, label: 'Анализ вымываемости', icon: Layers },
    { id: AnalyticsTab.FORECAST, label: 'Прогноз спроса', icon: TrendingUp },
    { id: AnalyticsTab.EFFICIENCY, label: 'Эффективность правил', icon: Zap },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs Container - Optimized for one line without scroll */}
      <div className="bg-white border border-slate-100 rounded-3xl p-1.5 shadow-sm flex items-stretch gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-[20px] transition-all duration-300 relative group overflow-hidden ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className={`text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'opacity-100' : 'opacity-80'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {activeTab === AnalyticsTab.PRICE_LOGS && <PriceChangeReport />}
        {activeTab === AnalyticsTab.WASHOUT_MONITORING && <WashoutMonitoring />}
        {activeTab === AnalyticsTab.WASHOUT_ANALYSIS && <WashoutAnalysis />}
        {activeTab === AnalyticsTab.FORECAST && <DemandForecast />}
        {activeTab === AnalyticsTab.EFFICIENCY && <RulesEfficiency />}
      </div>
    </div>
  );
};

export default Dashboard;
