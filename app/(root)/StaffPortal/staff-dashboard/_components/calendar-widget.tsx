'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IEvent } from '@/types/staff-portal/dashboard';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CalendarWidgetProps {
    events: IEvent[];
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function CalendarWidget({ events }: CalendarWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();

    // Generate grid of days for the current month view (6 weeks × 7 days = 42 cells)
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days: Date[] = [];
        let day = calStart;
        while (day <= calEnd) {
            days.push(day);
            day = addDays(day, 1);
        }
        // Ensure we always have 42 cells (6 rows)
        while (days.length < 42) {
            days.push(addDays(days[days.length - 1], 1));
        }
        return days;
    }, [currentDate]);

    // Map events to dates for quick lookup
    const eventsByDate = useMemo(() => {
        const map = new Map<string, IEvent[]>();
        events.forEach((event) => {
            try {
                const startDate = new Date(event.coeE_EStartDate);
                const endDate = new Date(event.coeE_EEndDate);
                // Add event to every day in its range
                let d = new Date(startDate);
                d.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                while (d <= end) {
                    const key = format(d, 'yyyy-MM-dd');
                    if (!map.has(key)) map.set(key, []);
                    map.get(key)!.push(event);
                    d = addDays(d, 1);
                }
            } catch {
                // Skip invalid dates
            }
        });
        return map;
    }, [events]);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Get a color for event dots based on index
    const dotColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-cyan-500'];

    return (
        <Card className='card-bento overflow-hidden'>
            {/* Header */}
            <div className='relative px-6 pt-6 pb-4'>
                {/* Decorative glow */}
                <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 opacity-80' />

                <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg'>
                            <CalendarIcon className='h-5 w-5 text-white' />
                        </div>
                        <div>
                            <h3 className='font-black text-slate-500 text-sm uppercase tracking-[0.15em] dark:text-slate-400'>
                                Calendar of Events
                            </h3>
                            <p className='font-medium text-slate-400 text-xs dark:text-slate-500'>
                                {events.length} event{events.length !== 1 ? 's' : ''} scheduled
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-1'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-black text-[10px] text-emerald-600 uppercase tracking-wider dark:bg-emerald-950/30 dark:text-emerald-400'>
                            <Sparkles className='h-3 w-3' />
                            Live
                        </span>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className='flex items-center justify-between'>
                    <h2 className='font-black text-slate-900 text-xl tracking-tight dark:text-white'>{format(currentDate, 'MMMM yyyy')}</h2>
                    <div className='flex items-center gap-1'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800'
                            onClick={handlePrevMonth}>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 rounded-xl px-3 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800'
                            onClick={handleToday}>
                            Today
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800'
                            onClick={handleNextMonth}>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className='px-6 pb-6'>
                {/* Day Headers */}
                <div className='mb-2 grid grid-cols-7'>
                    {DAY_LABELS.map((day) => (
                        <div
                            key={day}
                            className='py-2 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest dark:text-slate-500'>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day Cells */}
                <div className='grid grid-cols-7 gap-[2px]'>
                    {calendarDays.map((day, idx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayEvents = eventsByDate.get(dateKey) || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, today);
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <div
                                key={idx}
                                className={`relative flex min-h-[48px] cursor-default flex-col items-center justify-start rounded-xl py-1.5 transition-all duration-200 ${
                                    isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'
                                }
                                    ${
                                        isToday
                                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-2 ring-primary/30'
                                            : hasEvents && isCurrentMonth
                                              ? 'bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/50'
                                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                                    }
                                `}
                                title={dayEvents.map((e) => e.eventName || e.coemE_EventName).join('\n')}>
                                <span
                                    className={`font-bold text-xs leading-none ${
                                        isToday
                                            ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary font-black text-white shadow-md shadow-primary/30'
                                            : ''
                                    }
                                    `}>
                                    {format(day, 'd')}
                                </span>

                                {/* Event Dots */}
                                {hasEvents && isCurrentMonth && (
                                    <div className='mt-1 flex gap-[3px]'>
                                        {dayEvents.slice(0, 3).map((_, dotIdx) => (
                                            <span
                                                key={dotIdx}
                                                className={`h-[5px] w-[5px] rounded-full ${dotColors[dotIdx % dotColors.length]} shadow-sm`}
                                            />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className='font-black text-[8px] text-slate-400 leading-none'>
                                                +{dayEvents.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Events Footer */}
            {events.length > 0 && (
                <div className='border-slate-100 border-t px-6 py-4 dark:border-slate-800'>
                    <p className='mb-3 font-black text-[10px] text-slate-400 uppercase tracking-[0.15em]'>Upcoming Events</p>
                    <div className='max-h-[140px] space-y-2 overflow-y-auto pr-1'>
                        {events
                            .filter((e) => {
                                try {
                                    return new Date(e.coeE_EStartDate) >= new Date(new Date().toDateString());
                                } catch {
                                    return false;
                                }
                            })
                            .sort((a, b) => new Date(a.coeE_EStartDate).getTime() - new Date(b.coeE_EStartDate).getTime())
                            .slice(0, 4)
                            .map((event, idx) => (
                                <div
                                    key={idx}
                                    className='group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40'>
                                    <div className={`h-2 w-2 rounded-full ${dotColors[idx % dotColors.length]} flex-shrink-0`} />
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate font-bold text-slate-700 text-xs dark:text-slate-300'>
                                            {event.eventName || event.coemE_EventName}
                                        </p>
                                    </div>
                                    <span className='whitespace-nowrap font-bold text-[10px] text-slate-400 dark:text-slate-500'>
                                        {format(new Date(event.coeE_EStartDate), 'dd MMM')}
                                    </span>
                                </div>
                            ))}
                        {events.filter((e) => {
                            try {
                                return new Date(e.coeE_EStartDate) >= new Date(new Date().toDateString());
                            } catch {
                                return false;
                            }
                        }).length === 0 && (
                            <p className='py-2 text-center text-slate-400 text-xs italic dark:text-slate-500'>No upcoming events</p>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
