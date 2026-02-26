import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Save, Link as LinkIcon, Download, ChevronDown, 
  RotateCcw, Calendar, X, Upload, Maximize2, Table, 
  Edit2, Minimize2, HelpCircle, PenLine, Info, ArrowRight, SaveAll, RefreshCw, ArrowUpDown, FileSpreadsheet,
  ArrowUp, ArrowDown, Check, Search, Tag, Settings, DollarSign, Calculator, Coins, Zap, ArrowLeft, Trash2
} from 'lucide-react';
import Chessboard from './Chessboard';
import PricingSimulator from './PricingSimulator';
import { Unit, UnitStatus } from '../types';
import { MOCK_UNITS } from '../constants';

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
      <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">{label}</label>
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

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

interface TagDefinition {
  id: string;
  name: string;
  type: string; // '%', '₽/м²', '₽'
  influence: 'повысить' | 'понизить';
  value: number;
  comment: string;
}

const StartSalesPricing: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'pricing' | 'simulator'>('pricing');
  const [localUnits, setLocalUnits] = useState<Unit[]>(() => MOCK_UNITS.map(u => ({ ...u, currentPrice: u.currentPrice || 5600000, tags: [] })));
  const [tags, setTags] = useState<TagDefinition[]>([
    { id: 't1', name: 'Вид на озеро', type: '%', influence: 'повысить', value: 5, comment: 'Премиальный вид' },
    { id: 't2', name: 'Первый этаж', type: '%', influence: 'понизить', value: 3, comment: 'Дисконт за этаж' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [isBasePriceModalOpen, setIsBasePriceModalOpen] = useState(false);
  const [isMassChangeModalOpen, setIsMassChangeModalOpen] = useState(false);
  
  const [newTagData, setNewTagData] = useState<Partial<TagDefinition>>({ name: '', type: '%', influence: 'повысить', value: 5, comment: '' });
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [basePriceValue, setBasePriceValue] = useState('180000');
  const [massChangeValue, setMassChangeValue] = useState('5');
  const [massChangeType, setMassChangeType] = useState<any>('%');
  const [massChangeValueType, setMassChangeValueType] = useState<'₽' | '%'>('₽');
  const [massChangeValueTarget, setMassChangeValueTarget] = useState<'₽' | '₽/м²'>('₽');

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('Удалить этот тег?')) {
      setTags(prev => prev.filter(t => t.id !== tagId));
      setSelectedTagIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tagId);
        return newSet;
      });
      notify('Тег удален');
    }
  };

  const handleApplyTags = () => {
    if (selectedTagIds.size > 0 && selectedUnits.size > 0) {
      const selectedTags = tags.filter(t => selectedTagIds.has(t.id));
      // Применяем теги к выбранным помещениям
      setLocalUnits(prev => prev.map(unit => {
        if (selectedUnits.has(unit.id)) {
          const existingTags = unit.tags || [];
          const newTags = selectedTags.map(tag => tag.name);
          const uniqueTags = [...new Set([...existingTags, ...newTags])];
          return { ...unit, tags: uniqueTags };
        }
        return unit;
      }));
      
      notify(`Применено ${selectedTagIds.size} тегов к ${selectedUnits.size} помещениям`, 'success');
      setSelectedUnits(new Set());
      setSelectedTagIds(new Set());
    }
  };

  const handleSaveTag = () => {
    if (!newTagData.name?.trim()) return notify('Название тега обязательно', 'error');
    if (editingTagId) {
      setTags(prev => prev.map(t => t.id === editingTagId ? { ...t, ...newTagData } as TagDefinition : t));
      notify('Тег обновлен');
    } else {
      const tag: TagDefinition = { ...newTagData, id: `t-${Date.now()}` } as TagDefinition;
      setTags([...tags, tag]);
      notify('Тег создан');
    }
    setIsCreateTagOpen(false);
    setEditingTagId(null);
  };

  const handleApplyBasePrice = () => {
    const pricePerM2 = Number(basePriceValue);
    setLocalUnits(prev => prev.map(u => selectedUnits.has(u.id) ? { ...u, currentPrice: pricePerM2 * u.area } : u));
    notify(`Цена ${pricePerM2.toLocaleString()} ₽/м² применена к ${selectedUnits.size} помещениям`);
    setIsBasePriceModalOpen(false);
  };

  const handleApplyMassChange = (increase: boolean) => {
    const val = Number(massChangeValue);
    setLocalUnits(prev => prev.map(u => {
      if (!selectedUnits.has(u.id)) return u;
      let newPrice = u.currentPrice;
      
      if (massChangeValueType === '%') {
        newPrice = increase ? u.currentPrice * (1 + val/100) : u.currentPrice * (1 - val/100);
      } else if (massChangeValueType === '₽') {
        if (massChangeValueTarget === '₽') {
          newPrice = increase ? u.currentPrice + val : u.currentPrice - val;
        } else if (massChangeValueTarget === '₽/м²') {
          newPrice = increase ? u.currentPrice + (val * u.area) : u.currentPrice - (val * u.area);
        }
      }
      
      return { ...u, currentPrice: newPrice };
    }));
    notify(`${increase ? 'Повышение' : 'Снижение'} применено`);
    setIsMassChangeModalOpen(false);
  };

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative h-full">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm sticky top-0 z-[200]">
        <div className="flex items-center gap-3">
          {activeStep === 'pricing' ? (
            <>
              <button onClick={() => setIsBasePriceModalOpen(true)} className="flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 hover:border-primary transition-all"><DollarSign className="w-4 h-4 text-primary" /> Установить цену за м²</button>
              <button onClick={() => setIsMassChangeModalOpen(true)} className="flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 hover:border-primary transition-all"><Calculator className="w-4 h-4 text-primary" /> Массовое изменение</button>
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <button onClick={() => setActiveStep('simulator')} className="flex items-center gap-2.5 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 hover:bg-primary hover:text-white transition-all"><Zap className="w-4 h-4" /> Симулятор</button>
            </>
          ) : (
            <button onClick={() => setActiveStep('pricing')} className="flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"><ArrowLeft className="w-4 h-4 text-primary" /> Назад</button>
          )}
        </div>
        {activeStep === 'pricing' && (
          <div className="flex items-center gap-6 pr-2">
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Выбрано <span className="text-primary">{selectedUnits.size}</span> лотов</span>
             <button onClick={handleApplyTags} disabled={selectedUnits.size === 0 || selectedTagIds.size === 0} className={`px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedUnits.size > 0 && selectedTagIds.size > 0 ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Применить теги ({selectedTagIds.size})</button>
          </div>
        )}
      </div>

      {activeStep === 'pricing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[800px]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/20">
               <button onClick={() => { setEditingTagId(null); setNewTagData({ name: '', type: '%', influence: 'повысить', value: 5, comment: '' }); setIsCreateTagOpen(true); }} className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] py-4 bg-white rounded-2xl border border-primary/10 shadow-sm active:scale-95 mb-8 hover:bg-blue-50 transition-all"><Plus className="w-5 h-5" /> Создать тег</button>
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Библиотека тегов</h3>
               <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all" /></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
              {filteredTags.map(tag => (
                <div key={tag.id} onClick={() => {
                  const newSelected = new Set(selectedTagIds);
                  if (newSelected.has(tag.id)) {
                    newSelected.delete(tag.id);
                  } else {
                    newSelected.add(tag.id);
                  }
                  setSelectedTagIds(newSelected);
                }} className={`group flex items-center justify-between p-5 rounded-[24px] cursor-pointer border-2 transition-all ${selectedTagIds.has(tag.id) ? 'bg-blue-50 border-primary ring-4 ring-primary/5' : 'bg-white border-transparent hover:border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedTagIds.has(tag.id) ? 'bg-primary border-primary' : 'bg-slate-100 border-slate-300'}`}>
                      {selectedTagIds.has(tag.id) && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[14px] font-black tracking-tight ${selectedTagIds.has(tag.id) ? 'text-primary' : 'text-slate-700'}`}>{tag.name}</p>
                      <p className={`text-[11px] font-black uppercase mt-1.5 ${tag.influence === 'повысить' ? 'text-success' : 'text-danger'}`}>{tag.influence === 'повысить' ? '+' : '-'}{tag.value.toLocaleString()}{tag.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingTagId(tag.id); setNewTagData(tag); setIsCreateTagOpen(true); }} className="p-2 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id); }} className="p-2 text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-9 h-[800px] border border-slate-100 rounded-[40px] overflow-hidden"><Chessboard selectedUnits={selectedUnits} setSelectedUnits={setSelectedUnits} localUnits={localUnits} /></div>
        </div>
      ) : <PricingSimulator />}

      {/* Tag Creator Modal */}
      {isCreateTagOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={() => setIsCreateTagOpen(false)} />
          <div className="relative bg-white w-full max-w-[440px] h-full shadow-2xl flex flex-col border-r animate-in slide-in-from-left duration-300 overflow-hidden">
             <div className="p-8 pb-4 space-y-6">
                <h2 className="text-[20px] font-black text-slate-800">{editingTagId ? 'Редактировать тег' : 'Создать новый тег'}</h2>
                <div className="flex gap-3">
                  <button onClick={() => setIsCreateTagOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-[13px] font-bold text-slate-700">Выйти без сохранения</button>
                  <button onClick={handleSaveTag} className="flex-1 bg-primary text-white rounded-xl py-3 text-[13px] font-bold transition-all">Сохранить</button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-5 custom-scrollbar">
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Название тега <span className="text-danger">*</span></label>
                  <input 
                    value={newTagData.name} 
                    onChange={e => setNewTagData({...newTagData, name: e.target.value})} 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                    placeholder="Напр: Вид на пруд" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Тип влияния</label>
                  <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1.5">
                    <button 
                      onClick={() => setNewTagData({...newTagData, influence: 'повысить'})} 
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1 ${
                        newTagData.influence === 'повысить' ? 'bg-white text-success shadow-md ring-1 ring-success/10' : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowUp className="w-3 h-3" />
                      повысить
                    </button>
                    <button 
                      onClick={() => setNewTagData({...newTagData, influence: 'понизить'})} 
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1 ${
                        newTagData.influence === 'понизить' ? 'bg-white text-danger shadow-md ring-1 ring-danger/10' : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowDown className="w-3 h-3" />
                      понизить
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Ед. измерения</label>
                    <select 
                      value={newTagData.type} 
                      onChange={e => setNewTagData({...newTagData, type: e.target.value})} 
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="%">Процент (%)</option>
                      <option value="₽/м²">Руб/м²</option>
                      <option value="₽">Фикс. сумма (₽)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Величина</label>
                    <input 
                      type="number" 
                      value={newTagData.value} 
                      onChange={e => setNewTagData({...newTagData, value: Number(e.target.value)})} 
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Комментарий</label>
                  <textarea 
                    value={newTagData.comment} 
                    onChange={e => setNewTagData({...newTagData, comment: e.target.value})} 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none h-32 resize-none" 
                    placeholder="Краткое описание тега..." 
                  />
                </div>

                <button 
                  onClick={() => setNewTagData({ name: '', type: '%', influence: 'повысить', value: 5, comment: '' })} 
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-[13px]"
                >
                  <RotateCcw className="w-4 h-4" /> Сбросить фильтр
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Set Base Price Modal */}
      {isBasePriceModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={() => setIsBasePriceModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[440px] h-full shadow-2xl flex flex-col border-r animate-in slide-in-from-left duration-300">
             <div className="p-8 pb-4 space-y-6">
                <h2 className="text-[20px] font-black text-slate-800">Установить цену за м²</h2>
                <div className="flex gap-3">
                  <button onClick={() => setIsBasePriceModalOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-[13px] font-bold text-slate-700">Выйти без сохранения</button>
                  <button onClick={handleApplyBasePrice} className="flex-1 bg-primary text-white rounded-xl py-3 text-[13px] font-bold transition-all">Сохранить</button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-5 custom-scrollbar">
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Секция</label>
                  <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer">
                    <option>Все секции</option>
                    <option>1.1</option>
                    <option>1.2</option>
                    <option>1.3</option>
                    <option>1.4</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Тип помещения</label>
                  <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer">
                    <option>Все типы</option>
                    <option>Квартиры</option>
                    <option>Паркинг</option>
                    <option>Апартаменты</option>
                    <option>Коммерческие</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Комнатность</label>
                  <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer">
                    <option>Все</option>
                    <option>Студия</option>
                    <option>1К</option>
                    <option>2К</option>
                    <option>3К</option>
                    <option>4К+</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Установить цену за м²</label>
                  <input 
                    type="number" 
                    value={basePriceValue} 
                    onChange={e => setBasePriceValue(e.target.value)} 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                  />
                </div>

                <button 
                  onClick={() => setBasePriceValue('180000')} 
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-[13px]"
                >
                  <RotateCcw className="w-4 h-4" /> Сбросить фильтр
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Mass Change Modal */}
      {isMassChangeModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={() => setIsMassChangeModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[440px] h-full shadow-2xl flex flex-col border-r animate-in slide-in-from-left duration-300">
             <div className="p-8 pb-4 space-y-6">
                <h2 className="text-[20px] font-black text-slate-800">Массовые изменения</h2>
                <div className="flex gap-3">
                  <button onClick={() => setIsMassChangeModalOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-[13px] font-bold text-slate-700">Выйти без сохранения</button>
                  <button onClick={() => handleApplyMassChange(true)} className="flex-1 bg-primary text-white rounded-xl py-3 text-[13px] font-bold transition-all">Сохранить</button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-5 custom-scrollbar">
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApplyMassChange(false)} 
                    className="flex-1 bg-white border-2 border-danger/20 text-danger rounded-xl py-3 text-[13px] font-bold hover:bg-danger/5 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowDown className="w-4 h-4" /> Понизить
                  </button>
                  <button 
                    onClick={() => handleApplyMassChange(true)} 
                    className="flex-1 bg-white border-2 border-success/20 text-success rounded-xl py-3 text-[13px] font-bold hover:bg-success/5 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUp className="w-4 h-4" /> Повысить
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Значение</label>
                  <select 
                    value={massChangeValueTarget} 
                    onChange={e => setMassChangeValueTarget(e.target.value as '₽' | '₽/м²')} 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="₽">Стоимость (₽)</option>
                    <option value="₽/м²">Цена за м² (₽)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Величина</label>
                  <select 
                    value={massChangeValueType} 
                    onChange={e => setMassChangeValueType(e.target.value as '₽' | '%')} 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="₽">Рубли</option>
                    <option value="%">Проценты (%)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 block pl-1 uppercase">Введите сумму</label>
                  <input 
                    type="number" 
                    value={massChangeValue} 
                    onChange={e => setMassChangeValue(e.target.value)} 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none" 
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h5 className="text-sm font-bold text-slate-700 mb-3">Сумма изменений</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">В рублях:</span>
                      <span className="text-lg font-black text-primary">
                        {selectedUnits.size > 0 ? 
                          (massChangeValueType === '%' ? 
                            `${(Number(massChangeValue) * selectedUnits.size * 0.01 * 5000000).toLocaleString()} ₽` :
                            massChangeValueTarget === '₽/м²' ? 
                            `${(Number(massChangeValue) * selectedUnits.size * 50).toLocaleString()} ₽` :
                            `${(Number(massChangeValue) * selectedUnits.size).toLocaleString()} ₽`
                          ) : '0 ₽'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">В процентах:</span>
                      <span className="text-lg font-black text-success">
                        {selectedUnits.size > 0 ? 
                          (massChangeValueType === '%' ? 
                            `${massChangeValue}%` :
                            `${((Number(massChangeValue) * selectedUnits.size) / (selectedUnits.size * 5000000) * 100).toFixed(2)}%`
                          ) : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { 
                    setMassChangeValue(''); 
                    setMassChangeValueType('₽'); 
                    setMassChangeValueTarget('₽'); 
                  }} 
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-[13px]"
                >
                  <RotateCcw className="w-4 h-4" /> Сбросить фильтр
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartSalesPricing;
