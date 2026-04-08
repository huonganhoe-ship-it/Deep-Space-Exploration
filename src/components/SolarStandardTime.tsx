import React, { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock, Thermometer } from 'lucide-react';

export const SolarStandardTime: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneAbbr = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(time).split(', ')[1] || '';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const localTimeStr = formatInTimeZone(time, userTimeZone, 'HH.mm.ss');
  const localDayStr = formatInTimeZone(time, userTimeZone, 'EEE');
  const localDateStr = formatInTimeZone(time, userTimeZone, "d 'of' MMMM, yyyy");

  return (
    <div className="flex flex-col items-end text-white/80 font-mono">
      <div className="flex items-center gap-3 text-xl font-bold text-white">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          <span>{localTimeStr}</span>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-tighter">
          Solar Standard
        </span>
      </div>
      <div className="text-xs uppercase tracking-widest opacity-60 flex items-center gap-2">
        <span>{localDayStr}, {localDateStr} • {userTimeZone} ({timeZoneAbbr})</span>
      </div>
    </div>
  );
};
