
import React, { useState, useMemo } from 'react';
import { Download, Search, HelpCircle, ArrowUpDown, RotateCcw } from 'lucide-react';
import { ReevaluationLog } from '../../types';

const MOCK_LOGS: ReevaluationLog[] = [
  {
    id: 'l1',
    date: '24.05.2025',
    project: 'Грин Парк',
    section: '1.1',
    unitType: 'Квартира',
    area: 45.5,
    unitNumber: '102',
    reservationDate: '20.05.2025',
    releaseDate: '24.05.2025',
    oldPriceTotal: 8500000,
    oldPriceM2: 186813,
    newPriceTotal: 8900000,
    newPriceM2: 195604,
    status: 'accepted'
  }
];

const ReevaluationHistory: React.FC = () => {
  const [sortField, setSortField] = useState<keyof ReevaluationLog>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({ periodFrom: '', periodTo: '' });

  const sortedLogs = useMemo(() => {
    return [...MOCK_LOGS].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortField, sortOrder]);

  const handleSort = (field: keyof ReevaluationLog) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-end justify-between gap-6">
        <div className="flex-1 min-w-[300px] space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Период</label>
          <div className="flex gap-2">
            <input type="date" value={filters.periodFrom} onChange={e => setFilters({...filters, periodFrom: e.target.value})} className="flex-1 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none bg-slate-50 focus:border-primary/50" />
            <input type="date" value={filters.periodTo} onChange={e => setFilters({...filters, periodTo: e.target.value})} className="flex-1 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none bg-slate-50 focus:border-primary/50" />
          </div>
        </div>

        <div className="relative flex-1 min-w-[300px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-1.5">Поиск</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input placeholder="Поиск по номеру помещения..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-primary/50" />
          </div>
        </div>

        <div className="flex gap-2">
           <button onClick={() => setFilters({ periodFrom: '', periodTo: '' })} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-danger transition-all"><RotateCcw className="w-5 h-5" /></button>
           <button className="flex items-center gap-2 bg-success text-white px-6 py-3 rounded-xl font-bold text-xs hover:brightness-105 transition shadow-lg shadow-success/10"><Download className="w-4 h-4" /> Скачать в Excel</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">Дата переоц. <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
              </th>
              <th className="px-6 py-4">Объект / Секция</th>
              <th className="px-6 py-4">Помещение / Тип / Площадь</th>
              <th className="px-6 py-4">Текущая цена</th>
              <th className="px-6 py-4">Цена переоц.</th>
              <th className="px-6 py-4 text-center">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors font-medium">
                <td className="px-6 py-5 text-slate-400">{log.date}</td>
                <td className="px-6 py-5 font-bold text-slate-700">{log.project}<br/><span className="text-slate-300 font-medium">Секция {log.section}</span></td>
                <td className="px-6 py-5"><span className="text-slate-700 font-bold">№{log.unitNumber}</span> ({log.unitType})<br/><span className="text-primary font-black">{log.area} м²</span></td>
                <td className="px-6 py-5"><p className="text-slate-700 font-bold">{(log.oldPriceTotal / 1000000).toFixed(2)} млн</p><p className="text-slate-400">{log.oldPriceM2.toLocaleString()} ₽/м²</p></td>
                <td className="px-6 py-5"><p className="text-primary font-black">{(log.newPriceTotal / 1000000).toFixed(2)} млн</p><p className="text-primary font-bold">{log.newPriceM2.toLocaleString()} ₽/м²</p></td>
                <td className="px-6 py-5 text-center"><span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase ${log.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{log.status === 'accepted' ? 'Принято' : 'Не принято'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReevaluationHistory;
