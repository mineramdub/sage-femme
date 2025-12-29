import React, { useState } from 'react';
import { Appointment, AppointmentType } from '../types';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startOffset = (firstDayOfMonth(year, month) + 6) % 7; // Align to Monday

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((app) => app.date === dateStr);
  };

  const getColorClass = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.GYNECO:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case AppointmentType.OBSTETRIQUE:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case AppointmentType.ECHO:
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case AppointmentType.URGENT:
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 hover:bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b bg-slate-50/50">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {calendarDays.map((day, idx) => {
          const dayApps = day ? getAppointmentsForDay(day) : [];
          const isToday =
            day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

          return (
            <div
              key={idx}
              className={`border-r border-b p-2 overflow-y-auto ${
                day ? 'bg-white' : 'bg-slate-50/30'
              } last:border-r-0`}
            >
              {day && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-bold ${
                        isToday
                          ? 'bg-rose-600 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayApps.map((app) => (
                      <div
                        key={app.id}
                        className={`text-[10px] p-1.5 rounded-md border truncate cursor-pointer hover:shadow-sm transition-shadow ${getColorClass(
                          app.type
                        )}`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          <Clock size={10} /> {app.time}
                        </div>
                        <div className="truncate font-medium">{app.patientName}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-4 justify-center">
        {Object.values(AppointmentType).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full border ${getColorClass(type).split(' ')[0]}`}></div>
            <span className="text-xs font-semibold text-slate-600">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
