
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Search, Calendar, Filter, ArrowUpRight, ArrowDownRight, ArrowUpDown, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Компонент множественного выбора с поиском
const MultiSelect: React.FC<{
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}> = ({ label, values, options, onChange, placeholder = "Выбрать..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter(v => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  const handleSelectAll = () => {
    if (values.length === options.length) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  return (
    <div className="space-y-1.5 flex-1 min-w-[200px] relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase block pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 cursor-pointer flex justify-between items-center min-h-[42px] outline-none focus:ring-1 focus:ring-primary/20 transition-all"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {values.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            values.map(val => (
              <span key={val} className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold">
                {val}
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="p-2 border-b border-slate-50">
            <input 
              autoFocus
              className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="Поиск..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <div className="p-1">
              <button
                onClick={handleSelectAll}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2"
              >
                <div className={`w-4 h-4 rounded border-2 ${values.length === options.length ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                  {values.length === options.length && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                Выбрать все
              </button>
              {filtered.map(option => (
                <button
                  key={option}
                  onClick={() => handleToggle(option)}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2"
                >
                  <div className={`w-4 h-4 rounded border-2 ${values.includes(option) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                    {values.includes(option) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PriceLogEntry {
  id: string;
  date: string;
  project: string;
  section: string;
  unitType: string;
  unitNumber: string;
  ruleName: string;
  initialPriceM2: number;
  newPriceM2: number;
  initialPriceTotal: number;
  newPriceTotal: number;
}

const MOCK_DATA: PriceLogEntry[] = [
  { id: '1', date: '2023-11-01', project: 'Грин Парк', section: '1.1', unitType: '1-к помещение', unitNumber: '102', ruleName: 'Повышение после 5 броней', initialPriceM2: 185000, newPriceM2: 194250, initialPriceTotal: 8500000, newPriceTotal: 8925000 },
  { id: '2', date: '2023-11-05', project: 'ЖК Сити', section: '2.1', unitType: 'Студия', unitNumber: '405', ruleName: 'Сезонность "Зима"', initialPriceM2: 210000, newPriceM2: 220500, initialPriceTotal: 5200000, newPriceTotal: 5460000 },
  { id: '3', date: '2023-11-10', project: 'Грин Парк', section: '1.2', unitType: '2-к помещение', unitNumber: '215', ruleName: 'Акция старт продаж', initialPriceM2: 170000, newPriceM2: 161500, initialPriceTotal: 12000000, newPriceTotal: 11400000 },
];

const PriceChangeReport: React.FC = () => {
  const [sortField, setSortField] = useState<keyof PriceLogEntry>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({ 
    projects: [] as string[], 
    sections: [] as string[], 
    types: [] as string[], 
    rules: [] as string[], 
    periodFrom: '', 
    periodTo: '' 
  });

  const filteredData = useMemo(() => {
    let data = [...MOCK_DATA];
    
    // Применяем фильтры
    if (filters.projects.length > 0) {
      data = data.filter(item => filters.projects.includes(item.project));
    }
    if (filters.sections.length > 0) {
      data = data.filter(item => filters.sections.includes(item.section));
    }
    if (filters.types.length > 0) {
      data = data.filter(item => filters.types.includes(item.unitType));
    }
    if (filters.rules.length > 0) {
      data = data.filter(item => filters.rules.includes(item.ruleName));
    }
    
    // Сортировка
    return data.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filters, sortField, sortOrder]);

  const stats = useMemo(() => {
    const totalDiff = filteredData.reduce((acc, curr) => acc + (curr.newPriceTotal - curr.initialPriceTotal), 0);
    return { totalDiff };
  }, [filteredData]);

  const chartData = [
    { name: '01.11', value: 425000 },
    { name: '05.11', value: 685000 },
    { name: '10.11', value: 85000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Общее изменение цен</p>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black ${stats.totalDiff >= 0 ? 'text-success' : 'text-danger'}`}>
              {stats.totalDiff >= 0 ? '+' : ''}{stats.totalDiff.toLocaleString()} ₽
            </span>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6699CC" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6699CC" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis tickFormatter={(val) => `${val/1000}к ₽`} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip formatter={(val) => [`${val.toLocaleString()} ₽`, 'Изменение']} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="value" stroke="#6699CC" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-4">
        <MultiSelect 
          label="Проект" 
          values={filters.projects} 
          options={['Грин Парк', 'ЖК Сити', 'ЖК Олимп', 'ЖК Парк Авеню']} 
          onChange={(values) => setFilters({...filters, projects: values})} 
          placeholder="Все проекты"
        />
        
        <MultiSelect 
          label="Секция" 
          values={filters.sections} 
          options={['1.1', '1.2', '2.1', '2.2', '3.1']} 
          onChange={(values) => setFilters({...filters, sections: values})} 
          placeholder="Все секции"
        />
        
        <MultiSelect 
          label="Тип помещения" 
          values={filters.types} 
          options={['Студия', '1-к помещение', '2-к помещение', '3-к помещение']} 
          onChange={(values) => setFilters({...filters, types: values})} 
          placeholder="Все типы"
        />
        
        <MultiSelect 
          label="Правило" 
          values={filters.rules} 
          options={['Повышение после 5 броней', 'Сезонность "Зима"', 'Акция старт продаж', 'Скидка на первый этаж']} 
          onChange={(values) => setFilters({...filters, rules: values})} 
          placeholder="Все правила"
        />
        
        <div className="space-y-1.5 min-w-[280px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block pl-1">Период</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={filters.periodFrom} 
              onChange={e => setFilters({...filters, periodFrom: e.target.value})} 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" 
            />
            <input 
              type="date" 
              value={filters.periodTo} 
              onChange={e => setFilters({...filters, periodTo: e.target.value})} 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none" 
            />
          </div>
        </div>
        
        <button 
          onClick={() => setFilters({
            projects: [], 
            sections: [], 
            types: [], 
            rules: [], 
            periodFrom: '', 
            periodTo: ''
          })} 
          className="bg-white border border-slate-200 text-slate-700 rounded-xl px-6 py-3 text-[14px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-h-[44px] flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Сбросить фильтры
        </button>
        
        <button className="flex items-center gap-2 bg-success text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:brightness-105 transition shadow-lg shadow-success/10 h-[42px] mb-0.5">
          <Download className="w-4 h-4" /> Скачать в Excel
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Дата / Объект</th>
              <th className="px-6 py-4">Помещение / Секция</th>
              <th className="px-6 py-4 text-center">Цена старт (м²)</th>
              <th className="px-6 py-4 text-center">Цена новая (м²)</th>
              <th className="px-6 py-4 text-center">Разница (м²)</th>
              <th className="px-6 py-4 text-center">Цена старт (общ)</th>
              <th className="px-6 py-4 text-center">Цена новая (общ)</th>
              <th className="px-6 py-4 text-center">Разница (общ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map(log => {
              const diffM2 = log.newPriceM2 - log.initialPriceM2;
              const diffTotal = log.newPriceTotal - log.initialPriceTotal;
              return (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold">
                    <p className="text-slate-400 mb-0.5">{log.date}</p>
                    <p className="text-slate-700">{log.project}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800">№{log.unitNumber}</p>
                    <p className="text-slate-400 uppercase text-[9px] font-black">{log.section} / {log.unitType.split(' ')[0]}</p>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-400">{log.initialPriceM2.toLocaleString()} ₽</td>
                  <td className="px-6 py-5 text-center font-black text-slate-700">{log.newPriceM2.toLocaleString()} ₽</td>
                  <td className={`px-6 py-5 text-center font-black ${diffM2 >= 0 ? 'text-success' : 'text-danger'}`}>{diffM2 >= 0 ? '+' : ''}{diffM2.toLocaleString()} ₽</td>
                  <td className="px-6 py-5 text-center font-bold text-slate-400">{(log.initialPriceTotal / 1000000).toFixed(2)} млн ₽</td>
                  <td className="px-6 py-5 text-center font-black text-slate-700">{(log.newPriceTotal / 1000000).toFixed(2)} млн ₽</td>
                  <td className={`px-6 py-5 text-center font-black ${diffTotal >= 0 ? 'text-success' : 'text-danger'}`}>{diffTotal >= 0 ? '+' : ''}{diffTotal.toLocaleString()} ₽</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceChangeReport;
