import React, { useState, useMemo } from 'react';
import { Download, Search, ArrowUpDown } from 'lucide-react';
import { AssortmentLog } from '../../types';

const MOCK_LOGS: AssortmentLog[] = [
  {
    id: 'al-1',
    date: '10.06.2025',
    project: 'Грин Парк',
    section: '1.2',
    unitType: 'Студия',
    area: 28.5,
    unitNumber: '405',
    currentPriceTotal: 5200000,
    currentPriceM2: 182456,
    newPriceTotal: 5400000,
    newPriceM2: 189473,
    status: 'accepted'
  }
];

const AssortmentLogs: React.FC = () => {
  const [sortField, setSortField] = useState<keyof AssortmentLog>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedLogs = useMemo(() => {
    return [...MOCK_LOGS].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortField, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input placeholder="Поиск по логам..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none" />
        </div>
        <button className="flex items-center gap-2 bg-success text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-105 transition shadow-lg shadow-success/10"><Download className="w-4 h-4" /> Скачать в Excel</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <th className="px-4 py-4">Дата</th>
              <th className="px-4 py-4">Объект / Секция</th>
              <th className="px-4 py-4">Тип / Площадь / №</th>
              <th className="px-4 py-4">Текущая цена</th>
              <th className="px-4 py-4">Цена переоценки</th>
              <th className="px-4 py-4 text-center">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors font-medium">
                <td className="px-4 py-5 text-slate-400 font-semibold">{log.date}</td>
                <td className="px-4 py-5"><p className="font-bold text-slate-700">{log.project}</p><p className="text-slate-300">Секция {log.section}</p></td>
                <td className="px-4 py-5"><p className="text-slate-700 font-bold">№{log.unitNumber}</p><p className="text-primary font-black">{log.area} м² ({log.unitType})</p></td>
                <td className="px-4 py-5"><p className="text-slate-700">{(log.currentPriceTotal/1000000).toFixed(2)} млн</p><p className="text-slate-400">{log.currentPriceM2.toLocaleString()} ₽/м²</p></td>
                <td className="px-4 py-5"><p className="text-primary font-black">{(log.newPriceTotal/1000000).toFixed(2)} млн</p><p className="text-primary">{log.newPriceM2.toLocaleString()} ₽/м²</p></td>
                <td className="px-4 py-5 text-center"><span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase ${log.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{log.status === 'accepted' ? 'Принято' : 'Не принято'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssortmentLogs;
