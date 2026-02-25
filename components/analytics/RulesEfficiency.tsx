
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const RulesEfficiency: React.FC = () => {
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');

  const rulesPerformance = [
    { name: 'Повышение после 5 броней', triggers: 12, extraRevenue: 4500000, roi: 15.4, color: '#6699CC' },
    { name: 'Акция старт продаж', triggers: 8, extraRevenue: -1200000, roi: 42.1, color: '#27ae60' },
    { name: 'Сезонность "Зима"', triggers: 3, extraRevenue: 850000, roi: 8.2, color: '#f39c12' },
    { name: 'Риск вымывания (High)', triggers: 5, extraRevenue: 2100000, roi: 12.5, color: '#e74c3c' },
  ];

  const pieData = rulesPerformance.map(r => ({ name: r.name, value: Math.max(0, r.extraRevenue), color: r.color }));

  return (
    <div className="space-y-6">
      {/* Filters with Period */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-6">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1 tracking-widest">Проект</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none"><option>Все проекты</option></select>
        </div>
        <div className="space-y-1.5 min-w-[300px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1 tracking-widest">Период анализа</label>
          <div className="flex gap-2">
            <input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" />
            <input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" />
          </div>
        </div>
        <button onClick={() => { setPeriodFrom(''); setPeriodTo(''); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-danger transition-all shadow-sm">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Эффективность работы правил</h4>
          </div>
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-widest border-b">
                <th className="px-8 py-5">Правило</th>
                <th className="px-8 py-5 text-center">Событий</th>
                <th className="px-8 py-5 text-center">Доп. выручка</th>
                <th className="px-8 py-5 text-right">Эффект (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rulesPerformance.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-black text-slate-700 uppercase tracking-tight text-[11px]">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-black text-slate-400">{r.triggers}</td>
                  <td className="px-8 py-6 text-center font-black text-slate-700">{(r.extraRevenue / 1000000).toFixed(1)} млн.р</td>
                  <td className="px-8 py-6 text-right font-black text-primary">{r.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
           <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 w-full">Вклад в выручку</h4>
           <div className="h-[280px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                   {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-auto w-full pt-8 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Итоговый Эффект</p>
                <p className="text-3xl font-black text-slate-800">18.4%</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-success opacity-20" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default RulesEfficiency;
