import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const presets = [
    { label: 'Hoje', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Ontem', getValue: () => ({ from: startOfYesterday(), to: startOfYesterday() }) },
    { label: 'Últimos 7 dias', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Este Mês', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: 'Tudo', getValue: () => ({ from: new Date(2020, 0, 1), to: new Date(2030, 0, 1) }) },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl hover:bg-white/80 transition-all shadow-glass-sm"
      >
        <Calendar className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-bold text-slate-700">
          {range.label === 'Tudo' 
            ? 'Todo o Período' 
            : `${format(range.from, 'dd/MM', { locale: ptBR })} - ${format(range.to, 'dd/MM', { locale: ptBR })}`}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-black/5 rounded-2xl shadow-glass-lg z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const values = preset.getValue();
                  onChange({ ...values, label: preset.label });
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                  range.label === preset.label
                    ? "bg-violet-50 text-violet-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
