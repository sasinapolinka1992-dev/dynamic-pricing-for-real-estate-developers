
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Search, Undo2, ChevronDown, Check, Calendar, RotateCcw, Sparkles, ArrowUpDown, Filter } from 'lucide-react';
import { RuleLog } from '../../types';

const RulesLogs: React.FC = () => {
  const [filters, setFilters] = useState({
    periodFrom: '',
    periodTo: '',
    project: 'Все',
    section: 'Все',
    unitType: 'Все',
    rule: 'Все',
    group: 'Все'
  });

  const [sortConfig, setSortConfig] = useState<{ key: keyof RuleLog, dir: 'asc' | 'desc' } | null>(null);

  const logs: RuleLog[] = [
    {
      id: 'l1',
      timestamp: '15.10.2023 14:30',
      project: 'Грин Парк',
      section: 'Секция 1',
      unitType: '1-к квартира',
      unitCount: 5,
      ruleName: 'Повышение после 5 броней',
      oldPrice: 8325000,
      newPrice: 8741250,
      difference: 416250,
      changePercent: 5,
      totalDiff: 2081250
    }
  ];

  const sortedLogs = useMemo(() => {
    let items = [...logs];
    
    // Apply filters
    if (filters.project !== 'Все') items = items.filter(l => l.project === filters.project);
    if (filters.section !== 'Все') items = items.filter(l => l.section === filters.section);
    if (filters.unitType !== 'Все') items = items.filter(l => l.unitType.includes(filters.unitType));
    if (filters.rule !== 'Все') items = items.filter(l => l.ruleName === filters.rule);
    
    if (sortConfig) {
      items.sort((a, b) => {
        const vA = a[sortConfig.key];
        const vB = b[sortConfig.key];
        if (vA < vB) return sortConfig.dir === 'asc' ? -1 : 1;
        if (vA > vB) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [logs, sortConfig, filters]);

  const toggleSort = (key: keyof RuleLog) => {
    setSortConfig(prev => ({
      key,
      dir: prev?.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const totals = useMemo(() => {
    return sortedLogs.reduce((acc, log) => acc + log.totalDiff, 0);
  }, [sortedLogs]);

  return (
    <div className="space-y-6">
      {/* Expanded Filters Bar */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Проект</label>
            <select value={filters.project} onChange={e => setFilters({...filters, project: e.target.value})} className="w-full border rounded-xl p-2.5 text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
              <option>Все</option>
              <option>Грин Парк</option>
              <option>ЖК Авеню</option>
            </select>
          </div>
          <div className="flex-1 min-w-[120px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Секция</label>
            <select value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})} className="w-full border rounded-xl p-2.5 text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
              <option>Все</option>
              <option>Секция 1</option>
              <option>Секция 2</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Тип помещения</label>
            <select value={filters.unitType} onChange={e => setFilters({...filters, unitType: e.target.value})} className="w-full border rounded-xl p-2.5 text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
              <option>Все</option>
              <option>1-к квартира</option>
              <option>Студия</option>
              <option>2-к квартира</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Правило</label>
            <select value={filters.rule} onChange={e => setFilters({...filters, rule: e.target.value})} className="w-full border rounded-xl p-2.5 text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
              <option>Все</option>
              <option>Повышение после 5 броней</option>
            </select>
          </div>
          <div className="flex-1 min-w-[280px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Период</label>
            <div className="flex gap-2">
              <input type="date" value={filters.periodFrom} onChange={e => setFilters({...filters, periodFrom: e.target.value})} className="flex-1 border rounded-xl p-2.5 text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-primary/20" />
              <input type="date" value={filters.periodTo} onChange={e => setFilters({...filters, periodTo: e.target.value})} className="flex-1 border rounded-xl p-2.5 text-xs font-bold outline-none bg-slate-50 focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setFilters({ periodFrom: '', periodTo: '', project: 'Все', section: 'Все', unitType: 'Все', rule: 'Все', group: 'Все' })} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-danger transition-all shadow-sm"><RotateCcw className="w-5 h-5" /></button>
             <button className="bg-success text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:brightness-105 transition-all shadow-lg shadow-success/10"><Download className="w-4 h-4" /> Скачать в Excel</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] tracking-widest border-b h-14">
              <th className="px-6 py-5 cursor-pointer hover:text-primary transition-all" onClick={() => toggleSort('timestamp')}>Дата <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
              <th className="px-6 py-5">Проект</th>
              <th className="px-6 py-5">Тип / Кол-во</th>
              <th className="px-6 py-5">Правило</th>
              <th className="px-6 py-5 text-right">Стоимость первонач.</th>
              <th className="px-6 py-5 text-right">Новая стоимость</th>
              <th className="px-6 py-5 text-right">Разница</th>
              <th className="px-6 py-5 text-center">%</th>
              <th className="px-6 py-5 text-right font-black">Итого изм.</th>
              <th className="px-6 py-5 text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors h-16">
                <td className="px-6 py-5 font-bold text-slate-400">{log.timestamp}</td>
                <td className="px-6 py-5 font-black text-slate-700 uppercase tracking-tighter">{log.project}<br/><span className="text-[9px] text-primary">{log.section}</span></td>
                <td className="px-6 py-5 font-bold text-slate-600">{log.unitType} ({log.unitCount})</td>
                <td className="px-6 py-5 font-black text-primary uppercase">{log.ruleName}</td>
                <td className="px-6 py-5 text-right">
                  <p className="font-bold text-slate-700">{log.oldPrice.toLocaleString()} ₽</p>
                  <p className="text-[9px] text-slate-400">{(log.oldPrice / 45).toLocaleString()} ₽/м²</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <p className="font-black text-primary">{log.newPrice.toLocaleString()} ₽</p>
                  <p className="text-[9px] text-primary font-bold">{(log.newPrice / 45).toLocaleString()} ₽/м²</p>
                </td>
                <td className={`px-6 py-5 text-right font-black ${log.difference >= 0 ? 'text-success' : 'text-danger'}`}>
                   {log.difference >= 0 ? '+' : ''}{log.difference.toLocaleString()} ₽
                </td>
                <td className="px-6 py-5 text-center font-black text-primary">{log.changePercent}%</td>
                <td className="px-6 py-5 text-right font-black text-slate-800 bg-slate-50/30">{log.totalDiff.toLocaleString()} ₽</td>
                <td className="px-6 py-5 text-right">
                   <button className="text-danger border border-danger/20 px-3 py-1.5 rounded-xl text-[9px] font-black hover:bg-danger/5 transition-all">Отмена</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80 font-black text-[11px] text-slate-800 uppercase tracking-widest border-t-2 border-slate-100">
            <tr>
              <td colSpan={8} className="px-6 py-5 text-right">Итоговая дельта за период</td>
              <td className="px-6 py-5 text-right bg-primary/5 text-primary text-sm font-black">{totals.toLocaleString()} ₽</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default RulesLogs;
