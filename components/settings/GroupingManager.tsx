
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronDown, Trash2, Plus, Save, X, RotateCcw, Check, Search, Layers, 
  Edit2, LayoutGrid, Calendar, ChevronRight, Download, Info, Filter, ArrowUpDown, MousePointer2
} from 'lucide-react';
import Chessboard from '../Chessboard';
import { UnitGroup, Unit, UnitStatus } from '../../types';
import { MOCK_UNITS } from '../../constants.tsx';

// Создаем локальную копию MOCK_UNITS для надежности
const LOCAL_MOCK_UNITS: Unit[] = Array.from({ length: 320 }).map((_, i) => {
  const sectionId = `s-${Math.floor(i / 80) + 1}`;
  const localIndex = i % 80;
  const sectionNumber = Math.floor(i / 80) + 1;
  const statuses = [
    UnitStatus.FREE,
    UnitStatus.RESERVED,
    UnitStatus.RESERVE,
    UnitStatus.SOLD,
    UnitStatus.RECOMMENDED,
    UnitStatus.NON_GROUP,
    UnitStatus.REEVALUATION
  ];
  return {
    id: `u${i}`,
    number: `${sectionNumber * 1000 + localIndex}`,
    floor: Math.floor(localIndex / 10) + 1,
    rooms: (localIndex % 3) + 1,
    area: 35 + (localIndex % 5) * 10,
    basePricePerMeter: 160000,
    currentPrice: 5600000 + (i * 10000),
    status: statuses[i % statuses.length],
    tags: i % 5 === 0 ? ['t1'] : i % 8 === 0 ? ['t2', 't3'] : [],
    projectId: 'p-green-park',
    sectionId,
    project: sectionNumber === 1 ? 'ЖК Авеню' : 'Грин Парк',
    section: String(sectionNumber),
    type: (localIndex % 2 === 0) ? 'Квартира' : 'Апартаменты'
  };
});

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('ru-RU');
};

const GroupingManager: React.FC = () => {
  console.log('LOCAL_MOCK_UNITS loaded:', LOCAL_MOCK_UNITS.length, 'first unit:', LOCAL_MOCK_UNITS[0]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisualPickerOpen, setIsVisualPickerOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<UnitGroup | null>(null);
  const [modalGroupName, setModalGroupName] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  
  // Состояния для открытых выпадающих списков
  const [openSelects, setOpenSelects] = useState<Record<string, boolean>>({});
  
  // Состояния для визуального подбора
  const [currentProject, setCurrentProject] = useState('ЖК Авеню');
  const [selectedSections, setSelectedSections] = useState<Record<string, Set<string>>>({});
  
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof UnitGroup, direction: 'asc' | 'desc'} | null>(null);

  const [formData, setFormData] = useState({
    project: [], section: [], unitType: [], rooms: [], 
    areaMin: '', areaMax: '', priceMin: '', priceMax: '', status: [],
    floor: [], layout: [], kitchenAreaMin: '', kitchenAreaMax: '', 
    roomNumber: [], tags: [], pricePerM2Min: '', pricePerM2Max: '',
    roomId: [], ceilingHeight: [], euroType: [], livingAreaMin: '', livingAreaMax: ''
  });

  const [groups, setGroups] = useState<UnitGroup[]>([
    { id: 'g1', name: 'Видовые 1-к квартиры', createdAt: '2023-10-10', unitIds: ['u0', 'u7', 'u14', 'u21'], activeRulesCount: 2, ruleNames: ['Повышение спрос', 'Акция "Вид"'] },
    { id: 'g2', name: 'Студии эконом', createdAt: '2023-11-15', unitIds: ['u1', 'u8', 'u15'], activeRulesCount: 1, ruleNames: ['Скидка за объем'] }
  ]);

  const sortedGroups = useMemo(() => {
    let items = [...groups];
    if (groupFilter.length > 0) items = items.filter(g => groupFilter.includes(g.name));
    if (dateFrom) items = items.filter(g => new Date(g.createdAt) >= new Date(dateFrom));
    if (dateTo) items = items.filter(g => new Date(g.createdAt) <= new Date(dateTo));
    
    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [groups, sortConfig, groupFilter, dateFrom, dateTo]);

  const requestSort = (key: keyof UnitGroup) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleSave = () => {
    if (!modalGroupName.trim()) return notify('Название группы обязательно', 'error');
    const newGroup: UnitGroup = {
      id: editingGroup?.id || `g${Date.now()}`,
      name: modalGroupName,
      createdAt: editingGroup?.createdAt || new Date().toISOString().split('T')[0],
      unitIds: Array.from(selectedUnits),
      activeRulesCount: editingGroup?.activeRulesCount || 0,
      ruleNames: editingGroup?.ruleNames || []
    };
    if (editingGroup) setGroups(prev => prev.map(g => g.id === editingGroup.id ? newGroup : g));
    else setGroups(prev => [newGroup, ...prev]);
    setIsModalOpen(false);
    setIsVisualPickerOpen(false);
    notify('Группа сохранена');
  };

  const removeUnitFromGroup = (groupId: string, unitId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, unitIds: g.unitIds.filter(id => id !== unitId) }
        : g
    ));
    notify('Помещение удалено из группы');
  };

  // Helper to get unit details by ID
  const getUnitById = (id: string) => {
    const unit = LOCAL_MOCK_UNITS.find(u => u.id === id);
    console.log(`Looking for unit ${id}:`, unit);
    return unit;
  };

  // Функция для управления выпадающими списками
  const toggleSelect = (name: string) => {
    setOpenSelects(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Функция для обработки выбора опции
  const handleOptionToggle = (fieldName: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[fieldName as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [fieldName]: newValues };
    });
  };

  // Функции для визуального подбора
  const toggleStand = (standIndex: number) => {
    const newSelected = new Set(selectedUnits);
    const standUnits = Array.from({length: 10}, (_, floorIndex) => 
      `u${floorIndex * 4 + standIndex}`
    );
    
    // Проверяем, все ли помещения в стояке уже выбраны
    const allSelected = standUnits.every(unitId => newSelected.has(unitId));
    
    if (allSelected) {
      // Снимаем выделение со всего стояка
      standUnits.forEach(unitId => newSelected.delete(unitId));
    } else {
      // Выделяем весь стояк
      standUnits.forEach(unitId => newSelected.add(unitId));
    }
    
    setSelectedUnits(newSelected);
  };

  const toggleFloor = (floorIndex: number) => {
    const newSelected = new Set(selectedUnits);
    const floorUnits = Array.from({length: 4}, (_, standIndex) => 
      `u${floorIndex * 4 + standIndex}`
    );
    
    // Проверяем, все ли помещения на этаже уже выбраны
    const allSelected = floorUnits.every(unitId => newSelected.has(unitId));
    
    if (allSelected) {
      // Снимаем выделение со всего этажа
      floorUnits.forEach(unitId => newSelected.delete(unitId));
    } else {
      // Выделяем весь этаж
      floorUnits.forEach(unitId => newSelected.add(unitId));
    }
    
    setSelectedUnits(newSelected);
  };

  // Функции для массового выделения
  const selectAllUnits = () => {
    const allUnits = Array.from({length: 40}, (_, i) => `u${i}`);
    setSelectedUnits(new Set(allUnits));
  };

  const clearAllUnits = () => {
    setSelectedUnits(new Set());
  };

  // Компонент кастомного множественного селекта
  const CustomMultiSelect = ({ 
    label, 
    fieldName, 
    options, 
    value, 
    placeholder 
  }: {
    label: string;
    fieldName: string;
    options: string[];
    value: string[];
    placeholder: string;
  }) => {
    const isOpen = openSelects[fieldName] || false;
    const [search, setSearch] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);
    
    // Закрываем селект при клике вне его
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setOpenSelects(prev => ({ ...prev, [fieldName]: false }));
          setSearch(''); // Очищаем поиск при закрытии
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, fieldName]);

    const filteredOptions = options.filter(option => 
      option.toLowerCase().includes(search.toLowerCase())
    );
    
    return (
      <div className="space-y-1.5" ref={selectRef}>
        <label className="text-[11px] font-bold text-slate-500 uppercase">{label}</label>
        <div className="relative">
          {/* Основное поле селекта */}
          <div 
            onClick={() => toggleSelect(fieldName)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer hover:border-primary transition-all flex items-center justify-between"
          >
            <span className={value.length === 0 ? 'text-slate-400' : 'text-slate-700'}>
              {value.length === 0 ? placeholder : `Выбрано: ${value.length}`}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Выпадающий список */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-slate-100">
                <input 
                  type="text"
                  placeholder="Поиск..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  autoFocus
                />
              </div>
              <div className="p-2">
                {filteredOptions.map(option => (
                  <div 
                    key={option}
                    onClick={() => handleOptionToggle(fieldName, option)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      value.includes(option) 
                        ? 'bg-primary border-primary' 
                        : 'border-slate-300'
                    }`}>
                      {value.includes(option) && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Теги выбранных значений */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {value.map(item => (
              <span 
                key={item} 
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-primary/20"
              >
                {item}
                <button 
                  onClick={() => handleOptionToggle(fieldName, item)}
                  className="text-primary hover:text-danger transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
           <CustomMultiSelect
                      label="Группа"
                      fieldName="groupFilter"
                      options={groups.map(g => g.name)}
                      value={groupFilter}
                      placeholder="Выберите группы..."
                    />
           <div className="space-y-1.5">
             <label className="text-[11px] text-slate-400 font-black uppercase block pl-1">Дата создания</label>
             <div className="flex gap-2">
               <input 
                 type="date" 
                 value={dateFrom} 
                 onChange={e => setDateFrom(e.target.value)} 
                 className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none" 
               />
               <input 
                 type="date" 
                 value={dateTo} 
                 onChange={e => setDateTo(e.target.value)} 
                 className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none" 
               />
             </div>
           </div>
           <button onClick={() => { setGroupFilter([]); setDateFrom(''); setDateTo(''); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-danger mt-5 shadow-sm transition-all">
             <RotateCcw className="w-4 h-4" />
           </button>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="bg-success text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-success/10 flex items-center gap-2 hover:brightness-105 transition-all">
            <Download className="w-4 h-4" /> Скачать в Excel
          </button>
          <button onClick={() => { setEditingGroup(null); setModalGroupName(''); setSelectedUnits(new Set()); setIsVisualPickerOpen(true); }} className="bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
            <MousePointer2 className="w-4 h-4" /> Визуальный подбор
          </button>
          <button onClick={() => { setEditingGroup(null); setModalGroupName(''); setSelectedUnits(new Set()); setIsModalOpen(true); }} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:brightness-105 shadow-lg shadow-primary/20 transition-all">
            <Plus className="w-5 h-5" /> Создать группу
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-widest border-b h-14">
              <th className="w-10 px-6 py-5"></th>
              <th className="px-6 py-5 cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('name')}>
                Группа <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" />
              </th>
              <th className="px-6 py-5 cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('createdAt')}>
                Дата создания <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-100" />
              </th>
              <th className="px-6 py-5 text-center">
                Количество помещений
              </th>
              <th className="px-6 py-5 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedGroups.map(group => (
              <React.Fragment key={group.id}>
                <tr 
                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                  className="hover:bg-slate-50 h-16 transition-colors font-medium cursor-pointer group"
                >
                  <td className="px-6 py-5">
                    <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-primary transition-all ${expandedGroup === group.id ? 'rotate-90' : ''}`} />
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700">{group.name}</td>
                  <td className="px-6 py-5 text-slate-400 font-medium">{formatDate(group.createdAt)}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[11px] font-black">
                      {group.unitIds.length}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => { setEditingGroup(group); setModalGroupName(group.name); setSelectedUnits(new Set(group.unitIds)); setIsModalOpen(true); }} 
                        className="p-2 text-slate-300 hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Удалить группу?')) setGroups(prev => prev.filter(g => g.id !== group.id)); }} 
                        className="p-2 text-slate-300 hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Подтаблица с помещениями */}
                {expandedGroup === group.id && (
                  <tr>
                    <td colSpan={5} className="p-0 bg-slate-50/50">
                      <div className="p-6">
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b">
                                <th className="px-4 py-3 text-left">Проект</th>
                                <th className="px-4 py-3 text-left">Секция</th>
                                <th className="px-4 py-3 text-left">Тип помещения</th>
                                <th className="px-4 py-3 text-left">Этаж</th>
                                <th className="px-4 py-3 text-left">Комнатность</th>
                                <th className="px-4 py-3 text-left">Площадь</th>
                                <th className="px-4 py-3 text-left">Номер помещения</th>
                                <th className="px-4 py-3 text-center">Кол-во правил</th>
                                <th className="px-4 py-3 text-center">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {console.log('Rendering units for group:', group.name, group.unitIds)}
                              {group.unitIds.map(unitId => {
                                const unit = getUnitById(unitId);
                                console.log(`Unit ${unitId}:`, unit);
                                if (!unit) {
                                  console.log(`Unit ${unitId} not found!`);
                                  return null;
                                }
                                return (
                                  <tr key={unitId} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{unit.project}</td>
                                    <td className="px-4 py-3 text-slate-600">{unit.section}</td>
                                    <td className="px-4 py-3 text-slate-600">{unit.type}</td>
                                    <td className="px-4 py-3 text-slate-600">{unit.floor}</td>
                                    <td className="px-4 py-3 text-slate-600">{unit.rooms}-комн.</td>
                                    <td className="px-4 py-3 text-slate-600">{unit.area} м²</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{unit.id}</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="bg-blue-50 text-primary px-2 py-1 rounded-full text-[10px] font-black">
                                        {Math.floor(Math.random() * 3) + 1}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <button 
                                        onClick={() => removeUnitFromGroup(group.id, unitId)}
                                        className="p-1.5 text-slate-300 hover:text-danger transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex justify-start">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[520px] h-full shadow-2xl flex flex-col border-r animate-in slide-in-from-left duration-300">
            <div className="px-10 pt-10 pb-4">
              <h2 className="text-[22px] font-black text-slate-800 mb-6">{editingGroup ? 'Редактирование' : 'Создание'} группы</h2>
              <div className="flex gap-4 mb-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Выйти</button>
                <button onClick={handleSave} className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-105 transition-all">Сохранить</button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-black uppercase block pl-1">Название группы</label>
                  <input 
                    type="text" 
                    value={modalGroupName} 
                    onChange={e => setModalGroupName(e.target.value)} 
                    placeholder="Напр: Видовые 1-к квартиры"
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:border-primary transition-all" 
                  />
                </div>
                
                <div className="text-sm text-slate-400 font-medium px-1 flex items-center justify-between border-b pb-4 border-slate-50">
                  <span className="uppercase text-[10px] font-black tracking-widest">Выбрано помещений:</span>
                  <span className="text-primary font-black text-lg">{selectedUnits.size || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-10 pb-10 pt-2 custom-scrollbar space-y-6">
               <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <CustomMultiSelect
                      label="Проект"
                      fieldName="project"
                      options={['ЖК Авеню', 'Грин Парк']}
                      value={formData.project}
                      placeholder="Выберите проекты..."
                    />
                    
                    <CustomMultiSelect
                      label="Секция"
                      fieldName="section"
                      options={['1', '2', '3']}
                      value={formData.section}
                      placeholder="Выберите секции..."
                    />
                    
                    <CustomMultiSelect
                      label="Тип помещения"
                      fieldName="unitType"
                      options={['Квартиры', 'Апартаменты']}
                      value={formData.unitType}
                      placeholder="Выберите тип..."
                    />
                    
                    <CustomMultiSelect
                      label="Комнатность"
                      fieldName="rooms"
                      options={['Студия', '1К', '2К', '3К']}
                      value={formData.rooms}
                      placeholder="Выберите комнатность..."
                    />
                    
                    <CustomMultiSelect
                      label="Этаж"
                      fieldName="floor"
                      options={Array.from({length: 25}, (_, i) => `${i + 1} этаж`)}
                      value={formData.floor}
                      placeholder="Выберите этажи..."
                    />
                    
                    <CustomMultiSelect
                      label="Планировка"
                      fieldName="layout"
                      options={['E2', '2a_55a', '3b_78b']}
                      value={formData.layout}
                      placeholder="Выберите планировки..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Площадь от (м²)</label>
                      <input 
                        type="number" 
                        value={formData.areaMin}
                        onChange={e => setFormData({...formData, areaMin: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Площадь до (м²)</label>
                      <input 
                        type="number" 
                        value={formData.areaMax}
                        onChange={e => setFormData({...formData, areaMax: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Жилая площадь от (м²)</label>
                      <input 
                        type="number" 
                        value={formData.livingAreaMin}
                        onChange={e => setFormData({...formData, livingAreaMin: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Жилая площадь до (м²)</label>
                      <input 
                        type="number" 
                        value={formData.livingAreaMax}
                        onChange={e => setFormData({...formData, livingAreaMax: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="150"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Площадь кухни от (м²)</label>
                      <input 
                        type="number" 
                        value={formData.kitchenAreaMin}
                        onChange={e => setFormData({...formData, kitchenAreaMin: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Площадь кухни до (м²)</label>
                      <input 
                        type="number" 
                        value={formData.kitchenAreaMax}
                        onChange={e => setFormData({...formData, kitchenAreaMax: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Стоимость от (₽)</label>
                      <input 
                        type="number" 
                        value={formData.priceMin}
                        onChange={e => setFormData({...formData, priceMin: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Стоимость до (₽)</label>
                      <input 
                        type="number" 
                        value={formData.priceMax}
                        onChange={e => setFormData({...formData, priceMax: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="50000000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Цена за м² от (₽)</label>
                      <input 
                        type="number" 
                        value={formData.pricePerM2Min}
                        onChange={e => setFormData({...formData, pricePerM2Min: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Цена за м² до (₽)</label>
                      <input 
                        type="number" 
                        value={formData.pricePerM2Max}
                        onChange={e => setFormData({...formData, pricePerM2Max: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:border-primary transition-all"
                        placeholder="300000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <CustomMultiSelect
                      label="Номер помещения"
                      fieldName="roomNumber"
                      options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']}
                      value={formData.roomNumber}
                      placeholder="Выберите номера..."
                    />
                    
                    <CustomMultiSelect
                      label="Теги"
                      fieldName="tags"
                      options={['Вид на парк', 'Первый этаж', 'Лоджия', 'Балкон', 'Панорамные окна', 'Высокий этаж', 'Угловая', 'С мебелью']}
                      value={formData.tags}
                      placeholder="Выберите теги..."
                    />
                    
                    <CustomMultiSelect
                      label="ID помещения"
                      fieldName="roomId"
                      options={['u0', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13', 'u14', 'u15']}
                      value={formData.roomId}
                      placeholder="Выберите ID..."
                    />
                    
                    <CustomMultiSelect
                      label="Высота потолков"
                      fieldName="ceilingHeight"
                      options={['2.5 м', '2.7 м', '3.0 м', '3.2 м', '3.5 м', '4.0 м']}
                      value={formData.ceilingHeight}
                      placeholder="Выберите высоту потолков..."
                    />
                  </div>

                  <CustomMultiSelect
                      label="Тип евро"
                      fieldName="euroType"
                      options={['Да', 'Нет']}
                      value={formData.euroType}
                      placeholder="Выберите тип евро..."
                    />

                  <div className="space-y-1.5">
                    <CustomMultiSelect
                      label="Статус"
                      fieldName="status"
                      options={['Свободна', 'Бронь', 'Продана']}
                      value={formData.status}
                      placeholder="Выберите статусы..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setFormData({
                        project: [], section: [], unitType: [], rooms: [], 
                        areaMin: '', areaMax: '', priceMin: '', priceMax: '', status: [],
                        floor: [], layout: [], kitchenAreaMin: '', kitchenAreaMax: '', 
                        roomNumber: [], tags: [], pricePerM2Min: '', pricePerM2Max: '',
                        roomId: [], ceilingHeight: [], euroType: [], livingAreaMin: '', livingAreaMax: ''
                      })}
                      className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Сбросить фильтры
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Визуальный подбор помещений */}
      {isVisualPickerOpen && (
        <div className="fixed inset-0 z-[120] bg-white animate-in fade-in-up duration-300">
          {/* Боковая панель проектов */}
          <div className="fixed left-0 top-0 w-72 h-full bg-slate-50 border-r border-slate-200 overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Проекты</h3>
              
              {/* Поиск проектов */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Поиск проекта..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm font-medium outline-none focus:border-primary transition-all"
                />
              </div>
              
              {/* Список проектов */}
              <div className="space-y-3">
                {['ЖК Авеню', 'Грин Парк', 'ЖК Олимп', 'ЖК Парк'].map(project => (
                  <div key={project} className="bg-white rounded-lg border border-slate-200 p-4 cursor-pointer hover:border-primary transition-all">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
                        defaultChecked={project === 'ЖК Авеню'}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm">{project}</h4>
                        <p className="text-xs text-slate-500 mt-1">Выбрано: 12 лотов</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Основная рабочая область */}
          <div className="ml-72 h-full flex flex-col">
            {/* Верхний тулбар */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <h2 className="text-xl font-black text-slate-800">ЖК Авеню</h2>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={selectAllUnits}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      Выбрать все
                    </button>
                    <button 
                      onClick={clearAllUnits}
                      className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                    >
                      Снять все
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Масштабирование */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">Масштаб:</span>
                    <input 
                      type="range" 
                      min="30" 
                      max="150" 
                      defaultValue="100"
                      className="w-32"
                    />
                    <span className="text-sm font-bold text-primary">100%</span>
                  </div>
                  
                  {/* Кнопка закрытия */}
                  <button 
                    onClick={() => setIsVisualPickerOpen(false)}
                    className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
              
              {/* Поле для названия группы */}
              <div className="mt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest block pl-1">Название группы</label>
                  <input 
                    type="text" 
                    value={modalGroupName} 
                    onChange={e => setModalGroupName(e.target.value)} 
                    placeholder="Напр: Видовые 1-к квартиры"
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:border-primary transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Шахматка здания */}
            <div className="flex-1 overflow-auto bg-slate-50 p-6 origin-top">
              {/* Легенда */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Легенда статусов</h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#10B981] rounded"></div>
                    <span className="text-slate-600">Свободна</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#F59E0B] rounded"></div>
                    <span className="text-slate-600">Бронь</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#EF4444] rounded"></div>
                    <span className="text-slate-600">Продана</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#3B82F6] rounded"></div>
                    <span className="text-slate-600">Рекомендации по изменению цены</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#6B7280] rounded"></div>
                    <span className="text-slate-600">Не участвуют в группах</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#8B5CF6] rounded"></div>
                    <span className="text-slate-600">Переоценка</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Секция 1</h3>
                
                {/* Шахматка */}
                <div className="space-y-4">
                  {/* Заголовки этажей и стояков */}
                  <div className="flex gap-2 ml-12">
                    {['СТ.1', 'СТ.2', 'СТ.3', 'СТ.4'].map((stand, standIndex) => {
                      const standUnits = Array.from({length: 10}, (_, floorIndex) => 
                        `u${floorIndex * 4 + standIndex}`
                      );
                      const allSelected = standUnits.every(unitId => selectedUnits.has(unitId));
                      const someSelected = standUnits.some(unitId => selectedUnits.has(unitId));
                      
                      return (
                        <div key={stand} className="w-20 text-center">
                          <button 
                            onClick={() => toggleStand(standIndex)}
                            className={`w-full px-2 py-1 rounded text-xs font-bold transition-all ${
                              allSelected 
                                ? 'bg-primary text-white' 
                                : someSelected 
                                  ? 'bg-primary/20 text-primary border border-primary'
                                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                          >
                            {stand}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Этажи с лотами */}
                  {Array.from({length: 10}, (_, floorIndex) => {
                    const floorUnits = Array.from({length: 4}, (_, standIndex) => 
                      `u${floorIndex * 4 + standIndex}`
                    );
                    const allSelected = floorUnits.every(unitId => selectedUnits.has(unitId));
                    const someSelected = floorUnits.some(unitId => selectedUnits.has(unitId));
                    
                    return (
                      <div key={floorIndex} className="flex gap-2 items-center">
                        {/* Кнопка этажа */}
                        <button 
                          onClick={() => toggleFloor(floorIndex)}
                          className={`w-12 px-2 py-2 rounded text-xs font-bold transition-all ${
                            allSelected 
                              ? 'bg-primary text-white' 
                              : someSelected 
                                ? 'bg-primary/20 text-primary border border-primary'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {10 - floorIndex}
                        </button>
                        
                        {/* Помещения на этаже */}
                        {Array.from({length: 4}, (_, lotIndex) => {
                          const unitId = `u${floorIndex * 4 + lotIndex}`;
                          const unit = LOCAL_MOCK_UNITS.find(u => u.id === unitId);
                          const isSelected = selectedUnits.has(unitId);
                          
                          // Определяем цвет в зависимости от статуса
                          const getStatusColor = (status: string) => {
                            switch(status) {
                              case 'Свободно': return 'bg-[#10B981]';
                              case 'Бронь': return 'bg-[#F59E0B]';
                              case 'Резерв': return 'bg-[#F59E0B]';
                              case 'Продано': return 'bg-[#EF4444]';
                              case 'Рекомендации по изменению цены': return 'bg-[#3B82F6]';
                              case 'Не участвуют в группах': return 'bg-[#6B7280]';
                              case 'Переоценка': return 'bg-[#8B5CF6]';
                              case 'Пополнение ассортимента': return 'bg-[#EC4899]';
                              default: return 'bg-[#E5E7EB]';
                            }
                          };
                          
                          const statusColor = unit ? getStatusColor(unit.status) : 'bg-[#E5E7EB]';
                          
                          return (
                            <div 
                              key={unitId}
                              onClick={() => {
                                const newSelected = new Set(selectedUnits);
                                if (isSelected) {
                                  newSelected.delete(unitId);
                                } else {
                                  newSelected.add(unitId);
                                }
                                setSelectedUnits(newSelected);
                              }}
                              className={`w-20 h-18 border rounded-lg p-2 cursor-pointer transition-all relative ${
                                isSelected 
                                  ? 'ring-2 ring-primary ring-offset-2' 
                                  : 'hover:ring-1 hover:ring-primary/50'
                              }`}
                            >
                              {/* Фон с цветом статуса */}
                              <div className={`absolute inset-0 ${statusColor} opacity-20 rounded-lg`}></div>
                              
                              {/* Контент лота */}
                              <div className="relative text-center">
                                <div className="font-bold text-sm text-slate-800">{unit?.number || `${100 + floorIndex * 4 + lotIndex}`}</div>
                                <div className="text-xs mt-1 text-slate-600">{unit?.rooms || (floorIndex % 3) + 1}к • {unit?.area || (35 + lotIndex * 10)}м²</div>
                                
                                {/* Индикатор выделения */}
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Футер с действиями */}
            <div className="bg-white border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Выбрано помещений: <span className="font-bold text-primary">{selectedUnits.size}</span>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsVisualPickerOpen(false)}
                    className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-all"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:brightness-105 shadow-lg transition-all"
                  >
                    Подтвердить выбор
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupingManager;
