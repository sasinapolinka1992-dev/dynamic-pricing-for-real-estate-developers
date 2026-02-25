
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  BarChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Calendar,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';

const PricingSimulator: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number>(180000);
  const [targetVolume, setTargetVolume] = useState<number>(12); // Units per month target
  const [elasticity, setElasticity] = useState<number>(-1.5);
  const [scenario, setScenario] = useState<'base' | 'opt' | 'pess'>('base');
  const [marketPrice, setMarketPrice] = useState<number>(175000);
  const [isCompareMode, setIsCompareMode] = useState(true);

  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  const stats = useMemo(() => {
    // Current Scenario
    const deltaP = ((basePrice - marketPrice) / marketPrice) * 100;
    const scenarioMod = scenario === 'opt' ? 1.2 : scenario === 'pess' ? 0.8 : 1.0;
    const adjustedVelocity = Math.max(0, targetVolume * (1 + elasticity * (deltaP / 100)) * scenarioMod);
    
    // Base Scenario (Always uses Market Price as reference or initial settings)
    const baseVelocity = targetVolume * 1.0; 
    
    const avgArea = 55;
    const monthlyRevenue = adjustedVelocity * basePrice * avgArea;
    const totalRevenue = monthlyRevenue * 12;

    const monthlyRevenueBase = baseVelocity * marketPrice * avgArea;
    const totalRevenueBase = monthlyRevenueBase * 12;

    const chartData = months.map((m, i) => {
      const growth = 1 + (i * 0.02);
      const units = Math.round(adjustedVelocity * growth);
      const unitsBase = Math.round(baseVelocity * growth);
      
      return {
        month: m,
        revenue: Math.round((units * basePrice * avgArea) / 1000000), // in millions
        revenueBase: Math.round((unitsBase * marketPrice * avgArea) / 1000000),
        units: units,
        unitsBase: unitsBase
      };
    });

    return {
      deltaP: deltaP.toFixed(1),
      velocity: adjustedVelocity.toFixed(1),
      totalRevenue: (totalRevenue / 1000000).toFixed(0),
      totalRevenueBase: (totalRevenueBase / 1000000).toFixed(0),
      deltaRevenue: ((totalRevenue - totalRevenueBase) / 1000000).toFixed(1),
      chartData
    };
  }, [basePrice, targetVolume, elasticity, scenario, marketPrice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* INPUTS COLUMN */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Параметры прогноза</h3>
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  isCompareMode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3" /> A/B Тест
              </button>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Прогнозная цена (₽/м²)</label>
                  <span className="text-sm font-black text-primary">{basePrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="100000" max="300000" step="5000"
                  value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Целевой темп (шт/мес)</label>
                  <span className="text-sm font-black text-primary">{targetVolume}</span>
                </div>
                <input 
                  type="range" min="1" max="50" step="1"
                  value={targetVolume} onChange={(e) => setTargetVolume(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Эластичность спроса</label>
                  <span className="text-sm font-black text-primary">{elasticity}</span>
                </div>
                <input 
                  type="range" min="-3" max="-0.5" step="0.1"
                  value={elasticity} onChange={(e) => setElasticity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
             {(['base', 'opt', 'pess'] as const).map(s => (
               <button
                 key={s}
                 onClick={() => setScenario(s)}
                 className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                   scenario === s 
                   ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                   : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                 }`}
               >
                 {s === 'base' ? 'Базовый' : s === 'opt' ? 'Оптимист' : 'Пессимист'}
               </button>
             ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Дельта эффективности</p>
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-500">Доп. выручка:</span>
                <span className={`text-xl font-black ${Number(stats.deltaRevenue) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {Number(stats.deltaRevenue) > 0 ? '+' : ''}{stats.deltaRevenue} млн ₽
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-500">Прогноз (мес):</span>
                <div className="flex items-center gap-1">
                   <span className="text-xl font-black text-slate-800">{stats.velocity}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">шт</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-500">Дельта от рынка:</span>
                <div className={`flex items-center gap-1 font-black ${Number(stats.deltaP) > 0 ? 'text-danger' : 'text-success'}`}>
                   {Number(stats.deltaP) > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                   {stats.deltaP}%
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* CHARTS COLUMN */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[450px] flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <BarChart className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">A/B Сравнение выручки (Млн ₽)</h4>
              </div>
              {isCompareMode && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full" /> <span className="text-[10px] font-bold text-slate-400 uppercase">Прогноз</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 rounded-full" /> <span className="text-[10px] font-bold text-slate-400 uppercase">База</span></div>
                </div>
              )}
           </div>
           
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={stats.chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                 {isCompareMode && (
                   <Area type="monotone" dataKey="revenueBase" name="Базовая выручка" stroke="#cbd5e1" strokeWidth={2} fill="#f1f5f9" fillOpacity={0.5} />
                 )}
                 <Area type="monotone" dataKey="revenue" name="Прогнозная выручка" stroke="#6699CC" strokeWidth={4} fill="url(#colorRev)" fillOpacity={1} />
                 <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6699CC" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#6699CC" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[350px] flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Темп вымывания (A/B Тест)</h4>
              </div>
           </div>
           
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={stats.chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                 {isCompareMode && (
                   <Line type="stepAfter" dataKey="unitsBase" name="Базовые продажи" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                 )}
                 <Line type="stepAfter" dataKey="units" name="Прогнозные продажи" stroke="#27ae60" strokeWidth={3} dot={{ r: 4, fill: '#27ae60', strokeWidth: 2, stroke: '#fff' }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSimulator;
