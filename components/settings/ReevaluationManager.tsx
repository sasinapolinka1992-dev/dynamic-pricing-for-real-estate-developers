
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Copy, Save, X, Power, PowerOff, SaveAll, FileText, Search, Filter, RotateCcw, Check, ChevronDown, Download, ArrowUpDown
} from 'lucide-react';
import { ReevaluationRule, UnitStatus } from '../../types';

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

const SearchableSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
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
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer flex justify-between items-center">
        <span className="truncate">{value || 'Все'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="p-2 border-b border-slate-50"><input autoFocus className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <div className="px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer font-bold text-slate-400" onClick={() => { onChange('Все'); setIsOpen(false); setSearch(''); }}>Все</div>
            {filtered.map(opt => (<div key={opt} className="px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer font-bold text-slate-700" onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}>{opt}</div>))}
          </div>
        </div>
      )}
    </div>
  );
};

const ReevaluationManager: React.FC = () => {
  const [rules, setRules] = useState<ReevaluationRule[]>([
    {
      id: 'rev-1',
      name: 'Переоценка брони (2 дня)',
      createdAt: '2023-11-15',
      triggerStatus: UnitStatus.RESERVED,
      daysThreshold: 2,
      project: 'Грин Парк',
      section: '1.1',
      unitType: 'Квартиры',
      rooms: '1К',
      method: 'auto',
      isActive: true,
      triggerCount: 15
    }
  ]);

  const [filterRule, setFilterRule] = useState('Все');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof ReevaluationRule, direction: 'asc' | 'desc'} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<{type: 'triggers' | 'units', ruleName: string} | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', triggerStatus: UnitStatus.RESERVED, days: 2, method: 'auto' as 'auto'|'manual',
    project: 'Грин Парк', section: '1.1', unitType: 'Квартиры', rooms: '1К'
  });

  const requestSort = (key: keyof ReevaluationRule) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedRules = useMemo(() => {
    let items = [...rules];
    if (filterRule !== 'Все') items = items.filter(r => r.name === filterRule);
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

  const handleSave = () => {
    if (!formData.name.trim()) return notify('Название правила обязательно', 'error');
    if (editingId) {
      setRules(prev => prev.map(r => r.id === editingId ? { ...r, ...formData, name: formData.name, daysThreshold: formData.days } : r));
      notify('Правило обновлено');
    } else {
      setRules([{ ...formData, id: `rev-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], daysThreshold: formData.days, isActive: true } as any, ...rules]);
      notify('Правило создано');
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <SearchableSelect label="Правило" value={filterRule} options={rules.map(r => r.name)} onChange={setFilterRule} />
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">Период создания</label>
            <div className="flex gap-2">
              <input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
              <input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
            </div>
          </div>
          <button onClick={() => { setFilterRule('Все'); setPeriodFrom(''); setPeriodTo(''); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-danger mt-5 shadow-sm transition-all"><RotateCcw className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="bg-success text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-success/10 flex items-center gap-2 hover:brightness-105 transition-all"><Download className="w-4 h-4" /> Скачать в Excel</button>
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:brightness-105 transition-all active:scale-95"><Plus className="w-5 h-5" /> Создать</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] tracking-widest border-b h-14">
              <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group" onClick={() => requestSort('name')}>Правило <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" /></th>
              <th className="px-4 py-3 cursor-pointer hover:text-primary transition-all group" onClick={() => requestSort('createdAt')}>Дата создания <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" /></th>
              <th className="px-6 py-3">Триггер</th>
              <th className="px-6 py-3">Проект</th>
              <th className="px-6 py-3">Секция</th>
              <th className="px-6 py-3">Тип / Комнат.</th>
              <th className="px-6 py-3 text-center">Кол-во срабатываний</th>
              <th className="px-6 py-3 text-center">Кол-во помещений</th>
              <th className="px-6 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedRules.map(rule => (
              <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors h-16">
                <td className="px-6 py-3 font-bold text-slate-700">{rule.name}</td>
                <td className="px-4 py-3 text-slate-400 font-medium">{rule.createdAt}</td>
                <td className="px-6 py-3"><div className="flex flex-col"><span className="font-black text-primary uppercase text-[10px] tracking-tight">{rule.triggerStatus}</span><span className="text-[10px] text-slate-400 font-bold italic">порог: {rule.daysThreshold} дн.</span></div></td>
                <td className="px-6 py-3 font-bold text-slate-800">{rule.project}</td>
                <td className="px-6 py-3 font-black text-primary uppercase">{rule.section}</td>
                <td className="px-6 py-3 text-slate-500 font-medium italic">{rule.unitType} / {rule.rooms}</td>
                <td className="px-6 py-3 text-center font-black text-primary cursor-pointer hover:text-primary/80 transition-colors" onClick={() => setViewingDetail({ type: 'triggers', ruleName: rule.name })}>{rule.triggerCount}</td>
                <td className="px-6 py-3 text-center font-black text-slate-800 cursor-pointer hover:text-primary/80 transition-colors" onClick={() => setViewingDetail({ type: 'units', ruleName: rule.name })}>{rule.unitCount}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? {...r, isActive: !r.isActive} : r))} className={`p-2 transition-all rounded-lg ${rule.isActive ? 'text-success bg-success/5 hover:bg-success/10' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`}>{rule.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}</button>
                    <button onClick={() => { setEditingId(rule.id); setFormData({...rule, days: rule.daysThreshold}); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('Удалить правило?')) setRules(prev => prev.filter(r => r.id !== rule.id)); }} className="p-2 text-slate-300 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-black text-[11px] text-slate-800 uppercase tracking-widest border-t-2 border-slate-200">
            <tr>
              <td colSpan={6} className="px-6 py-4 text-left">Итого по активным правилам</td>
              <td className="px-6 py-4 text-center font-black text-primary">{sortedRules.filter(r => r.isActive).reduce((sum, r) => sum + r.triggerCount, 0)}</td>
              <td className="px-6 py-4 text-center font-black text-slate-800">{sortedRules.filter(r => r.isActive).reduce((sum, r) => sum + r.unitCount, 0)}</td>
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
                <div className="flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Выйти без сохранения</button>
                  <button onClick={handleSave} className="flex-1 bg-primary text-white rounded-xl py-3 text-[13px] font-bold shadow-lg shadow-primary/20 transition-all">Сохранить</button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-6 custom-scrollbar">
                <div className="space-y-1.5 pt-2">
                  <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Название правила <span className="text-danger">*</span></label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] font-bold text-slate-700 focus:border-primary outline-none transition-all shadow-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Статус-триггер</label>
                  <select value={formData.triggerStatus} onChange={e => setFormData({...formData, triggerStatus: e.target.value as UnitStatus})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                    <option value={UnitStatus.RESERVED}>Бронь</option>
                    <option value={UnitStatus.RESERVE}>Резерв</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Количество дней</label>
                  <input type="number" value={formData.days} onChange={e => setFormData({...formData, days: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Проект</label>
                    <select value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>Грин Парк</option>
                      <option>ЖК Авеню</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Секция</label>
                    <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>1.1</option>
                      <option>1.2</option>
                      <option>2.1</option>
                      <option>2.2</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Тип помещения</label>
                    <select value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>Квартиры</option>
                      <option>Апартаменты</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Комнатность</label>
                    <select value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none">
                      <option>Студия</option>
                      <option>1К</option>
                      <option>2К</option>
                      <option>3К</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] text-slate-400 font-medium block pl-1 uppercase tracking-widest font-black text-[10px]">Способ изменения</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button onClick={() => setFormData({...formData, method: 'auto'})} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${formData.method === 'auto' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>
                      Автоматически
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
      {viewingDetail && (
        <div className="fixed inset-0 z-[1000] flex justify-center items-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingDetail(null)} />
          <div className="relative bg-white w-full max-w-4xl h-[70vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {viewingDetail.type === 'triggers' ? 'История срабатываний' : 'Помещения в правиле'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Правило: {viewingDetail.ruleName}</p>
              </div>
              <button onClick={() => setViewingDetail(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <table className="w-full text-left">
                {viewingDetail.type === 'triggers' ? (
                  <>
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                        <th className="pb-4">Дата и время</th>
                        <th className="pb-4">Номер помещения</th>
                        <th className="pb-4">Изменение</th>
                        <th className="pb-4">Новая стоимость</th>
                        <th className="pb-4">Цена за м²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { dateTime: '25.05.2025 14:30', unit: '102', change: '+425000', newPrice: 8925000, pricePerM2: 255000 },
                        { dateTime: '22.05.2025 11:15', unit: '105', change: '+400000', newPrice: 8400000, pricePerM2: 240000 },
                      ].map((hit, i) => (
                        <tr key={i} className="text-sm">
                          <td className="py-4 font-medium text-slate-400">{hit.dateTime}</td>
                          <td className="py-4 font-bold text-slate-700">№{hit.unit}</td>
                          <td className="py-4 text-center font-black text-success">{hit.change}</td>
                          <td className="py-4 text-right font-black text-primary">{hit.newPrice.toLocaleString()} ₽</td>
                          <td className="py-4 text-right font-black text-slate-800">{hit.pricePerM2.toLocaleString()} ₽/м²</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                        <th className="pb-4">Номер помещения</th>
                        <th className="pb-4">Этаж</th>
                        <th className="pb-4">Площадь</th>
                        <th className="pb-4">Текущая стоимость</th>
                        <th className="pb-4">Цена за м²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <tr key={i} className="text-sm">
                          <td className="py-4 font-bold text-slate-700">{100 + i}</td>
                          <td className="py-4 font-medium text-slate-500">{Math.floor(i/3)+2}</td>
                          <td className="py-4 font-black text-primary italic">{(35 + i * 2.5).toFixed(1)} м²</td>
                          <td className="py-4 text-right font-black text-slate-800">{(6500000 + i * 150000).toLocaleString()} ₽</td>
                          <td className="py-4 text-right font-black text-slate-800">{Math.round((6500000 + i * 150000) / (35 + i * 2.5)).toLocaleString()} ₽/м²</td>
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
export default ReevaluationManager;
