import React, { useState, useMemo } from 'react';
import { ArrowUpDown, RotateCcw, ChevronDown, Download, X, Search, Check } from 'lucide-react';

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
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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

interface HistoryRecord {
  id: string;
  date: string;
  project: string;
  section: string;
  unitType: string;
  unitCount: number;
  units: Array<{
    number: string;
    area: number;
    floor: number;
    rooms: number;
  }>;
  ruleName: string;
  originalPrice: number;
  newPrice: number;
  priceDifference: number;
  totalChange: number;
}

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

const HistoryManager: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Фильтры
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [projectFilter, setProjectFilter] = useState<string[]>([]);
  const [sectionFilter, setSectionFilter] = useState<string[]>([]);
  const [unitTypeFilter, setUnitTypeFilter] = useState<string[]>([]);
  const [ruleFilter, setRuleFilter] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState('Все');

  // Моковые данные
  const [history] = useState<HistoryRecord[]>([
    {
      id: 'h1',
      date: '2025-01-15 14:30',
      project: 'ЖК Авеню',
      section: '1',
      unitType: 'Квартиры',
      unitCount: 5,
      units: [
        { number: '101', area: 45.2, floor: 1, rooms: 1 },
        { number: '102', area: 52.8, floor: 1, rooms: 2 },
        { number: '103', area: 68.5, floor: 1, rooms: 3 },
        { number: '201', area: 42.1, floor: 2, rooms: 1 },
        { number: '202', area: 58.3, floor: 2, rooms: 2 }
      ],
      ruleName: 'Повышение цен на 10% после 5 броней',
      originalPrice: 8500000,
      newPrice: 9350000,
      priceDifference: 850000,
      totalChange: 4250000
    },
    {
      id: 'h2',
      date: '2025-01-16 11:15',
      project: 'ЖК Авеню',
      section: '2',
      unitType: 'Апартаменты',
      unitCount: 3,
      units: [
        { number: '301', area: 75.2, floor: 3, rooms: 2 },
        { number: '302', area: 88.6, floor: 3, rooms: 3 },
        { number: '303', area: 95.4, floor: 3, rooms: 4 }
      ],
      ruleName: 'Скидка за объем',
      originalPrice: 12000000,
      newPrice: 10800000,
      priceDifference: -1200000,
      totalChange: -3600000
    },
    {
      id: 'h3',
      date: '2025-01-17 16:45',
      project: 'Грин Парк',
      section: '1',
      unitType: 'Квартиры',
      unitCount: 4,
      units: [
        { number: '501', area: 38.5, floor: 5, rooms: 1 },
        { number: '502', area: 48.2, floor: 5, rooms: 2 },
        { number: '503', area: 62.8, floor: 5, rooms: 3 },
        { number: '504', area: 71.3, floor: 5, rooms: 3 }
      ],
      ruleName: 'Повышение цен на 10% после 5 броней',
      originalPrice: 7200000,
      newPrice: 7920000,
      priceDifference: 720000,
      totalChange: 2880000
    }
  ]);

  // Получаем уникальные значения для фильтров
  const projects = useMemo(() => ['Все', ...new Set(history.map(h => h.project))], [history]);
  const sections = useMemo(() => ['Все', ...new Set(history.map(h => h.section))], [history]);
  const unitTypes = useMemo(() => ['Все', ...new Set(history.map(h => h.unitType))], [history]);
  const rules = useMemo(() => ['Все', ...new Set(history.map(h => h.ruleName))], [history]);
  const groups = useMemo(() => ['Все', 'Группа 1', 'Группа 2', 'Группа 3'], []);

  // Фильтрация данных
  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      if (periodFrom && new Date(record.date) < new Date(periodFrom)) return false;
      if (periodTo && new Date(record.date) > new Date(periodTo)) return false;
      if (projectFilter.length > 0 && !projectFilter.includes(record.project)) return false;
      if (sectionFilter.length > 0 && !sectionFilter.includes(record.section)) return false;
      if (unitTypeFilter.length > 0 && !unitTypeFilter.includes(record.unitType)) return false;
      if (ruleFilter.length > 0 && !ruleFilter.includes(record.ruleName)) return false;
      if (groupFilter !== 'Все' && !record.ruleName.includes(groupFilter)) return false;
      return true;
    });
  }, [history, periodFrom, periodTo, projectFilter, sectionFilter, unitTypeFilter, ruleFilter, groupFilter]);

  // Итоги
  const totals = useMemo(() => {
    return filteredHistory.reduce((acc, record) => ({
      totalChange: acc.totalChange + record.totalChange,
      records: acc.records + 1
    }), { totalChange: 0, records: 0 });
  }, [filteredHistory]);

  // Функция отмены изменения
  const handleCancelChange = (recordId: string) => {
    // Логика отмены изменения
    console.log('Отмена изменения:', recordId);
  };

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800">История изменений цен</h2>
          <button onClick={() => {/* TODO: Add Excel download functionality */}} className="bg-success text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-success/10 hover:brightness-105 transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Скачать в Excel</button>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Период */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">Период</label>
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

            {/* Проект */}
            <MultiSelect 
              label="Проект" 
              values={projectFilter} 
              options={projects} 
              onChange={setProjectFilter} 
              placeholder="Все проекты"
            />

            {/* Секция */}
            <MultiSelect 
              label="Секция" 
              values={sectionFilter} 
              options={sections} 
              onChange={setSectionFilter} 
              placeholder="Все секции"
            />

            {/* Тип помещения */}
            <MultiSelect 
              label="Тип помещения" 
              values={unitTypeFilter} 
              options={unitTypes} 
              onChange={setUnitTypeFilter} 
              placeholder="Все типы"
            />

            {/* Правило */}
            <MultiSelect 
              label="Правило" 
              values={ruleFilter} 
              options={rules} 
              onChange={setRuleFilter} 
              placeholder="Все правила"
            />
          </div>

          <button 
            onClick={() => {
              setPeriodFrom('');
              setPeriodTo('');
              setProjectFilter([]);
              setSectionFilter([]);
              setUnitTypeFilter([]);
              setRuleFilter([]);
              setGroupFilter('Все');
            }} 
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-6 py-3 text-[14px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-h-[44px] flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Таблица истории */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[9px] tracking-widest border-b h-14">
                <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group">
                  Дата срабатывания правила <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group">
                  Проект <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group">
                  Секция <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group">
                  Тип помещения <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 text-center cursor-pointer hover:text-primary transition-all group">
                  Кол-во помещений <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-primary transition-all group">
                  Название правила <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 text-right cursor-pointer hover:text-primary transition-all group">
                  Первоначальная стоимость <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 text-right cursor-pointer hover:text-primary transition-all group">
                  Новая стоимость <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 text-right cursor-pointer hover:text-primary transition-all group">
                  Разница в стоимости <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 text-right cursor-pointer hover:text-primary transition-all group">
                  Сумма изменений <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </th>
                <th className="px-6 py-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.map(record => (
                <React.Fragment key={record.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-600">{record.date}</td>
                  <td className="px-6 py-3 font-bold text-slate-700">{record.project}</td>
                  <td className="px-6 py-3 font-bold text-slate-700">{record.section}</td>
                  <td className="px-6 py-3 text-slate-600">{record.unitType}</td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => {
                        setExpandedRows(prev => {
                          const next = new Set(prev);
                          if (next.has(record.id)) next.delete(record.id);
                          else next.add(record.id);
                          return next;
                        });
                      }}
                      className="bg-blue-50 text-primary px-3 py-1 rounded-full text-[11px] font-black hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      {record.unitCount}
                    </button>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-600">{record.ruleName}</td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    <div>
                      <div>{record.originalPrice.toLocaleString()} ₽</div>
                      <div className="text-[10px] text-slate-400 font-normal">{(record.originalPrice / 50).toLocaleString()} ₽/м²</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    <div>
                      <div>{record.newPrice.toLocaleString()} ₽</div>
                      <div className="text-[10px] text-slate-400 font-normal">{(record.newPrice / 50).toLocaleString()} ₽/м²</div>
                    </div>
                  </td>
                  <td className={`px-6 py-3 text-right font-black ${record.priceDifference > 0 ? 'text-primary' : 'text-danger'}`}>
                    <div>
                      <div>{record.priceDifference > 0 ? '+' : ''}{record.priceDifference.toLocaleString()} ₽</div>
                      <div className={`text-[10px] font-normal ${record.priceDifference > 0 ? 'text-primary' : 'text-danger'}`}>
                        {record.priceDifference > 0 ? '+' : ''}{(record.priceDifference / 50).toLocaleString()} ₽/м²
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-3 text-right font-black ${record.totalChange > 0 ? 'text-primary' : 'text-danger'}`}>
                    <div>
                      <div>{record.totalChange > 0 ? '+' : ''}{record.totalChange.toLocaleString()} ₽</div>
                      <div className={`text-[10px] font-normal ${record.totalChange > 0 ? 'text-primary' : 'text-danger'}`}>
                        {record.totalChange > 0 ? '+' : ''}{(record.totalChange / 50).toLocaleString()} ₽/м²
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => handleCancelChange(record.id)}
                      className="bg-danger text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                      title="Отменить изменение"
                    >
                      Отменить
                    </button>
                  </td>
                </tr>
                
                {/* Вложенная таблица с помещениями */}
                {expandedRows.has(record.id) && (
                  <tr>
                    <td colSpan={11} className="p-0">
                      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                          <h4 className="text-sm font-bold text-slate-700">Помещения в изменении</h4>
                        </div>
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"></th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"></th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"></th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"></th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"></th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">№ Помещения</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Этаж</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Площадь</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Комнат</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Первоначальная стоимость</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Новая стоимость</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Разница в стоимости</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {record.units.map((unit, index) => (
                              <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{record.project}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{record.section}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{record.unitType}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{record.unitCount}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{record.ruleName}</td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{unit.number}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{unit.floor}</td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{unit.area} м²</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{unit.rooms}</td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">{record.originalPrice.toLocaleString()} ₽</td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">{record.newPrice.toLocaleString()} ₽</td>
                                <td className={`px-4 py-3 text-sm text-right font-medium ${record.priceDifference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {record.priceDifference > 0 ? '+' : ''}{record.priceDifference.toLocaleString()} ₽
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-black text-[11px] text-slate-800 uppercase tracking-widest border-t-2 border-slate-200">
              <tr>
                <td colSpan={9} className="px-6 py-4 text-left">Итого</td>
                <td className={`px-6 py-4 text-right ${totals.totalChange > 0 ? 'text-primary' : 'text-danger'}`}>
                  {totals.totalChange > 0 ? '+' : ''}{totals.totalChange.toLocaleString()} ₽
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryManager;
