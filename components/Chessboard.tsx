
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  X,
  Check,
  CheckSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Minus,
  MousePointer2,
  Tag as TagIcon,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { Unit, UnitStatus } from '../types';

const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-notify', { detail: { message, type } }));
};

interface ChessboardProps {
  onSave?: (selectedIds: string[], groupName: string) => void;
  onCancel?: () => void;
  selectedUnits?: Set<string>;
  setSelectedUnits?: React.Dispatch<React.SetStateAction<Set<string>>>;
  localUnits?: Unit[];
  onUnitUpdate?: (unit: Unit) => void;
}

const ProjectDropdown: React.FC<{
  label: string;
  selectedValue: string;
  options: string[];
  onChange: (value: string) => void;
}> = ({ label, selectedValue, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="space-y-1 w-64 relative" ref={containerRef}>
      <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer shadow-sm hover:border-primary transition-all min-h-[44px]"
      >
        <span className="text-[14px] truncate pr-4 text-slate-700 font-bold">
          {selectedValue}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[150] animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
          <div className="p-1 space-y-0.5">
            {options.map((opt) => (
              <button 
                key={opt} 
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full px-4 py-2 text-left text-[14px] flex items-center gap-3 rounded-lg transition-all ${selectedValue === opt ? 'bg-blue-50 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex-1 truncate">{opt}</span>
                {selectedValue === opt && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MultiSelectDropdown: React.FC<{
  label: string;
  selectedValues: string[];
  options: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}> = ({ label, selectedValues, options, placeholder, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleOption = (opt: string) => {
    const next = [...selectedValues];
    const idx = next.indexOf(opt);
    if (idx > -1) next.splice(idx, 1);
    else next.push(opt);
    onChange(next);
  };

  const displayText = selectedValues.length 
    ? selectedValues.length === options.length 
      ? 'Все выбраны' 
      : `Выбрано: ${selectedValues.length}`
    : placeholder;

  return (
    <div className="space-y-1 w-52 relative" ref={containerRef}>
      <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block pl-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer shadow-sm hover:border-primary transition-all min-h-[44px]"
      >
        <span className={`text-[14px] truncate pr-4 ${selectedValues.length ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[150] max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
          <div className="p-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt);
              return (
                <button 
                  key={opt} 
                  onClick={() => toggleOption(opt)}
                  className={`w-full px-4 py-2 text-left text-[14px] flex items-center gap-3 rounded-lg transition-all ${isSelected ? 'bg-blue-50 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[4]" />}
                  </div>
                  <span className="flex-1 truncate">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Chessboard: React.FC<ChessboardProps> = ({ 
  selectedUnits: externalSelectedUnits, 
  setSelectedUnits: externalSetSelectedUnits,
  localUnits,
  onUnitUpdate
}) => {
  const [internalSelectedUnits, setInternalSelectedUnits] = useState<Set<string>>(new Set());
  const selectedUnits = externalSelectedUnits || internalSelectedUnits;
  const setSelectedUnits = externalSetSelectedUnits || setInternalSelectedUnits;

  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newLotPrice, setNewLotPrice] = useState<string>('');
  const [newPricePerMeter, setNewPricePerMeter] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);
  const [showMiniCard, setShowMiniCard] = useState<boolean>(false);
  const [showUnitDetails, setShowUnitDetails] = useState<Unit | null>(null);

  const [selectedProject, setSelectedProject] = useState<string>('ЖК "Гранд Тауэрс"');
  const [selectedSections, setSelectedSections] = useState<string[]>(['Секция 1', 'Секция 2', 'Секция 3']);
  
  // Состояния для выделения столбцов и строк
  const [selectedStacks, setSelectedStacks] = useState<Set<string>>(new Set());
  const [selectedFloors, setSelectedFloors] = useState<Set<string>>(new Set());
  
  // Состояние для выделения по статусам
  const [selectedStatuses, setSelectedStatuses] = useState<Set<UnitStatus>>(new Set());

  // Сбрасываем выделения при изменении выбранных секций
  useEffect(() => {
    setSelectedStacks(new Set());
    setSelectedFloors(new Set());
  }, [selectedSections]);

  const gridRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const STACKS_PER_SECTION = 4;
  const FLOORS_COUNT = 18;

  const [lasso, setLasso] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  const statusColors: Record<UnitStatus, string> = {
    [UnitStatus.FREE]: '#00AEEF', 
    [UnitStatus.RESERVED]: '#F3812F', 
    [UnitStatus.RESERVE]: '#76329B', 
    [UnitStatus.SOLD]: '#A4A4A4', 
    [UnitStatus.RECOMMENDED]: '#32E6D5', 
    [UnitStatus.NON_GROUP]: '#D8EB00', 
    [UnitStatus.REEVALUATION]: '#FF7BDC', 
    [UnitStatus.ASSORTMENT_SUGGESTION]: '#96D2D9', 
  };

  const gridModel = useMemo(() => {
    const sections = ['s-1', 's-2', 's-3'];
    const floors = Array.from({ length: FLOORS_COUNT }, (_, i) => FLOORS_COUNT - i);
    const data: Record<string, Record<number, Unit[]>> = {};

    sections.forEach(sId => {
      data[sId] = {};
      floors.forEach(f => {
        data[sId][f] = (localUnits || []).filter(u => u.sectionId === sId && u.floor === f).slice(0, STACKS_PER_SECTION);
      });
    });
    
    return { sections, floors, data };
  }, [localUnits]);

  const toggleSelect = (id: string) => {
    setSelectedUnits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUnitClick = (unit: Unit) => {
    if (unit.status === UnitStatus.SOLD) return;
    setEditingUnit(unit);
    setNewLotPrice(unit.currentPrice.toString());
    setNewPricePerMeter(Math.round(unit.currentPrice / unit.area).toString());
  };

  const toggleFloorInSection = (sectionId: string, floor: number) => {
    const floorUnitIds: string[] = [];
    const units = gridModel.data[sectionId][floor] || [];
    units.forEach(u => { if (u.status !== UnitStatus.SOLD) floorUnitIds.push(u.id); });

    const allSelected = floorUnitIds.length > 0 && floorUnitIds.every(id => selectedUnits.has(id));
    setSelectedUnits(prev => {
      const next = new Set(prev);
      if (allSelected) floorUnitIds.forEach(id => next.delete(id));
      else floorUnitIds.forEach(id => next.add(id));
      return next;
    });
  };

  // Функция для выделения всех стояков в секции
  const toggleSectionSelection = (sectionId: string) => {
    console.log('Section clicked', { sectionId });
    
    // Собираем все ключи стояков в секции
    const allStackKeys: string[] = [];
    Array.from({ length: STACKS_PER_SECTION }).forEach((_, i) => {
      const stackKey = `${sectionId}-${i}`;
      allStackKeys.push(stackKey);
    });
    
    // Проверяем, все ли стояки в секции уже выделены
    const allSelected = allStackKeys.every(key => selectedStacks.has(key));
    
    // Выделяем или снимаем выделение со всех стояков в секции
    setSelectedStacks(prev => {
      const next = new Set(prev);
      if (allSelected) {
        // Снимаем выделение со всех стояков в секции
        allStackKeys.forEach(key => next.delete(key));
      } else {
        // Выделяем все стояки в секции
        allStackKeys.forEach(key => next.add(key));
      }
      return next;
    });
    
    // Также выделяем все помещения в стояках секции
    const allUnitIds: string[] = [];
    Array.from({ length: STACKS_PER_SECTION }).forEach((_, i) => {
      gridModel.floors.forEach(floor => {
        const unit = gridModel.data[sectionId][floor][i];
        if (unit && unit.status !== UnitStatus.SOLD) {
          allUnitIds.push(unit.id);
        }
      });
    });
    
    const allUnitsSelected = allUnitIds.length > 0 && allUnitIds.every(id => selectedUnits.has(id));
    setSelectedUnits(prev => {
      const next = new Set(prev);
      if (allUnitsSelected) {
        // Снимаем выделение со всех помещений в секции
        allUnitIds.forEach(id => next.delete(id));
      } else {
        // Выделяем все помещения в секции
        allUnitIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const toggleStackSelection = (sectionId: string, stackIndex: number) => {
    console.log('toggleStackSelection called', { sectionId, stackIndex });
    const stackKey = `${sectionId}-${stackIndex}`;
    setSelectedStacks(prev => {
      const next = new Set(prev);
      if (next.has(stackKey)) next.delete(stackKey);
      else next.add(stackKey);
      return next;
    });
    
    // Также выделяем все помещения в этом столбце
    const stackUnitIds: string[] = [];
    gridModel.floors.forEach(floor => {
      const unit = gridModel.data[sectionId][floor][stackIndex];
      if (unit && unit.status !== UnitStatus.SOLD) stackUnitIds.push(unit.id);
    });

    const allSelected = stackUnitIds.length > 0 && stackUnitIds.every(id => selectedUnits.has(id));
    setSelectedUnits(prev => {
      const next = new Set(prev);
      if (allSelected) stackUnitIds.forEach(id => next.delete(id));
      else stackUnitIds.forEach(id => next.add(id));
      return next;
    });
  };

  // Функция для выделения по статусам
  const toggleStatusSelection = (status: UnitStatus) => {
    setSelectedStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleFloorSelection = (sectionId: string, floor: number) => {
    console.log('toggleFloorSelection called', { sectionId, floor });
    const floorKey = `${sectionId}-${floor}`;
    setSelectedFloors(prev => {
      const next = new Set(prev);
      if (next.has(floorKey)) next.delete(floorKey);
      else next.add(floorKey);
      return next;
    });
    
    // Также выделяем все помещения на этом этаже
    const floorUnitIds: string[] = [];
    const units = gridModel.data[sectionId][floor] || [];
    units.forEach(u => { if (u.status !== UnitStatus.SOLD) floorUnitIds.push(u.id); });

    const allSelected = floorUnitIds.length > 0 && floorUnitIds.every(id => selectedUnits.has(id));
    setSelectedUnits(prev => {
      const next = new Set(prev);
      if (allSelected) floorUnitIds.forEach(id => next.delete(id));
      else floorUnitIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;
    if ((e.target as HTMLElement).closest('.unit-box') || (e.target as HTMLElement).closest('.bulk-dot')) return;

    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;
    setLasso({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!lasso || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;
    setLasso({ ...lasso, currentX: x, currentY: y });
  };

  const handleMouseUp = () => {
    if (!lasso) return;
    const left = Math.min(lasso.startX, lasso.currentX);
    const top = Math.min(lasso.startY, lasso.currentY);
    const right = Math.max(lasso.startX, lasso.currentX);
    const bottom = Math.max(lasso.startY, lasso.currentY);

    const newlySelected = new Set<string>();
    const unitElements = contentRef.current?.querySelectorAll('.unit-box');
    unitElements?.forEach(el => {
      const unitId = el.getAttribute('data-unit-id');
      if (!unitId) return;
      const htmlEl = el as HTMLElement;
      const elLeft = htmlEl.offsetLeft;
      const elTop = htmlEl.offsetTop;
      const elRight = elLeft + htmlEl.offsetWidth;
      const elBottom = elTop + htmlEl.offsetHeight;
      const overlaps = !(elLeft > right || elRight < left || elTop > bottom || elBottom < top);
      if (overlaps) newlySelected.add(unitId);
    });

    if (newlySelected.size > 0) {
      setSelectedUnits(prev => {
        const next = new Set(prev);
        newlySelected.forEach(id => {
          if (next.has(id)) next.delete(id);
          else next.add(id);
        });
        return next;
      });
    }
    setLasso(null);
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans rounded-[40px] overflow-hidden select-none border">
      {/* Filters Bar Redesigned */}
      <div className="flex flex-col px-10 py-6 gap-6 bg-white border-b border-slate-50 z-30 shadow-sm">
        <div className="flex flex-wrap items-end gap-5">
          <ProjectDropdown 
            label="Выберите проект" 
            options={['ЖК "Гранд Тауэрс"', 'ЖК "Сити Парк"', 'ЖК "Зеленый квартал"']}
            selectedValue={selectedProject}
            onChange={setSelectedProject}
          />
          <MultiSelectDropdown 
            label="Секция" 
            placeholder="Все выбраны" 
            options={['Секция 1', 'Секция 2', 'Секция 3']}
            selectedValues={selectedSections}
            onChange={setSelectedSections}
          />
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block pl-1">Масштаб</label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 min-h-[44px]">
              <button 
                onClick={() => setZoomScale(Math.max(0.4, zoomScale - 0.1))} 
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[14px] font-bold text-slate-700 min-w-[44px] text-center">{Math.round(zoomScale * 100)}%</span>
              <button 
                onClick={() => setZoomScale(Math.min(1.5, zoomScale + 0.1))} 
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-[1px]">
            <button 
              onClick={() => {
                const unitsToShow = selectedStatuses.size > 0 
                  ? (localUnits || []).filter(u => selectedStatuses.has(u.status))
                  : (localUnits || []).filter(u => u.status !== UnitStatus.SOLD);
                setSelectedUnits(new Set(unitsToShow.map(u => u.id)));
              }} 
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[14px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-h-[44px]"
            >
              Выбрать все
            </button>
            <button 
              onClick={() => {
                setSelectedUnits(new Set());
                setSelectedStatuses(new Set());
              }} 
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[14px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-h-[44px]"
            >
              Сброс
            </button>
            <button 
              onClick={() => setShowMiniCard(!showMiniCard)}
              className={`px-4 py-2.5 border rounded-xl text-[14px] font-bold transition-all shadow-sm active:scale-95 min-h-[44px] flex items-center gap-2 ${
                showMiniCard 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showMiniCard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showMiniCard ? 'Скрыть' : 'Показать'} Превью помещения
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 border-t border-slate-50">
          {[
            { label: 'Свободно', color: statusColors[UnitStatus.FREE], status: UnitStatus.FREE },
            { label: 'Бронь', color: statusColors[UnitStatus.RESERVED], status: UnitStatus.RESERVED },
            { label: 'Резерв', color: statusColors[UnitStatus.RESERVE], status: UnitStatus.RESERVE },
            { label: 'Продано', color: statusColors[UnitStatus.SOLD], status: UnitStatus.SOLD },
            { label: 'Рекомендации', color: statusColors[UnitStatus.RECOMMENDED], status: UnitStatus.RECOMMENDED },
            { label: 'Не участвуют', color: statusColors[UnitStatus.NON_GROUP], status: UnitStatus.NON_GROUP },
            { label: 'Переоценка', color: statusColors[UnitStatus.REEVALUATION], status: UnitStatus.REEVALUATION },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => toggleStatusSelection(item.status)}
              className={`flex items-center gap-2.5 transition-all ${
                selectedStatuses.has(item.status) ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`w-6 h-6 rounded-md shadow-sm ${selectedStatuses.has(item.status) ? 'ring-2 ring-offset-2 ring-primary/30' : ''}`} style={{ backgroundColor: item.color }} />
              <span className={`text-sm font-medium ${
                selectedStatuses.has(item.status) ? 'text-primary font-bold' : 'text-slate-600'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={gridRef} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative flex-1 overflow-auto custom-scrollbar bg-slate-50/20 px-10 py-10"
      >
        <div 
          ref={contentRef}
          className="relative flex gap-16 min-w-max pb-10 transition-transform duration-300 origin-top-left px-4"
          style={{ transform: `scale(${zoomScale})` }}
        >
          {lasso && (
            <div 
              className="absolute bg-primary/10 border border-primary z-[200] pointer-events-none"
              style={{
                left: Math.min(lasso.startX, lasso.currentX),
                top: Math.min(lasso.startY, lasso.currentY),
                width: Math.abs(lasso.currentX - lasso.startX),
                height: Math.abs(lasso.currentY - lasso.startY)
              }}
            />
          )}

          {gridModel.sections.map(sectionId => (
            <div key={sectionId} className="flex flex-col space-y-4">
              <div className="flex flex-col items-center">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSectionSelection(sectionId);
                  }}
                  className="bg-white border border-slate-100 rounded-2xl px-6 py-2 shadow-sm inline-block mb-4 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Секция {sectionId.split('-')[1]}</span>
                </button>
                
                <div className="flex justify-start gap-2 pl-[72px]">
                  {Array.from({ length: STACKS_PER_SECTION }).map((_, i) => {
                    const stackKey = `${sectionId}-${i}`;
                    const isSelected = selectedStacks.has(stackKey);
                    return (
                      <button 
                        key={i} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Stack button clicked', { sectionId, stackIndex: i, stackKey });
                          toggleStackSelection(sectionId, i);
                        }}
                        className={`w-[148px] h-6 rounded-lg flex items-center justify-center transition-all group shrink-0 text-[10px] font-black ${
                          isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        Ст {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {gridModel.floors.map(floor => {
                  const floorUnits = gridModel.data[sectionId][floor];
                  if (!floorUnits || floorUnits.length === 0) return null;

                  return (
                    <div key={floor} className="flex items-center gap-3 group/row">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Floor button clicked', { sectionId, floor });
                          toggleFloorSelection(sectionId, floor);
                        }}
                        className={`flex items-center justify-end pr-3 w-[60px] h-[78px] transition-all group shrink-0 rounded-l-2xl ${
                          selectedFloors.has(`${sectionId}-${floor}`) ? 'bg-primary/20' : 'hover:bg-primary/5'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${
                          selectedFloors.has(`${sectionId}-${floor}`) ? 'text-primary' : 'text-slate-300 group-hover:text-primary'
                        }`}>
                          {floor} эт.
                        </span>
                      </button>

                      <div className="flex gap-2">
                        {floorUnits.map(unit => {
                          const isSelected = selectedUnits.has(unit.id);
                          const isSold = unit.status === UnitStatus.SOLD;
                          const statusSelected = selectedStatuses.has(unit.status);
                          const shouldShow = isSelected || statusSelected || selectedStatuses.size === 0;
                          const bgColor = isSelected ? '#3399FF' : (statusSelected ? statusColors[unit.status] : statusColors[unit.status]);
                          
                          return (
                            <div
                              key={unit.id}
                              data-unit-id={unit.id}
                              onClick={(e) => { e.stopPropagation(); shouldShow ? toggleSelect(unit.id) : null; }}
                              onContextMenu={(e) => { e.preventDefault(); shouldShow ? toggleSelect(unit.id) : null; }}
                              onClickCapture={(e) => { 
                                if (showMiniCard) {
                                  e.stopPropagation(); 
                                  setHoveredUnit(unit);
                                } else {
                                  shouldShow ? toggleSelect(unit.id) : null;
                                }
                              }}
                              style={{ backgroundColor: bgColor }}
                              className={`unit-box w-[148px] h-[78px] rounded-[18px] flex flex-col justify-between p-2.5 relative border-2 ${
                                isSelected 
                                ? 'shadow-2xl ring-4 ring-white/30 border-white scale-[0.97] z-10' 
                                : 'border-transparent shadow-sm hover:translate-y-[-2px] hover:shadow-md'
                              } ${isSold || !shouldShow ? 'cursor-not-allowed opacity-40 grayscale pointer-events-none' : showMiniCard ? 'cursor-pointer hover:brightness-105 active:scale-95' : 'cursor-pointer hover:brightness-105 active:scale-95'}`}
                            >
                              {/* Теги внутри ячейки */}
                              {unit.tags && unit.tags.length > 0 && (
                                <div className="absolute top-0 left-0 right-0 flex flex-wrap gap-0.5 z-10 p-0.5">
                                  {unit.tags.slice(0, 1).map((tag, index) => (
                                    <span key={index} className="text-[6px] font-black text-white bg-red-800 px-1 py-0.5 rounded leading-none shadow-2xl border-2 border-white">
                                      {tag.length > 5 ? tag.substring(0, 5) + '..' : tag}
                                    </span>
                                  ))}
                                  {unit.tags.length > 1 && (
                                    <span className="text-[6px] font-black text-white bg-blue-800 px-1 py-0.5 rounded leading-none shadow-2xl border-2 border-white">
                                      +{unit.tags.length - 1}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-start justify-between w-full">
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter leading-none">{unit.rooms}K</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-white leading-none">№{unit.number}</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-[14px] font-black text-white tracking-tight leading-none drop-shadow-sm">
                                  {Math.round(unit.currentPrice).toLocaleString()} ₽
                                </span>
                              </div>
                              <div className="flex items-end justify-between w-full">
                                <span className="text-[9px] font-black text-white/70 uppercase leading-none">{unit.area.toFixed(0)} м²</span>
                                <span className="text-[9px] font-black text-white/70 uppercase leading-none tracking-tighter">{Math.round(unit.currentPrice / unit.area).toLocaleString()} р/м²</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingUnit && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingUnit(null)} />
          <div className="relative bg-white w-full max-w-[360px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
             <div className="bg-slate-50 p-8 flex flex-col relative">
                <div className="absolute right-6 top-6 text-slate-300 text-[10px] font-black uppercase tracking-widest">ID: {editingUnit.id}</div>
                <div className="w-full aspect-square bg-white border border-slate-100 rounded-[24px] mb-6 flex items-center justify-center p-4 shadow-inner">
                  <img src={`https://api.one-app.ru/storage/plans/1/${100 + Number(editingUnit.number.slice(-2))}.png`} className="w-full h-full object-contain grayscale opacity-60 mix-blend-multiply" alt="Plan" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x300/f8fafc/64748b?text=План"; }} />
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">{editingUnit.rooms}</span>
                    <span className="text-xl font-black text-slate-400 uppercase">к</span>
                  </div>
                  <div className="flex items-baseline gap-1 text-slate-800">
                    <span className="text-lg font-black text-slate-300">№</span>
                    <span className="text-3xl font-black tracking-tighter">{editingUnit.number}</span>
                  </div>
                </div>
             </div>
             <div className="p-8 pt-6 bg-white space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="text-2xl font-black text-slate-800 tracking-tight">{editingUnit.area} м²</div>
                </div>
                
                {/* Assigned Tags Section */}
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Установленные теги</p>
                   <div className="flex flex-wrap gap-1.5">
                      {editingUnit.tags && editingUnit.tags.length > 0 ? (
                        editingUnit.tags.map(t => (
                          <span key={t} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                            <TagIcon className="w-3 h-3" /> {t}
                          </span>
                        ))
                      ) : (
                        <p className="text-[12px] text-slate-300 italic pl-1">Теги не назначены</p>
                      )}
                   </div>
                </div>

                <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Текущая стоимость</p>
                  <p className="text-2xl font-black text-slate-800 leading-none">{Math.round(editingUnit.currentPrice).toLocaleString()} ₽</p>
                  <p className="text-[13px] text-slate-400 font-bold">{(editingUnit.currentPrice / editingUnit.area).toLocaleString(undefined, {maximumFractionDigits: 0})} р/м²</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Новая стоимость</label>
                    <input 
                      type="number" 
                      placeholder="Общая стоимость" 
                      value={newLotPrice}
                      onChange={(e) => {
                        setNewLotPrice(e.target.value);
                        const price = Number(e.target.value);
                        if (!isNaN(price) && price > 0) {
                          setNewPricePerMeter(Math.round(price / editingUnit.area).toString());
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-black text-primary shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Цена за м²</label>
                    <input 
                      type="number" 
                      placeholder="Цена за квадратный метр" 
                      value={newPricePerMeter}
                      onChange={(e) => {
                        setNewPricePerMeter(e.target.value);
                        const pricePerMeter = Number(e.target.value);
                        if (!isNaN(pricePerMeter) && pricePerMeter > 0) {
                          setNewLotPrice(Math.round(pricePerMeter * editingUnit.area).toString());
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-black text-primary shadow-sm"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (onUnitUpdate) onUnitUpdate({ ...editingUnit, currentPrice: Number(newLotPrice) });
                      setEditingUnit(null);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    <CheckSquare className="w-5 h-5" /> Изменить
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Превью помещения помещения при клике */}
      {hoveredUnit && showMiniCard && (
        <div 
          className="fixed z-[500] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-[360px] animate-in fade-in zoom-in-95"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">№{hoveredUnit.number}</h3>
              <p className="text-sm text-slate-500">{hoveredUnit.rooms}к • {hoveredUnit.area.toFixed(1)} м² • {hoveredUnit.floor} этаж</p>
            </div>
            <button 
              onClick={() => setHoveredUnit(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-full h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center border border-slate-100">
            <img 
              src={`https://api.one-app.ru/storage/plans/1/${100 + Number(hoveredUnit.number.slice(-2))}.png`} 
              className="w-full h-full object-contain rounded-lg"
              alt="План помещения"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x300/f8fafc/64748b?text=План"; }}
            />
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Стоимость:</span>
              <span className="text-lg font-black text-slate-800">{Math.round(hoveredUnit.currentPrice).toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Цена за м²:</span>
              <span className="text-lg font-black text-primary">{Math.round(hoveredUnit.currentPrice / hoveredUnit.area).toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Площадь:</span>
              <span className="text-sm font-bold text-slate-700">{hoveredUnit.area.toFixed(1)} м²</span>
            </div>
          </div>
          
          {hoveredUnit.tags && hoveredUnit.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Теги</p>
              <div className="flex flex-wrap gap-1">
                {hoveredUnit.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditingUnit(hoveredUnit);
                setNewLotPrice(hoveredUnit.currentPrice.toString());
                setNewPricePerMeter(Math.round(hoveredUnit.currentPrice / hoveredUnit.area).toString());
                setHoveredUnit(null);
              }}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:brightness-105 transition-all"
            >
              Редактировать цену
            </button>
            <button 
              onClick={() => {
                setShowUnitDetails(hoveredUnit);
                setHoveredUnit(null);
              }}
              className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-900 transition-all"
            >
              Детали
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно деталей помещения */}
      {showUnitDetails && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowUnitDetails(null)} />
          <div className="relative bg-white w-full max-w-[500px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Планировка квартиры */}
            <div className="relative h-48 bg-slate-100">
              <img 
                src={`https://api.one-app.ru/storage/plans/1/${100 + Number(showUnitDetails.number.slice(-2))}.png`} 
                className="w-full h-full object-contain"
                alt="Планировка квартиры"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/500x200/f8fafc/64748b?text=Планировка+квартиры"; }}
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                <span className="text-sm font-black text-slate-800">№{showUnitDetails.number}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black mb-2">Помещение №{showUnitDetails.number}</h2>
                  <p className="text-white/80">{showUnitDetails.rooms} комнатная квартира • {showUnitDetails.area.toFixed(1)} м²</p>
                </div>
                <button 
                  onClick={() => setShowUnitDetails(null)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Проект</p>
                    <p className="text-lg font-bold text-slate-800">{showUnitDetails.project || 'ЖК "Гранд Тауэрс"'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Секция</p>
                    <p className="text-lg font-bold text-slate-800">{showUnitDetails.section || 'Секция 1'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Этаж</p>
                    <p className="text-lg font-bold text-slate-800">{showUnitDetails.floor}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Комнатность</p>
                    <p className="text-lg font-bold text-slate-800">{showUnitDetails.rooms} комнаты</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Площадь</p>
                    <p className="text-lg font-bold text-slate-800">{showUnitDetails.area.toFixed(1)} м²</p>
                  </div>
                  {showUnitDetails.livingArea && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Жилая площадь</p>
                      <p className="text-lg font-bold text-slate-800">{showUnitDetails.livingArea.toFixed(1)} м²</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Дополнительные характеристики */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-black text-slate-800 mb-4">Характеристики</h3>
                <div className="grid grid-cols-2 gap-4">
                  {showUnitDetails.ceilingHeight && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Высота потолков</p>
                      <p className="text-base font-bold text-slate-800">{showUnitDetails.ceilingHeight} м</p>
                    </div>
                  )}
                  {showUnitDetails.kitchenArea && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Площадь кухни</p>
                      <p className="text-base font-bold text-slate-800">{showUnitDetails.kitchenArea.toFixed(1)} м²</p>
                    </div>
                  )}
                  {showUnitDetails.euroType && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Тип планировки</p>
                      <p className="text-base font-bold text-slate-800">Европланировка</p>
                    </div>
                  )}
                  {showUnitDetails.type && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Тип помещения</p>
                      <p className="text-base font-bold text-slate-800">{showUnitDetails.type}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Финансовая информация */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-black text-slate-800 mb-4">Финансовые показатели</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Стоимость</p>
                    <p className="text-xl font-black text-primary">{Math.round(showUnitDetails.currentPrice).toLocaleString()} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Цена за м²</p>
                    <p className="text-xl font-black text-primary">{Math.round(showUnitDetails.currentPrice / showUnitDetails.area).toLocaleString()} ₽/м²</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Базовая цена за м²</p>
                    <p className="text-xl font-black text-slate-800">{Math.round(showUnitDetails.basePricePerMeter).toLocaleString()} ₽/м²</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Статус</p>
                    <p className="text-xl font-black text-slate-800">{showUnitDetails.status}</p>
                  </div>
                </div>
              </div>

              {/* Теги */}
              {showUnitDetails.tags && showUnitDetails.tags.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">Установленные теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {showUnitDetails.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setEditingUnit(showUnitDetails);
                    setNewLotPrice(showUnitDetails.currentPrice.toString());
                    setNewPricePerMeter(Math.round(showUnitDetails.currentPrice / showUnitDetails.area).toString());
                    setShowUnitDetails(null);
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Редактировать цену
                </button>
                <button 
                  onClick={() => setShowUnitDetails(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chessboard;
