
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Save, Link as LinkIcon, Download, ChevronDown, 
  RotateCcw, Calendar, X, Upload, Maximize2, Table, 
  Edit2, Minimize2, HelpCircle, PenLine, Info, ArrowRight, SaveAll, RefreshCw, ArrowUpDown, FileSpreadsheet
} from 'lucide-react';
import { SalesPlan, MonthlyPlanValue } from '../../types';

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

const CheckboxDropdown: React.FC<{
  label: string;
  values: string[];
  options: string[];
  onChange: (vals: string[]) => void;
}> = ({ label, values, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
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
    <div className="space-y-1.5 flex-1 max-w-[300px] relative" ref={containerRef}>
      <label className="text-[12px] text-slate-400 font-medium pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 font-bold outline-none focus:border-primary shadow-sm appearance-none cursor-pointer flex justify-between items-center"
      >
        <span className="truncate">
          {values.length === 0 ? 'Все' : `Выбрано: ${values.length}`}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-300 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
          <div className="max-h-48 overflow-y-auto custom-scrollbar p-2">
            <div 
              className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer font-bold text-slate-400 rounded"
              onClick={() => { handleSelectAll(); setIsOpen(false); setSearch(''); }}
            >
              {values.length === options.length ? 'Снять все' : 'Выбрать все'}
            </div>
            {filtered.map(option => (
              <div 
                key={option}
                className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer font-bold text-slate-700 rounded flex items-center gap-2"
                onClick={() => handleToggle(option)}
              >
                <input 
                  type="checkbox" 
                  checked={values.includes(option)}
                  onChange={() => {}}
                  className="w-3 h-3 text-primary rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('ru-RU');
};

const MONTHS_2026 = [
  'Январь 2026', 'Февраль 2026', 'Март 2026', 'Апрель 2026', 
  'Май 2026', 'Июнь 2026', 'Июль 2026', 'Август 2026'
];

const SalesPlanManager: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeModal, setActiveModal] = useState<'online' | 'google' | 'excel' | null>(null);
  const [viewState, setViewState] = useState<'registry' | 'editor'>('registry');
  
  const [projectFilterValue, setProjectFilterValue] = useState<string[]>([]);
  const [sectionFilterValue, setSectionFilterValue] = useState<string[]>([]);
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof SalesPlan, direction: 'asc' | 'desc'} | null>(null);
  
  const [plans, setPlans] = useState<SalesPlan[]>([
    { 
      id: 'p1', project: 'ЖК Авеню', section: '1', createdAt: '2025-01-01', updatedAt: '2025-10-08', startDate: '2026-01-01', endDate: '2026-08-01', 
      startPriceM2: 180000, endPriceM2: 250000, 
      total: { units: 90, area: 100, price: 80 }, 
      fact: { units: 45, area: 52, price: 38 }, 
      monthlyTargets: MONTHS_2026.map(m => ({
        month: m, units: 10, area: 60, pricePerM2: 190000, rub: 11,
        factUnits: 5,
        factArea: 32,
        factPrice: 6,
      }))
    }
  ]);

  const [currentPlan, setCurrentPlan] = useState<SalesPlan | null>(plans[0]);

  const filteredPlans = useMemo(() => {
    let items = [...plans];
    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items.filter(p => {
      const matchProject = projectFilterValue.length === 0 || projectFilterValue.includes(p.project);
      const matchSection = sectionFilterValue.length === 0 || sectionFilterValue.includes(p.section);
      const planDate = new Date(p.createdAt);
      const matchFrom = !periodFrom || planDate >= new Date(periodFrom);
      const matchTo = !periodTo || planDate <= new Date(periodTo);
      return matchProject && matchSection && matchFrom && matchTo;
    });
  }, [plans, projectFilterValue, sectionFilterValue, periodFrom, periodTo, sortConfig]);

  const requestSort = (key: keyof SalesPlan) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleEditValue = (month: string, field: keyof MonthlyPlanValue, value: any) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      monthlyTargets: currentPlan.monthlyTargets.map(mt => mt.month === month ? { ...mt, [field]: value } : mt)
    });
  };

  const totals = useMemo(() => {
    return filteredPlans.reduce((acc, p) => ({
      units: acc.units + p.total.units,
      area: acc.area + p.total.area,
      price: acc.price + p.total.price,
      factUnits: acc.factUnits + p.fact.units,
      factArea: acc.factArea + p.fact.area,
      factPrice: acc.factPrice + p.fact.price
    }), { units: 0, area: 0, price: 0, factUnits: 0, factArea: 0, factPrice: 0 });
  }, [filteredPlans]);

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-[1000] bg-white p-8 overflow-auto' : 'relative'}`}>
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {viewState === 'registry' ? (
              <>
                <CheckboxDropdown 
                  label="Проект"
                  values={projectFilterValue}
                  options={['ЖК Авеню']}
                  onChange={setProjectFilterValue}
                />
                <CheckboxDropdown 
                  label="Секция"
                  values={sectionFilterValue}
                  options={['1', '2', '3', '4']}
                  onChange={setSectionFilterValue}
                />
                <div className="space-y-1.5">
                  <label className="text-[12px] text-slate-400 font-medium pl-1">Период создания</label>
                  <div className="flex gap-2 items-center">
                    <input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="w-[160px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-bold text-slate-700 outline-none shadow-sm" />
                    <input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="w-[160px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-bold text-slate-700 outline-none shadow-sm" />
                  </div>
                </div>
                <button onClick={() => { setProjectFilterValue([]); setSectionFilterValue([]); setPeriodFrom(''); setPeriodTo(''); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-primary transition-all shadow-sm mt-5"><RotateCcw className="w-4 h-4" /></button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                 <h2 className="text-lg font-black text-slate-700 uppercase">{currentPlan?.project} — Секция {currentPlan?.section}</h2>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {viewState === 'registry' ? (
              <>
                <button className="bg-[#27ae60] text-white px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:brightness-105 transition-all shadow-sm">
                  <Download className="w-4 h-4" /> Скачать в Excel
                </button>
                <button onClick={() => { if (plans.length > 0) { setCurrentPlan(plans[0]); setViewState('editor'); } }} className="bg-white border border-[#6699CC] text-[#6699CC] px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm"><PenLine className="w-4 h-4" /> Редактировать</button>
                <div className="relative group">
                  <button className="bg-[#6699CC] text-white px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2 shadow-lg shadow-[#6699CC]/20 hover:brightness-105 transition-all"><Plus className="w-4 h-4" /> Загрузить</button>
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-2 space-y-1">
                    <button onClick={() => setActiveModal('online')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left"><Table className="w-4 h-4 text-primary" /><div><p className="text-xs font-black text-slate-700">Онлайн таблица</p></div></button>
                    <button onClick={() => setActiveModal('excel')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left"><Upload className="w-4 h-4 text-success" /><div><p className="text-xs font-black text-slate-700">Excel файл</p></div></button>
                    <button onClick={() => setActiveModal('google')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left"><LinkIcon className="w-4 h-4 text-blue-500" /><div><p className="text-xs font-black text-slate-700">Google Таблица</p></div></button>
                  </div>
                </div>
              </>
            ) : (
              <button onClick={() => setViewState('registry')} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-[13px] hover:bg-slate-700 transition-all">К списку планов</button>
            )}
          </div>
        </div>
      </div>

      {viewState === 'registry' ? (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col ${isFullscreen ? 'h-[calc(100vh-320px)]' : ''}`}>
          <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse text-[12px] min-w-[2200px]">
              <thead>
                <tr className="bg-white border-b h-14">
                  <th rowSpan={2} className="px-6 py-3 sticky left-0 z-50 bg-white border-r font-bold text-slate-700 min-w-[150px] cursor-pointer hover:text-primary" onClick={() => requestSort('project')}>Проект <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" /></th>
                  <th rowSpan={2} className="px-6 py-3 sticky left-[150px] z-40 bg-white border-r font-bold text-slate-700 min-w-[80px]">Секция</th>
                  <th rowSpan={2} className="px-6 py-3 border-r font-bold text-slate-700 cursor-pointer hover:text-primary" onClick={() => requestSort('createdAt')}>Создан <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" /></th>
                  <th rowSpan={2} className="px-6 py-3 border-r font-bold text-slate-700 cursor-pointer hover:text-primary" onClick={() => requestSort('updatedAt')}>Изменен <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" /></th>
                  
                  <th colSpan={3} className="px-6 py-2 text-center border-r font-bold text-slate-700 bg-blue-50">Всего (План)</th>
                  <th colSpan={3} className="px-6 py-2 text-center border-r font-bold text-slate-700 bg-slate-100">Остаток</th>
                  <th colSpan={3} className="px-6 py-2 text-center border-r font-bold text-slate-700">Остаток</th>
                  <th colSpan={3} className="px-6 py-2 text-center border-r font-bold text-slate-700">Выполнение %</th>
                  <th className="px-6 py-2 text-center border-r font-bold text-slate-700">Среднее, %</th>
                  
                  {MONTHS_2026.map(m => (
                    <th key={m} colSpan={9} className="px-6 py-2 text-center border-r font-bold text-slate-700">{m}</th>
                  ))}
                </tr>
                <tr className="bg-white border-b h-10">
                  <th className="px-3 py-2 text-center font-medium text-slate-400 bg-blue-50/50">шт</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400 bg-blue-50/50">м²</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400 border-r bg-blue-50/50">млн.р</th>
                  
                  <th className="px-3 py-2 text-center font-medium text-slate-400 bg-slate-50">шт</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400 bg-slate-50">м²</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400 border-r bg-slate-50">млн.р</th>
                  
                  <th className="px-3 py-2 text-center font-medium text-slate-400">шт</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400">м²</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400 border-r">млн.р</th>
                  
                  <th className="px-3 py-2 text-center font-medium text-slate-400">шт</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400">м²</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-400 border-r">млн.р</th>
                  
                  <th className="px-3 py-2 text-center font-medium text-slate-400 border-r">%</th>
                  
                  {MONTHS_2026.map(m => (
                    <React.Fragment key={m}>
                      <th className="px-2 py-2 text-center font-medium text-slate-400 bg-blue-50/30">Пл шт</th>
                      <th className="px-2 py-2 text-center font-medium text-slate-400 bg-slate-50">Фк шт</th>
                      <th className="px-2 py-2 text-center font-medium text-slate-400 bg-blue-50/30">Пл м²</th>
                      <th className="px-2 py-2 text-center font-medium text-slate-400 bg-slate-50">Фк м²</th>
                      <th className="px-2 py-2 text-center font-medium text-slate-400 bg-blue-50/30">Пл р</th>
                      <th className="px-2 py-2 text-center font-medium text-slate-400 bg-slate-50">Фк р</th>
                      <th className="px-2 py-2 text-center font-black text-primary">шт %</th>
                      <th className="px-2 py-2 text-center font-black text-primary">м² %</th>
                      <th className="px-2 py-2 text-center font-black text-primary border-r">р %</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors h-14 group">
                    <td className="px-6 py-3 sticky left-0 z-40 bg-white border-r font-bold text-slate-800">{plan.project}</td>
                    <td className="px-6 py-3 sticky left-[150px] z-30 bg-white border-r text-slate-600">{plan.section}</td>
                    <td className="px-6 py-3 border-r text-slate-600">{formatDate(plan.createdAt)}</td>
                    <td className="px-6 py-3 border-r text-slate-600">{formatDate(plan.updatedAt)}</td>
                    
                    <td className="px-3 py-3 text-center font-bold text-slate-700 bg-blue-50/50">{plan.total.units}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700 bg-blue-50/50">{plan.total.area}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700 border-r bg-blue-50/50">{plan.total.price}</td>
                    
                    <td className="px-3 py-3 text-center font-bold text-slate-700 bg-slate-100/50">{plan.fact.units}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700 bg-slate-100/50">{plan.fact.area}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-700 border-r bg-slate-100/50">{plan.fact.price}</td>
                    
                    <td className="px-3 py-3 text-center font-medium text-slate-500">{plan.total.units - plan.fact.units}</td>
                    <td className="px-3 py-3 text-center font-medium text-slate-500">{plan.total.area - plan.fact.area}</td>
                    <td className="px-3 py-3 text-center font-medium text-slate-500 border-r">{plan.total.price - plan.fact.price}</td>
                    
                    <td className="px-3 py-3 text-center font-black text-primary italic">{(plan.fact.units / plan.total.units * 100).toFixed(0)}%</td>
                    <td className="px-3 py-3 text-center font-black text-primary italic">{(plan.fact.area / plan.total.area * 100).toFixed(0)}%</td>
                    <td className="px-3 py-3 text-center font-black text-primary italic border-r">{(plan.fact.price / plan.total.price * 100).toFixed(0)}%</td>
                    
                    <td className="px-3 py-3 text-center font-black text-primary border-r">
                      59%
                    </td>
                    
                    {plan.monthlyTargets.map((m, idx) => (
                      <React.Fragment key={idx}>
                        <td className="px-2 py-3 text-center text-slate-500 bg-blue-50/20">{m.units}</td>
                        <td className="px-2 py-3 text-center font-bold text-slate-700 bg-slate-50">{m.factUnits || 0}</td>
                        <td className="px-2 py-3 text-center text-slate-500 bg-blue-50/20">{m.area}</td>
                        <td className="px-2 py-3 text-center font-bold text-slate-700 bg-slate-50">{m.factArea || 0}</td>
                        <td className="px-2 py-3 text-center text-slate-500 bg-blue-50/20">{m.rub}</td>
                        <td className="px-2 py-3 text-center font-bold text-slate-700 bg-slate-50">{m.factPrice || 0}</td>
                        <td className="px-2 py-3 text-center font-black text-primary">{( (m.factUnits || 0) / m.units * 100 ).toFixed(0)}%</td>
                        <td className="px-2 py-3 text-center font-black text-primary">{( (m.factArea || 0) / m.area * 100 ).toFixed(0)}%</td>
                        <td className="px-2 py-3 text-center font-black text-primary border-r">{( (m.factPrice || 0) / m.rub * 100 ).toFixed(0)}%</td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-black text-[11px] text-slate-800 uppercase tracking-widest border-t-2 border-slate-200">
                <tr>
                  <td colSpan={3} className="px-6 py-4 border-r">Итого за период</td>
                  <td className="px-3 text-center bg-blue-50">{Math.round(totals.units)}</td>
                  <td className="px-3 text-center bg-blue-50">{Math.round(totals.area)}</td>
                  <td className="px-3 text-center border-r bg-blue-50">{Math.round(totals.price)}</td>
                  <td className="px-3 text-center bg-slate-100">{Math.round(totals.factUnits)}</td>
                  <td className="px-3 text-center bg-slate-100">{Math.round(totals.factArea)}</td>
                  <td className="px-3 text-center border-r bg-slate-100">{Math.round(totals.factPrice)}</td>
                  <td className="px-3 text-center">{Math.round(totals.units - totals.factUnits)}</td>
                  <td className="px-3 text-center">{Math.round(totals.area - totals.factArea)}</td>
                  <td className="px-3 text-center border-r">{Math.round(totals.price - totals.factPrice)}</td>
                  <td className="px-3 text-center">{(totals.factUnits / totals.units * 100).toFixed(0)}%</td>
                  <td className="px-3 text-center">{(totals.factArea / totals.area * 100).toFixed(0)}%</td>
                  <td className="px-3 text-center border-r">{(totals.factPrice / totals.price * 100).toFixed(0)}%</td>
                  <td className="px-3 text-center border-r">
                    {Math.round(
                      (totals.factUnits / totals.units * 100) + 
                      (totals.factArea / totals.area * 100) + 
                      (totals.factPrice / totals.price * 100)
                    ) / 3}%
                  </td>
                  <td colSpan={MONTHS_2026.length * 7}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
           <div className="overflow-auto custom-scrollbar flex-1">
             <table className="w-full text-left border-collapse table-fixed min-w-[1400px]">
               <thead>
                 <tr className="bg-white h-14">
                   <th className="w-[120px] px-8 sticky left-0 z-50 bg-white"></th>
                   <th className="w-[140px] px-4 text-center font-black text-[13px] text-slate-700 bg-blue-50/30">Всего (План)</th>
                   <th className="w-[140px] px-4 text-center font-black text-[13px] text-slate-700 bg-slate-100/50">Остаток</th>
                   {MONTHS_2026.map(m => (
                     <th key={m} className="px-4 text-center font-black text-[13px] text-slate-700">{m}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {[
                   { label: 'шт', key: 'units' as keyof MonthlyPlanValue, fkey: 'factUnits' },
                   { label: 'м²', key: 'area' as keyof MonthlyPlanValue, fkey: 'factArea' },
                   { label: 'руб/м²', key: 'pricePerM2' as keyof MonthlyPlanValue, fkey: '' },
                   { label: 'руб', key: 'rub' as keyof MonthlyPlanValue, fkey: 'factPrice' }
                 ].map(row => (
                   <tr key={row.label} className="h-16 hover:bg-slate-50/30 transition-colors">
                     <td className="px-8 sticky left-0 z-40 bg-white font-black text-slate-800 text-[14px]">{row.label}</td>
                     <td className="px-4 text-center font-bold text-slate-700 text-[14px] bg-blue-50/20">
                        {currentPlan?.total[row.key === 'pricePerM2' ? 'price' : row.key as keyof typeof currentPlan.total]}
                     </td>
                     <td className="px-4 text-center font-bold text-slate-700 text-[14px] bg-slate-50">
                        {currentPlan?.fact[row.key === 'pricePerM2' ? 'price' : row.key as keyof typeof currentPlan.fact]}
                     </td>
                     {currentPlan?.monthlyTargets.map(m => (
                       <td key={m.month} className="px-4">
                          <div className="flex flex-col gap-1 items-center">
                            <input type="number" value={m[row.key] || ''} onChange={(e) => handleEditValue(m.month, row.key, Number(e.target.value))} className="w-full max-w-[80px] bg-slate-50 border-none rounded-lg py-1 px-1 text-center font-bold text-[13px] text-slate-700 focus:bg-white focus:ring-1 focus:ring-primary outline-none transition-all" />
                          </div>
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="p-6 border-t bg-slate-50/30 flex justify-end gap-3">
              <button onClick={() => setViewState('registry')} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-100 transition-all">Выйти без сохранения</button>
              <button onClick={() => { setViewState('registry'); notify('План сохранен'); }} className="px-10 py-3 bg-primary text-white rounded-xl font-bold text-[13px] shadow-lg shadow-primary/20 hover:brightness-105 transition-all">Сохранить</button>
           </div>
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 z-[500] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" onClick={() => setActiveModal(null)} />
          <div className="relative bg-white w-full max-w-[440px] h-full shadow-2xl flex flex-col border-r animate-in slide-in-from-left duration-300">
            <div className="px-10 pt-12 pb-6 flex flex-col gap-6">
               <h2 className="text-xl font-black text-slate-800">{activeModal === 'online' ? 'Заполните онлайн таблицу' : activeModal === 'excel' ? 'Загрузить excel таблицу' : 'Синхронизация'}</h2>
               <div className="flex gap-3">
                 <button onClick={() => setActiveModal(null)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Выйти без сохранения</button>
                 <button onClick={() => { setActiveModal(null); setViewState('editor'); notify('Синхронизация настроена'); }} className="flex-1 bg-primary text-white rounded-xl py-3 text-[14px] font-bold shadow-lg shadow-primary/20 hover:brightness-105 transition-all">Сохранить</button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-6 custom-scrollbar">
              {activeModal === 'online' && (
                <div className="space-y-5 animate-in fade-in">
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Проект <span className="text-danger">*</span></label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"><option>ЖК Авеню</option></select></div>
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Секция <span className="text-danger">*</span></label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"><option>1</option></select></div>
                   <div className="space-y-1">
                     <label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Начало продаж <span className="text-danger">*</span></label>
                     <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Окончание продаж <span className="text-danger">*</span></label>
                     <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm" />
                   </div>
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Начальная цена за м²</label><input type="number" placeholder="180 000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm" /></div>
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Конечная цена за м²</label><input type="number" placeholder="250 000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm" /></div>
                   <button className="w-full flex items-center justify-center gap-3 text-slate-500 bg-slate-50 border border-slate-200 py-3 rounded-xl hover:bg-slate-100 hover:text-primary transition-all font-bold text-xs uppercase tracking-tight"><RotateCcw className="w-4 h-4" /><span>Заполнить автоматически</span></button>
                   <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-[13px]">Сбросить фильтры</button>
                </div>
              )}

              {activeModal === 'excel' && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Выберите проект</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"><option>ЖК Авеню</option></select></div>
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Выберите секцию</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"><option>1</option></select></div>
                   <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center gap-3 bg-slate-50 group hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Перетащите файл сюда</p>
                        <p className="text-xs text-slate-400">или нажмите для выбора</p>
                      </div>
                   </div>
                   <button className="w-full flex items-center justify-center gap-2 text-primary bg-blue-50 py-3 rounded-xl font-bold text-xs uppercase hover:bg-blue-100 transition-all">
                      <FileSpreadsheet className="w-4 h-4" /> Скачать шаблон Excel
                   </button>
                </div>
              )}

              {activeModal === 'google' && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Выберите проект</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"><option>ЖК Авеню</option></select></div>
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Выберите секцию</label><select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"><option>1</option><option>2</option><option>3</option></select></div>
                   <div className="space-y-1"><label className="text-[11px] text-slate-400 font-bold uppercase block pl-1">Ссылка на таблицу</label><input type="text" placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm focus:border-primary outline-none" /></div>
                   <div className="p-4 bg-blue-50/50 rounded-2xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed text-slate-500">Убедитесь, что у сервисного аккаунта <b>service@one-app.iam.gserviceaccount.com</b> есть права на редактирование вашей таблицы.</p>
                   </div>
                   <button className="w-full flex items-center justify-center gap-2 text-primary bg-blue-50 py-3 rounded-xl font-bold text-xs uppercase hover:bg-blue-100 transition-all">
                      <FileSpreadsheet className="w-4 h-4" /> Скачать шаблон
                   </button>
                   <button className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 hover:brightness-105 transition-all flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Обновить синхронизацию</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPlanManager;
