
import React from 'react';
import { Play, Pause, Edit2, Trash2, Plus } from 'lucide-react';

const RulesManager: React.FC = () => {
  const rules = [
    { name: 'Повышение после 5 броней', trigger: '5 броней', change: '+10%', target: 'Все 1-к', status: 'active' },
    { name: 'Контроль плана (70%)', trigger: '70% плана', change: '+2%', target: 'Корпус А', status: 'paused' },
    { name: 'Риск вымывания (High)', trigger: 'T < 3 мес', change: '+15,000 ₽', target: '2-к квартиры', status: 'active' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Правила ценообразования</h3>
        <button className="text-primary hover:bg-blue-50 p-2 rounded-full transition">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule, i) => (
          <div key={i} className={`p-4 rounded-xl border ${rule.status === 'active' ? 'border-blue-100 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-700">{rule.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Цель: {rule.target}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-primary transition"><Edit2 className="w-3.5 h-3.5" /></button>
                <button className="text-slate-400 hover:text-danger transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-4">
              <div className="flex gap-4">
                <div className="text-[10px]">
                  <p className="text-slate-400 uppercase font-bold">Триггер</p>
                  <p className="font-semibold text-slate-600">{rule.trigger}</p>
                </div>
                <div className="text-[10px]">
                  <p className="text-slate-400 uppercase font-bold">Изменение</p>
                  <p className="font-semibold text-primary">{rule.change}</p>
                </div>
              </div>
              <button className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                rule.status === 'active' 
                ? 'bg-success/10 text-success hover:bg-success/20' 
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }`}>
                {rule.status === 'active' ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                {rule.status === 'active' ? 'Работает' : 'Пауза'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RulesManager;
