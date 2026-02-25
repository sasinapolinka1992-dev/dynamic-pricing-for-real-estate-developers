
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, Pause, Trash2, Edit2, Copy, Plus, Save, X, Calendar, ChevronDown, 
  Zap, CheckCircle2, ArrowUpDown, Bell, AlertTriangle, Wand2, Search, Filter,
  HelpCircle, Power, PowerOff, SaveAll, LogOut, RotateCcw, Check, Download, ArrowUp, ArrowDown, ShieldAlert, Timer
} from 'lucide-react';
import { PricingRule } from '../../types';

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const SearchableSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, value, options, onChange, placeholder = "Поиск..." }) => {
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

  return (
    <div className="space-y-1.5 flex-1 max-w-[240px] relative" ref={containerRef}>
      <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer flex justify-between items-center"
      >
        <span className="truncate">{value || 'Все'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="p-2 border-b border-slate-50">
            <input 
              autoFocus
              className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
              placeholder={placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <div 
              className="px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer font-bold text-slate-400"
              onClick={() => { onChange('Все'); setIsOpen(false); setSearch(''); }}
            >Все</div>
            {filtered.map(opt => (
              <div 
                key={opt}
                className="px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer font-bold text-slate-700"
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MultiSelect: React.FC<{
  label: string;
  values: string[];
  options: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}> = ({ label, values, options, onChange, placeholder = "Поиск..." }) => {
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
    <div className="space-y-1.5 flex-1 max-w-[240px] relative" ref={containerRef}>
      <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer flex justify-between items-center min-h-[42px]"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {values.length === 0 ? (
            <span className="text-slate-400">Все</span>
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
              placeholder={placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <div 
              className="px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer font-bold text-slate-400"
              onClick={() => { handleSelectAll(); }}
            >
              {values.length === options.length ? 'Снять все' : 'Выбрать все'}
            </div>
            {filtered.map(opt => (
              <div 
                key={opt}
                className="px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer font-bold text-slate-700 flex items-center gap-2"
                onClick={() => handleToggle(opt)}
              >
                <input 
                  type="checkbox" 
                  checked={values.includes(opt)}
                  onChange={() => {}}
                  className="w-3 h-3 text-primary rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RulesEngine: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([
    {
      id: 'r1',
      name: 'Повышение цен на 10% после 5 броней',
      createdAt: '2023-11-20',
      events: ['бронь'],
      frequency: 5,
      magnitude: 10,
      isIncrease: true,
      changeType: 'percent_total',
      groupId: 'Группа 1',
      startDate: '2023-11-20',
      endDate: '2024-11-20',
      isAuto: true,
      status: 'active',
      hits: 12,
      profit: 4.5,
      unitCount: 45,
      limits: { 
        maxSingleChange: 15, 
        maxSingleChangeType: 'percent',
        cumulativeLimit: 25,
        velocityBrake: 7,
        velocityBrakePeriod: 'week'
      }
    }
  ]);

  const [sortConfig, setSortConfig] = useState<{key: keyof PricingRule, direction: 'asc' | 'desc'} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<{ type: 'units' | 'hits', ruleName: string } | null>(null);

  const [filterRuleName, setFilterRuleName] = useState('Все');
  const [filterRuleNames, setFilterRuleNames] = useState<string[]>([]);
  const [filterPeriodFrom, setFilterPeriodFrom] = useState('');
  const [filterPeriodTo, setFilterPeriodTo] = useState('');

  const [formData, setFormData] = useState<Partial<PricingRule>>({
    name: '', events: ['Бронь'], frequency: 5, magnitude: 2, isIncrease: true, 
    changeType: 'percent_total', isAuto: true, groupId: 'Все помещения',
    startDate: '', endDate: '',
    limits: { 
      maxSingleChange: 5, 
      maxSingleChangeType: 'percent',
      cumulativeLimit: 20,
      velocityBrake: 5,
      velocityBrakePeriod: 'week'
    }
  });

  const requestSort = (key: keyof PricingRule) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedRules = useMemo(() => {
    let items = [...rules];
    if (filterRuleNames.length > 0) items = items.filter(r => filterRuleNames.includes(r.name));
    if (filterPeriodFrom) items = items.filter(r => new Date(r.startDate) >= new Date(filterPeriodFrom));
    if (filterPeriodTo) items = items.filter(r => new Date(r.endDate) <= new Date(filterPeriodTo));

    if (sortConfig !== null) {
      items.sort((a, b) => {
        if ((a as any)[sortConfig.key] < (b as any)[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if ((a as any)[sortConfig.key] > (b as any)[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rules, sortConfig, filterRuleNames, filterPeriodFrom, filterPeriodTo]);

  const totals = useMemo(() => {
    return sortedRules.reduce((acc, r) => ({
      units: acc.units + r.unitCount,
      hits: acc.hits + r.hits,
      profit: acc.profit + r.profit
    }), { units: 0, hits: 0, profit: 0 });
  }, [sortedRules]);

  const handleSave = () => {
    if (!formData.name?.trim()) return notify('Название правила обязательно', 'error');
    if (editingId) {
      setRules(prev => prev.map(r => r.id === editingId ? { ...r, ...formData } as PricingRule : r));
      notify('Правило обновлено');
    } else {
      const newRule: PricingRule = {
        id: `r${Date.now()}`,
        name: formData.name!,
        createdAt: new Date().toISOString().split('T')[0],
        events: formData.events || [],
        frequency: formData.frequency || 1,
        magnitude: formData.magnitude || 0,
        isIncrease: formData.isIncrease !== false,
        changeType: formData.changeType || 'percent_total',
        groupId: formData.groupId || 'Все',
        startDate: formData.startDate || '-',
        endDate: formData.endDate || '-', 
        isAuto: formData.isAuto !== false,
        status: 'active', hits: 0, profit: 0, unitCount: 15,
        limits: (formData.limits as any) || { 
          maxSingleChange: 10, 
          maxSingleChangeType: 'percent',
          cumulativeLimit: 20,
          velocityBrake: 5,
          velocityBrakePeriod: 'week'
        }
      };
      setRules([newRule, ...rules]);
      notify('Правило создано');
    }
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '', events: ['Бронь'], frequency: 1, magnitude: 0, isIncrease: true, 
      changeType: 'percent_total', isAuto: true, groupId: 'Все помещения', startDate: '', endDate: '',
      limits: { 
        maxSingleChange: 10, 
        maxSingleChangeType: 'percent',
        cumulativeLimit: 20,
        velocityBrake: 5,
        velocityBrakePeriod: 'week'
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <MultiSelect 
            label="Правило" 
            values={filterRuleNames} 
            options={rules.map(r => r.name)} 
            onChange={setFilterRuleNames} 
          />
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">Период действия</label>
            <div className="flex gap-2">
              <input type="date" value={filterPeriodFrom} onChange={e => setFilterPeriodFrom(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
              <input type="date" value={filterPeriodTo} onChange={e => setFilterPeriodTo(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
          <button onClick={() => { setFilterRuleNames([]); setFilterPeriodFrom(''); setFilterPeriodTo(''); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-danger transition-all shadow-sm mt-5"><RotateCcw className="w-4 h-4" /></button>
        </div>
        
        <div className="flex gap-3 mt-5">
           <button className="flex items-center gap-2 bg-success text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-success/10 hover:brightness-105 transition-all"><Download className="w-5 h-5" /> Скачать в Excel</button>
           <button onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }} className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:brightness-105 transition-all active:scale-95"><Plus className="w-5 h-5" /> Создать</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] tracking-widest border-b h-14">
              <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group" onClick={() => requestSort('name')}>
                 Правило <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-primary transition-all" onClick={() => requestSort('createdAt')}>
                 Дата создания <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" />
              </th>
              <th className="px-4 py-3">Период действия</th>
              <th className="px-4 py-3">Событие</th>
              <th className="px-4 py-3">Частота</th>
              <th className="px-4 py-3">Изменение стоимости</th>
              <th className="px-4 py-3">Группа</th>
              <th className="px-4 py-3 text-center">Кол-во помещений</th>
              <th className="px-4 py-3 text-center">Кол-во срабатываний</th>
              <th className="px-4 py-3 text-right text-success font-black">Выгода (Млн)</th>
              <th className="px-6 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedRules.map(rule => (
              <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors h-16">
                <td className="px-6 py-3 font-bold text-slate-700">{rule.name}</td>
                <td className="px-4 py-3 text-slate-400 font-medium">{formatDate(rule.createdAt)}</td>
                <td className="px-4 py-3 text-slate-400 font-medium italic">{rule.startDate} — {rule.endDate}</td>
                <td className="px-4 py-3 text-slate-600 font-medium">{rule.events?.join(', ') || '-'}</td>
                <td className="px-4 py-3 text-slate-600 font-medium">Через каждые {rule.frequency} шт</td>
                <td className={`px-4 py-3 font-black ${rule.isIncrease ? 'text-primary' : 'text-danger'}`}>
                  {rule.isIncrease ? '+' : '-'}{rule.magnitude}{rule.changeType.includes('percent') ? '%' : ' ₽'}
                </td>
                <td className="px-4 py-3 font-bold text-slate-400">{rule.groupId}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setViewingDetail({ type: 'units', ruleName: rule.name })} className="bg-blue-50 text-primary px-3 py-1 rounded-full text-[11px] font-black hover:bg-primary hover:text-white transition-all underline decoration-primary/30 underline-offset-4">{rule.unitCount}</button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setViewingDetail({ type: 'hits', ruleName: rule.name })} className="bg-slate-50 text-slate-700 px-3 py-1 rounded-full text-[11px] font-black hover:bg-slate-200 transition-all underline decoration-slate-300 underline-offset-4">{rule.hits}</button>
                </td>
                <td className="px-4 py-3 text-right text-success font-black">+{rule.profit.toFixed(1)} млн</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? {...r, status: r.status === 'active' ? 'paused' : 'active'} : r))} className={`p-2 transition-all rounded-lg ${rule.status === 'active' ? 'text-success bg-success/5 hover:bg-success/10' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                       {rule.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setEditingId(rule.id); setFormData({...rule}); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('Удалить правило?')) setRules(prev => prev.filter(r => r.id !== rule.id)); }} className="p-2 text-slate-300 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80 font-black text-[11px] text-slate-800 uppercase tracking-widest border-t-2 border-slate-100">
            <tr>
              <td colSpan={7} className="px-6 py-5 text-right">Итого по активным правилам</td>
              <td className="px-4 text-center font-black text-slate-800">{totals.units}</td>
              <td className="px-4 text-center font-black text-slate-800">{totals.hits}</td>
              <td className="px-4 text-right text-success font-black text-sm">+{totals.profit.toFixed(1)} млн</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[560px] h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r overflow-hidden">
            <div className="px-10 pt-10 pb-6 border-b border-slate-50">
              <h2 className="text-[22px] font-black text-slate-800 mb-6">{editingId ? 'Редактирование правила' : 'Создание правила ценообразования'}</h2>
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Выйти без сохранения</button>
                <button onClick={handleSave} className="flex-1 bg-primary text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95 transition-all">Сохранить</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 pt-6 custom-scrollbar space-y-8">
               <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Название правила <span className="text-danger">*</span></label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Напр: Повышение 10% после 5 броней" className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none" />
               </div>

               <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Действие</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormData({...formData, isIncrease: true})}
                      className={`py-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black uppercase text-sm transition-all ${formData.isIncrease ? 'bg-success/10 border-success text-success' : 'bg-white border-slate-100 text-slate-300 opacity-60'}`}
                    >
                      <ArrowUp className="w-5 h-5" /> Повысить
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, isIncrease: false})}
                      className={`py-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black uppercase text-sm transition-all ${!formData.isIncrease ? 'bg-danger/10 border-danger text-danger' : 'bg-white border-slate-100 text-slate-300 opacity-60'}`}
                    >
                      <ArrowDown className="w-5 h-5" /> Понизить
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Событие</label>
                    <select value={formData.events?.[0]} onChange={e => {
                      const value = e.target.value;
                      setFormData({
                        ...formData, 
                        events: [value],
                        planCompletionPercent: value === '% выполнения плана' ? formData.planCompletionPercent || 0 : undefined
                      });
                    }} className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer">
                      <option>Бронь</option>
                      <option>Резерв</option>
                      <option>Продажа</option>
                      <option>% выполнения плана</option>
                    </select>
                    {formData.events?.[0] === '% выполнения плана' && (
                      <div className="mt-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Значение %</label>
                        <input
                          type="number"
                          value={formData.planCompletionPercent || ''}
                          onChange={e => setFormData({...formData, planCompletionPercent: Number(e.target.value)})}
                          placeholder="Введите % выполнения плана"
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none"
                          min="0"
                          max="100"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Через каждую</label>
                    <input type="number" value={formData.frequency} onChange={e => setFormData({...formData, frequency: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Изменить</label>
                    <select 
                      value={formData.changeType} 
                      onChange={e => {
                        const value = e.target.value;
                        setFormData({
                          ...formData, 
                          changeType: value as any,
                          promotionType: value === 'promotion' ? formData.promotionType || '' : undefined
                        });
                      }} 
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="percent_total">процент от общей цены</option>
                      <option value="fixed_m2">рублей за м²</option>
                      <option value="fixed_total">фиксированная сумма</option>
                      <option value="promotion">запуск акции</option>
                    </select>
                    {formData.changeType === 'promotion' && (
                      <div className="mt-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Тип акции</label>
                        <select
                          value={formData.promotionType || ''}
                          onChange={e => setFormData({...formData, promotionType: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer"
                        >
                          <option value="">Выберите тип акции</option>
                          <option value="discount">Скидка</option>
                          <option value="bonus">Бонус</option>
                          <option value="special_offer">Специальное предложение</option>
                          <option value="seasonal">Сезонная акция</option>
                          <option value="clearance">Распродажа</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">На сколько</label>
                    <div className="relative">
                      <input type="number" value={formData.magnitude} onChange={e => setFormData({...formData, magnitude: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl pl-4 pr-10 py-4 text-sm font-bold outline-none" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">{formData.changeType === 'percent_total' ? '%' : '₽'}</span>
                    </div>
                  </div>
               </div>

               {/* New Constraints Section */}
               <div className="space-y-6 pt-6 border-t-2 border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" /> Ограничения
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Максимальная цена изменения</label>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" title="Максимальное изменение цены за один раз" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData.limits?.maxSingleChange} 
                            onChange={e => setFormData({...formData, limits: { ...formData.limits!, maxSingleChange: Number(e.target.value) } })} 
                            className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none" 
                            placeholder="Напр: 10"
                          />
                        </div>
                        <select 
                          value={formData.limits?.maxSingleChangeType} 
                          onChange={e => setFormData({...formData, limits: { ...formData.limits!, maxSingleChangeType: e.target.value as any } })} 
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer"
                        >
                          <option value="percent">Проценты</option>
                          <option value="fixed">Рубли</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Период действия ограничения</label>
                        <Timer className="w-3.5 h-3.5 text-slate-300 cursor-help" title="На какой период действует ограничение" />
                      </div>
                      <select 
                        value={formData.limits?.velocityBrakePeriod} 
                        onChange={e => setFormData({...formData, limits: { ...formData.limits!, velocityBrakePeriod: e.target.value as any } })} 
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer"
                      >
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                        <option value="all">Все время работы правила</option>
                      </select>
                      <p className="text-[10px] text-slate-400 font-medium pl-1 italic">Определяет, как долго действует ограничение на изменение цены</p>
                    </div>
                  </div>
               </div>

               <div className="space-y-1.5 pt-4 border-t border-slate-50">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Группа помещений</label>
                  <select value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer"><option>Все помещения</option><option>Видовые студии</option><option>Группа ГринПарк</option></select>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Период действия</label>
                  <div className="flex gap-2">
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
               </div>

               <div className="space-y-1.5 pt-4 border-t border-slate-50">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pl-1">Способ изменения цены</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFormData({...formData, isAuto: true})}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        formData.isAuto 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Автоматически
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, isAuto: false})}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        !formData.isAuto 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Ручное подтверждение
                    </button>
                  </div>
               </div>

               <button onClick={resetForm} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-[13px]"><RotateCcw className="w-4 h-4" /> Сбросить фильтры</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Lists */}
      {viewingDetail && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setViewingDetail(null)} />
           <div className="relative bg-white w-full max-w-4xl h-[70vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{viewingDetail.type === 'units' ? 'Помещения в правиле' : 'История срабатываний'}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Правило: {viewingDetail.ruleName}</p>
                 </div>
                 <button onClick={() => setViewingDetail(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <table className="w-full text-left">
                  {viewingDetail.type === 'units' ? (
                    <>
                      <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                        <th className="pb-4">Проект</th>
                        <th className="pb-4">Секция</th>
                        <th className="pb-4">№ Помещения</th>
                        <th className="pb-4">Этаж</th>
                        <th className="pb-4">Площадь</th>
                        <th className="pb-4 text-right">Текущая цена</th>
                        <th className="pb-4 text-right">Текущая цена за м²</th>
                      </tr>
                    </thead>
                      <tbody className="divide-y divide-slate-50">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <tr key={i} className="text-sm">
                            <td className="py-4 font-bold text-slate-700">ЖК "Солнечный"</td>
                            <td className="py-4 font-medium text-slate-500">Секция {Math.floor(i/4)+1}</td>
                            <td className="py-4 font-bold text-slate-700">{100 + i}</td>
                            <td className="py-4 font-medium text-slate-500">{Math.floor(i/3)+2}</td>
                            <td className="py-4 font-black text-primary italic">{(35 + i * 2.5).toFixed(1)} м²</td>
                            <td className="py-4 text-right font-black text-slate-800">{(6500000 + i * 150000).toLocaleString()} ₽</td>
                            <td className="py-4 text-right font-black text-slate-800">{Math.round((6500000 + i * 150000) / (35 + i * 2.5)).toLocaleString()} ₽/м²</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                        <th className="pb-4">Дата и время</th>
                        <th className="pb-4">Изменение</th>
                        <th className="pb-4 text-center">% изменения</th>
                        <th className="pb-4 text-right">руб</th>
                      </tr>
                    </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { date: '25.05.2025 14:30', change: '+425000', percent: '+5%', rub: 425000 },
                          { date: '22.05.2025 11:15', change: '+400000', percent: '+5%', rub: 400000 },
                        ].map((hit, i) => (
                          <tr key={i} className="text-sm">
                            <td className="py-4 font-medium text-slate-400">{hit.date}</td>
                            <td className="py-4 text-center font-black text-success">{hit.change}</td>
                            <td className="py-4 text-center font-black text-primary">{hit.percent}</td>
                            <td className="py-4 text-right font-black text-slate-800">{hit.rub.toLocaleString()} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RulesEngine;
