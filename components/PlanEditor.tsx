
import React from 'react';
import { FileSpreadsheet, Upload, Link, Info } from 'lucide-react';

const PlanEditor: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">План продаж и интеграция</h3>
      
      <div className="space-y-6">
        <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary transition group cursor-pointer text-center">
          <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary mx-auto mb-2 transition" />
          <p className="text-sm font-bold text-slate-600">Загрузить Excel шаблон</p>
          <p className="text-[10px] text-slate-400 mt-1">Перетащите файл или нажмите для выбора</p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center text-success">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-700">Google Sheets Sync</h4>
            <p className="text-[10px] text-slate-400 font-medium">sheets@stoked-folder-298514.iam...</p>
          </div>
          <button className="px-3 py-1 text-[10px] font-bold text-primary hover:bg-blue-50 rounded-lg transition border border-primary/20">
            Подключить
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Текущий прогресс по секциям</p>
          {[
            { name: 'Секция 1 (Парк)', progress: 75, status: 'On Track' },
            { name: 'Секция 2 (Вид)', progress: 42, status: 'Slow' },
            { name: 'Секция 3 (Комфорт)', progress: 91, status: 'Hot' },
          ].map((sec, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">{sec.name}</span>
                <span className={sec.status === 'Slow' ? 'text-danger' : 'text-success'}>{sec.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${sec.status === 'Slow' ? 'bg-danger' : 'bg-primary'}`} 
                  style={{ width: `${sec.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Автоматизация ДЦО опирается на данные из плана. При отклонении более 15% система автоматически предложит переоценку ассортимента.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanEditor;
