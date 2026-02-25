
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Copy, Save, X, Power, PowerOff, SaveAll, FileText, Search, Filter, RotateCcw, Check, ChevronDown, Download, ArrowUpDown
} from 'lucide-react';
import { AssortmentRule } from '../../types';

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

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
    <div className="space-y-1.5 flex-1 max-w-[240px] relative" ref={containerRef}>
      <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer flex justify-between items-center min-h-[42px]"
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

const AssortmentManager: React.FC = () => {
  const [rules, setRules] = useState<AssortmentRule[]>([
    {
      id: 'as-1',
      name: 'Минимум 5 студий в продаже',
      createdAt: '2023-10-12',
      unitValueType: 'шт',
      minQuantity: 5,
      project: 'Грин Парк',
      section: '1.1',
      unitType: 'Квартиры',
      rooms: 'Студия',
      method: 'auto',
      isActive: true,
      triggerCount: 8
    }
  ]);

  const [filterRule, setFilterRule] = useState<string[]>([]);
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: keyof AssortmentRule, direction: 'asc' | 'desc'} | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', min: 5, type: 'шт' as 'шт'|'%', project: 'Грин Парк', section: '1.1', unitType: 'Квартиры', rooms: '1К', method: 'auto' as 'auto'|'manual'
  });

  const requestSort = (key: keyof AssortmentRule) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedRules = useMemo(() => {
    let items = [...rules];
    if (filterRule.length > 0) items = items.filter(r => filterRule.includes(r.name));
    if (periodFrom) items = items.filter(r => new Date(r.createdAt) >= new Date(periodFrom));
    if (periodTo) items = items.filter(r => new Date(r.createdAt) <= new Date(periodTo));

    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rules, sortConfig, filterRule, periodFrom, periodTo]);

  const totals = useMemo(() => {
    return sortedRules.reduce((acc, r) => ({ active: acc.active + (r.isActive ? 1 : 0), qty: acc.qty + r.minQuantity }), { active: 0, qty: 0 });
  }, [sortedRules]);

  // Added handleSave function to fix line 139 error
  const handleSave = () => {
    if (!formData.name.trim()) return notify('Название правила обязательно', 'error');
    if (editingId) {
      setRules(prev => prev.map(r => r.id === editingId ? { 
        ...r, 
        name: formData.name, 
        minQuantity: formData.min, 
        unitValueType: formData.type as 'шт' | '%',
        project: formData.project,
        section: formData.section,
        unitType: formData.unitType,
        rooms: formData.rooms,
        method: formData.method
      } : r));
      notify('Правило обновлено');
    } else {
      const newRule: AssortmentRule = {
        id: `as-${Date.now()}`,
        name: formData.name,
        createdAt: new Date().toISOString().split('T')[0],
        unitValueType: formData.type as 'шт' | '%',
        minQuantity: formData.min,
        project: formData.project,
        section: formData.section,
        unitType: formData.unitType,
        rooms: formData.rooms,
        method: formData.method,
        isActive: true,
        triggerCount: 0
      };
      setRules([newRule, ...rules]);
      notify('Правило создано');
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <MultiSelect 
            label="Правило" 
            values={filterRule} 
            options={rules.map(r => r.name)} 
            onChange={setFilterRule} 
            placeholder="Все правила"
          />
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">Период создания</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={periodFrom} 
                onChange={e => setPeriodFrom(e.target.value)} 
                className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
              />
              <input 
                type="date" 
                value={periodTo} 
                onChange={e => setPeriodTo(e.target.value)} 
                className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">&nbsp;</label>
            <button 
              onClick={() => { 
                setFilterRule([]); 
                setPeriodFrom(''); 
                setPeriodTo(''); 
              }} 
              className="bg-white border border-slate-200 text-slate-700 rounded-xl p-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="bg-success text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-success/10 flex items-center gap-2 hover:brightness-105 transition-all"><Download className="w-4 h-4" /> Скачать в Excel</button>
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all"><Plus className="w-5 h-5" /> Создать</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] tracking-widest border-b h-14">
              <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group" onClick={() => requestSort('name')}>Правило <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" /></th>
              <th className="px-4 py-3">Дата создания</th>
              <th className="px-4 py-3 text-center">Мин. кол-во помещений</th>
              <th className="px-4 py-3">Проект</th>
              <th className="px-4 py-3">Секция</th>
              <th className="px-4 py-3">Тип помещения</th>
              <th className="px-4 py-3">Комнатность</th>
              <th className="px-6 py-3 text-center">Кол-во срабатываний</th>
              <th className="px-6 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedRules.map(rule => (
              <tr key={rule.id} className="h-16 hover:bg-slate-50 transition-all">
                <td className="px-6 py-3 font-bold text-slate-700">{rule.name}</td>
                <td className="px-4 py-3 text-slate-400">{rule.createdAt}</td>
                <td className="px-4 py-3 text-center font-black">{rule.minQuantity} {rule.unitValueType}</td>
                <td className="px-4 py-3 font-bold text-slate-500">{rule.project}</td>
                <td className="px-4 py-3 font-medium text-slate-600">{rule.section}</td>
                <td className="px-4 py-3 font-medium text-slate-600">{rule.unitType}</td>
                <td className="px-4 py-3 font-medium text-slate-600">{rule.rooms}</td>
                <td className="px-6 py-3 text-center font-black text-primary">{rule.triggerCount}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? {...r, isActive: !r.isActive} : r))} className={`p-2 transition-all rounded-lg ${rule.isActive ? 'text-success bg-success/5' : 'text-slate-300'}`}>
                      {rule.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setEditingId(rule.id); setFormData({...rule, min: rule.minQuantity, type: rule.unitValueType as any}); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if(window.confirm('Удалить правило?')) setRules(prev => prev.filter(r => r.id !== rule.id)); }} className="p-2 text-slate-300 hover:text-danger transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-black text-[11px] text-slate-800 uppercase tracking-widest border-t-2 border-slate-200">
            <tr>
              <td colSpan={7} className="px-6 py-4 text-left">Итого по активным правилам</td>
              <td className="px-6 py-4 text-center font-black text-primary">{sortedRules.filter(r => r.isActive).reduce((sum, r) => sum + r.triggerCount, 0)}</td>
              <td className="px-6 py-4 text-right">{sortedRules.filter(r => r.isActive).length} правил</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[440px] h-full shadow-2xl flex flex-col border-r animate-in slide-in-from-left duration-300 overflow-hidden">
             <div className="p-8 pb-4 space-y-6">
                <h2 className="text-[20px] font-black text-slate-800">{editingId ? 'Редактирование' : 'Создание'} правила</h2>
                <div className="flex gap-3"><button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-[13px] font-bold text-slate-700">Выйти</button><button onClick={handleSave} className="flex-1 bg-primary text-white rounded-xl py-3 text-[13px] font-bold transition-all">Сохранить</button></div>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-5 custom-scrollbar">
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Название правила</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] font-bold outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Величина</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'шт'|'%'})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option value="шт">шт</option>
                      <option value="%">%</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Мин. кол-во помещений</label>
                    <input type="number" value={formData.min} onChange={e => setFormData({...formData, min: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Проект</label>
                    <select value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>Грин Парк</option>
                      <option>ЖК Авеню</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Секция</label>
                    <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>1.1</option>
                      <option>1.2</option>
                      <option>2.1</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Тип помещения</label>
                    <select value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>Квартиры</option>
                      <option>Апартаменты</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Комнатность</label>
                    <select value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>Студия</option>
                      <option>1К</option>
                      <option>2К</option>
                      <option>3К</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Изменение цены</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button onClick={() => setFormData({...formData, method: 'auto'})} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${formData.method === 'auto' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>
                      Автоматическое
                    </button>
                    <button onClick={() => setFormData({...formData, method: 'manual'})} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${formData.method === 'manual' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>
                      Ручное
                    </button>
                  </div>
                </div>

                <button onClick={() => { setFilterRule('Все'); setPeriodFrom(''); setPeriodTo(''); }} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-[13px]"><RotateCcw className="w-4 h-4" /> Сбросить фильтры</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AssortmentManager;
