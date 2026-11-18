'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

interface DetailedTimePickerProps {
    value?: string; // HH:mm
    onChange: (value: string) => void;
    error?: string;
}

export function DetailedTimePicker({ value = 'HH:MM', onChange, error }: DetailedTimePickerProps) {
    const [hours, setHours] = React.useState('HH');
    const [minutes, setMinutes] = React.useState('MM');

    React.useEffect(() => {
        if (value && value.includes(':')) {
            const [h, m] = value.split(':');
            setHours(h || 'HH');
            setMinutes(m || 'MM');
        } else {
            setHours('HH');
            setMinutes('MM');
        }
    }, [value]);

    const updateTime = (newHours: string, newMinutes: string) => {
        onChange(`${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`);
    };

    const handleIncrementHour = () => {
        const h = isNaN(Number.parseInt(hours)) ? -1 : Number.parseInt(hours);
        const nextH = (h + 1) % 24;
        updateTime(String(nextH), isNaN(Number.parseInt(minutes)) ? '00' : minutes);
    };

    const handleDecrementHour = () => {
        const h = isNaN(Number.parseInt(hours)) ? 1 : Number.parseInt(hours);
        const nextH = (h - 1 + 24) % 24;
        updateTime(String(nextH), isNaN(Number.parseInt(minutes)) ? '00' : minutes);
    };

    const handleIncrementMinute = () => {
        const m = isNaN(Number.parseInt(minutes)) ? -1 : Number.parseInt(minutes);
        const nextM = (m + 1) % 60;
        updateTime(isNaN(Number.parseInt(hours)) ? '00' : hours, String(nextM));
    };

    const handleDecrementMinute = () => {
        const m = isNaN(Number.parseInt(minutes)) ? 1 : Number.parseInt(minutes);
        const nextM = (m - 1 + 60) % 60;
        updateTime(isNaN(Number.parseInt(hours)) ? '00' : hours, String(nextM));
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(-2);

        if (val === '') {
            setHours('HH');
            return;
        }

        const num = Number.parseInt(val);
        if (num < 24) {
            setHours(val);
            updateTime(val, isNaN(Number.parseInt(minutes)) ? '00' : minutes);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(-2);

        if (val === '') {
            setMinutes('MM');
            return;
        }

        const num = Number.parseInt(val);
        if (num < 60) {
            setMinutes(val);
            updateTime(isNaN(Number.parseInt(hours)) ? '00' : hours, val);
        }
    };

    return (
        <div className='flex flex-col items-start gap-1'>
            <div className='flex items-center gap-1'>
                {/* Hours Group */}
                <div className='flex flex-col items-center'>
                    <button type='button' onClick={handleIncrementHour} className='p-1 text-[#3b82f6] transition-all hover:scale-110'>
                        <ChevronUp className='h-6 w-6 stroke-[3px]' />
                    </button>
                    <div
                        className={cn(
                            'flex h-12 w-14 items-center justify-center rounded border-2 bg-white transition-colors',
                            error ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)]' : 'border-[#3b82f6]'
                        )}>
                        <input
                            type='text'
                            value={hours}
                            onChange={handleHourChange}
                            onBlur={() => {
                                if (!isNaN(Number.parseInt(hours))) setHours(hours.padStart(2, '0'));
                                else setHours('HH');
                            }}
                            className={cn(
                                'h-full w-full bg-transparent text-center font-medium text-xl outline-none',
                                hours === 'HH' ? 'text-gray-300' : 'text-gray-400'
                            )}
                        />
                    </div>
                    <button type='button' onClick={handleDecrementHour} className='p-1 text-[#3b82f6] transition-all hover:scale-110'>
                        <ChevronDown className='h-6 w-6 stroke-[3px]' />
                    </button>
                </div>

                <div className={cn('mx-1 self-center font-bold text-2xl transition-colors', error ? 'text-red-500' : 'text-[#3b82f6]')}>
                    :
                </div>

                {/* Minutes Group */}
                <div className='flex flex-col items-center'>
                    <button type='button' onClick={handleIncrementMinute} className='p-1 text-[#3b82f6] transition-all hover:scale-110'>
                        <ChevronUp className='h-6 w-6 stroke-[3px]' />
                    </button>
                    <div
                        className={cn(
                            'flex h-12 w-14 items-center justify-center rounded border-2 bg-white transition-colors',
                            error ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)]' : 'border-[#3b82f6]'
                        )}>
                        <input
                            type='text'
                            value={minutes}
                            onChange={handleMinuteChange}
                            onBlur={() => {
                                if (!isNaN(Number.parseInt(minutes))) setMinutes(minutes.padStart(2, '0'));
                                else setMinutes('MM');
                            }}
                            className={cn(
                                'h-full w-full bg-transparent text-center font-medium text-xl outline-none',
                                minutes === 'MM' ? 'text-gray-300' : 'text-gray-400'
                            )}
                        />
                    </div>
                    <button type='button' onClick={handleDecrementMinute} className='p-1 text-[#3b82f6] transition-all hover:scale-110'>
                        <ChevronDown className='h-6 w-6 stroke-[3px]' />
                    </button>
                </div>
            </div>

            {error && <p className='mt-1 font-medium text-red-500 text-sm'>{error}</p>}
        </div>
    );
}
