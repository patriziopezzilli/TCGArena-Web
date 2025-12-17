import React from 'react';
import { Clock } from 'lucide-react';

export interface DaySchedule {
  open?: string;
  close?: string;
  closed: boolean;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface OpeningHoursFormProps {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
}

const DAYS = [
  { key: 'monday', label: 'Lunedì' },
  { key: 'tuesday', label: 'Martedì' },
  { key: 'wednesday', label: 'Mercoledì' },
  { key: 'thursday', label: 'Giovedì' },
  { key: 'friday', label: 'Venerdì' },
  { key: 'saturday', label: 'Sabato' },
  { key: 'sunday', label: 'Domenica' },
] as const;

const DEFAULT_SCHEDULE: DaySchedule = { open: '09:00', close: '18:00', closed: false };
const CLOSED_SCHEDULE: DaySchedule = { closed: true };

export const OpeningHoursForm: React.FC<OpeningHoursFormProps> = ({ value, onChange }) => {
  const updateDay = (dayKey: keyof OpeningHours, schedule: DaySchedule) => {
    onChange({
      ...value,
      [dayKey]: schedule,
    });
  };

  const copyToAll = (schedule: DaySchedule) => {
    const newHours: OpeningHours = { ...value };
    DAYS.forEach(day => {
      newHours[day.key as keyof OpeningHours] = { ...schedule };
    });
    onChange(newHours);
  };

  const applyWeekdayTemplate = () => {
    onChange({
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { closed: true },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Orari di Apertura</h3>
        </div>
        <button
          type="button"
          onClick={applyWeekdayTemplate}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Applica Template Settimanale
        </button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const schedule = value[day.key as keyof OpeningHours];

          return (
            <div key={day.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-24">
                <label className="text-sm font-medium text-gray-700">{day.label}</label>
              </div>

              <div className="flex items-center gap-3 flex-1">
                {!schedule.closed ? (
                  <>
                    <input
                      type="time"
                      value={schedule.open || '09:00'}
                      onChange={(e) => updateDay(day.key as keyof OpeningHours, {
                        ...schedule,
                        open: e.target.value,
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={schedule.close || '18:00'}
                      onChange={(e) => updateDay(day.key as keyof OpeningHours, {
                        ...schedule,
                        close: e.target.value,
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                ) : (
                  <span className="text-gray-500 italic">Chiuso</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateDay(day.key as keyof OpeningHours, 
                    schedule.closed ? DEFAULT_SCHEDULE : CLOSED_SCHEDULE
                  )}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    schedule.closed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {schedule.closed ? 'Apri' : 'Chiudi'}
                </button>

                {!schedule.closed && (
                  <button
                    type="button"
                    onClick={() => copyToAll(schedule)}
                    title="Copia a tutti i giorni"
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const createDefaultOpeningHours = (): OpeningHours => ({
  monday: { closed: true },
  tuesday: { closed: true },
  wednesday: { closed: true },
  thursday: { closed: true },
  friday: { closed: true },
  saturday: { closed: true },
  sunday: { closed: true },
});
