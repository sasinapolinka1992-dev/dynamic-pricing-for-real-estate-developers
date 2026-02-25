
import React, { useState, useMemo } from 'react';
import { TrendingUp, Sparkles, Info, RotateCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DemandForecast: React.FC = () => {
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const elasticity = -1.5;

  const forecastData = useMemo(() => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'];
    const basePace = 20;
    const demandMod = 1 + (elasticity * (priceAdjustment / 100));
    const finalPace = basePace * demandMod;
    const avgPrice = 8500000;
    const adjustedPrice = avgPrice * (1 + (priceAdjustment / 100));

    return months.map((m, i) => {
      const units = Math.max(0, Math.round(finalPace + (i * 0.5)));
      const revenue = units * adjustedPrice;
      const baseRevenue = units * avgPrice;
      return { 
        name: m, 
        units, 
        revenue: Math.round(revenue / 1000000),
        baseRevenue: Math.round(baseRevenue / 1000000),
        delta: Math.round((revenue - baseRevenue) / 1000000)
      };
    });
  }, [priceAdjustment]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-6">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1 tracking-widest">Проект</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none"><option>Все проекты</option></select>
        </div>
        <div className="space-y-1.5 min-w-[300px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1 tracking-widest">Период прогноза</label>
          <div className="flex gap-2">
            <input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" />
            <input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" />
          </div>
        </div>
        <button onClick={() => { setPeriodFrom(''); setPeriodTo(''); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-danger transition-all shadow-sm">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Настройки модели</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase">Коррекция цены</label>
              <span className="text-sm font-black text-primary">{priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%</span>
            </div>
            <input type="range" min="-20" max="20" step="1" value={priceAdjustment} onChange={(e) => setPriceAdjustment(parseInt(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100/50 mt-auto">
             <p className="text-[9px] font-black text-primary uppercase mb-1 tracking-widest">Прогноз за 6 мес</p>
             <p className="text-2xl font-black text-slate-800">{forecastData.reduce((acc, c) => acc + c.revenue, 0)} млн.р</p>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip formatter={(val) => [`${val} млн.р`, 'Выручка']} />
              <Area type="monotone" dataKey="revenue" name="Выручка (прогноз)" stroke="#6699CC" fill="#6699CC" fillOpacity={0.1} strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] border-b">
            <tr>
              <th className="px-8 py-5">Месяц прогноза</th>
              <th className="px-8 py-5 text-center">Продажи (шт)</th>
              <th className="px-8 py-5 text-center">Выручка (план)</th>
              <th className="px-8 py-5 text-center">Выручка (прогноз)</th>
              <th className="px-8 py-5 text-right">Эффект (млн.р)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {forecastData.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4 font-black text-slate-700">{d.name}</td>
                <td className="px-8 py-4 text-center font-bold text-slate-500">{d.units}</td>
                <td className="px-8 py-4 text-center font-bold text-slate-400">{d.baseRevenue} млн.р</td>
                <td className="px-8 py-4 text-center font-black text-primary">{d.revenue} млн.р</td>
                <td className={`px-8 py-4 text-right font-black ${d.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                  {d.delta >= 0 ? '+' : ''}{d.delta} млн.р
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemandForecast;
