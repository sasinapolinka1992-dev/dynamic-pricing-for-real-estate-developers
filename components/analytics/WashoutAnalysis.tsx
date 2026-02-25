
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';

const WashoutAnalysis: React.FC = () => {
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');

  const velocityData = [
    { group: '1-к Помещения', velocity: 4.5, inventory: 12, monthsLeft: 2.6 },
    { group: '2-к Помещения', velocity: 2.1, inventory: 15, monthsLeft: 7.1 },
    { group: 'Студии', velocity: 8.2, inventory: 8, monthsLeft: 0.9 },
    { group: '3-к Помещения', velocity: 1.2, inventory: 10, monthsLeft: 8.3 },
  ];

  const criticalGroups = velocityData.filter(d => d.monthsLeft < 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-6">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1 tracking-widest">Объект</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none"><option>Все проекты</option></select>
        </div>
        <div className="space-y-1.5 min-w-[300px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1 tracking-widest">Анализируемый период</label>
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
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Скорость продаж по группам (шт/мес)
              </h4>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={velocityData} layout="vertical" margin={{ left: 40, right: 40 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#64748b'}} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                 <Bar dataKey="velocity" radius={[0, 10, 10, 0]} barSize={24}>
                   {velocityData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.monthsLeft < 3 ? '#e74c3c' : '#6699CC'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] shadow-xl text-white flex flex-col justify-between">
           <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight mb-4">Сводный прогноз</h4>
              <div className="space-y-4">
                 {criticalGroups.map((g, i) => (
                   <p key={i} className="text-sm font-medium leading-relaxed opacity-90">
                     ⚠️ Через <span className="text-danger font-black">{g.monthsLeft} мес</span> будет реализовано 80% группы <span className="font-black underline">{g.group}</span>.
                   </p>
                 ))}
                 {criticalGroups.length === 0 && <p className="text-sm opacity-60">Критических отклонений по вымываемости не обнаружено.</p>}
              </div>
           </div>
           <div className="pt-8 border-t border-white/10 mt-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Общая оценка темпа</p>
              <p className="text-3xl font-black text-success">Норма</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Анализ исчерпания и рекомендации</h4>
          <span className="bg-blue-50 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Учтена эластичность: -1.5</span>
        </div>
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-widest border-b">
              <th className="px-8 py-5">Группа помещений</th>
              <th className="px-8 py-5 text-center">Остаток (шт)</th>
              <th className="px-8 py-5 text-center">Скорость (V)</th>
              <th className="px-8 py-5 text-center">Срок вымывания (T)</th>
              <th className="px-8 py-5 text-right">Рекомендация системы</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {velocityData.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-black text-slate-700">{d.group}</td>
                <td className="px-8 py-6 text-center font-bold text-slate-500">{d.inventory}</td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-black text-slate-800">
                    {d.velocity} <span className="text-[9px] text-slate-300">шт/мес</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-black ${d.monthsLeft < 3 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                    {d.monthsLeft} мес.
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {d.monthsLeft < 3 ? (
                    <button className="bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-3 h-3" /> Повысить цену на 5%
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-end gap-2 text-success font-black text-[10px] uppercase">
                       <CheckCircle2 className="w-4 h-4" /> В рамках плана
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WashoutAnalysis;
