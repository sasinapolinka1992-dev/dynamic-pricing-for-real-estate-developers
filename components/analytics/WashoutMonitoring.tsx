
import React, { useState, useMemo } from 'react';
import { LayoutGrid, TrendingUp, AlertTriangle, ChevronRight, X, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import Chessboard from '../Chessboard';
import { MOCK_UNITS } from '../../constants';

const WashoutMonitoring: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [drillDownGroup, setDrillDownGroup] = useState<string | null>(null);

  const groups = [
    { name: '1-к квартиры (Грин Парк)', stock: 45, rHist: 4, revenue: 38.5 },
    { name: '2-к квартиры (Грин Парк)', stock: 22, rHist: 2, revenue: 25.2 },
    { name: 'Студии (ЖК Сити)', stock: 15, rHist: 6, revenue: 12.8 },
  ];

  const chartData = [
    { name: period === 'month' ? 'Нов' : period === 'week' ? 'Пн' : 'Кв1', rev: 12.5, units: 100 },
    { name: period === 'month' ? 'Дек' : period === 'week' ? 'Вт' : 'Кв2', rev: 15.2, units: 85 },
    { name: period === 'month' ? 'Янв' : period === 'week' ? 'Ср' : 'Кв3', rev: 18.8, units: 72 },
    { name: period === 'month' ? 'Фев' : period === 'week' ? 'Чт' : 'Кв4', rev: 22.4, units: 60 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4 flex-wrap">
           <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['week', 'month', 'quarter', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  period === p ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : p === 'quarter' ? 'Квартал' : 'Год'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right min-w-[120px]">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Выручка за период</h3>
          <p className="text-2xl font-black text-primary mt-1">68.9 млн.р</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" /> Тепловая карта групп
          </h4>
          
          <div className="space-y-3">
            {groups.map((g, i) => (
              <div 
                key={i} 
                onClick={() => setDrillDownGroup(g.name)}
                className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-transparent transition-all hover:border-primary/20 hover:bg-blue-50/20 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-700 text-xs">{i+1}</div>
                <div className="flex-1">
                  <p className="text-[14px] font-black text-slate-800">{g.name}</p>
                  <div className="flex gap-4 mt-1">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Остаток: <span className="text-slate-700">{g.stock} шт</span></p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Выручка: <span className="text-primary">{g.revenue} млн.р</span></p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px]">
           <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Динамика выручки (млн.р)
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevMln" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27ae60" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#27ae60" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip formatter={(val) => [`${val} млн.р`, 'Выручка']} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Area type="monotone" dataKey="rev" stroke="#27ae60" fillOpacity={1} fill="url(#colorRevMln)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {drillDownGroup && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setDrillDownGroup(null)} />
          <div className="relative bg-white w-full max-w-7xl h-full rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div>
                   <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Тепловая карта: {drillDownGroup}</h2>
                   <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">Визуализация интенсивности спроса по помещениям</p>
                </div>
                <button onClick={() => setDrillDownGroup(null)} className="p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors">
                  <X className="w-8 h-8 text-slate-400" />
                </button>
             </div>
             {/* Fixed Scroll: Ensured the container takes full height and allows scroll */}
             <div className="flex-1 min-h-0 bg-white overflow-hidden">
                <Chessboard localUnits={MOCK_UNITS} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WashoutMonitoring;
