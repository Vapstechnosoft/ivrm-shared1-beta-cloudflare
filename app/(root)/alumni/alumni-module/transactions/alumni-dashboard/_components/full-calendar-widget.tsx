'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CalendarWidgetProps {
    events: any[];
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function FullCalendarWidget({ events }: CalendarWidgetProps) {
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
        const map = new Map<string, any[]>();
        events.forEach((event) => {
            try {
                // Try different possible event date properties
                const startDateStr = event.coeE_EStartDate || event.coee_estartdate || event.StartDate;
                const endDateStr = event.coeE_EEndDate || event.coee_eenddate || event.EndDate || startDateStr;

                if (!startDateStr) return;

                const startDate = new Date(startDateStr);
                const endDate = new Date(endDateStr);

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
        <Card className='card-bento mt-8 overflow-hidden shadow-xl ring-1 ring-black/5'>
            {/* Header */}
            <div className='relative border-b bg-indigo-50/50 px-6 pt-6 pb-4'>
                <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/20 shadow-lg'>
                            <CalendarIcon className='h-5 w-5 text-white' />
                        </div>
                        <div>
                            <h3 className='font-bold text-indigo-900 text-lg uppercase tracking-wider'>Calendar of Events</h3>
                            <p className='font-medium text-slate-500 text-xs'>
                                {events.length} event{events.length !== 1 ? 's' : ''} scheduled
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-1'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 font-bold text-[10px] text-indigo-700 uppercase tracking-wider'>
                            <Sparkles className='h-3 w-3' />
                            Live
                        </span>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className='mt-4 flex items-center justify-between'>
                    <h2 className='font-black text-indigo-900 text-xl uppercase tracking-tight'>{format(currentDate, 'MMMM yyyy')}</h2>
                    <div className='flex items-center gap-1'>
                        <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 rounded-md border-indigo-100 hover:bg-indigo-100 hover:text-indigo-900'
                            onClick={handlePrevMonth}>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            className='h-8 rounded-md border-indigo-100 bg-white px-4 font-bold text-indigo-700 text-xs uppercase tracking-wider hover:bg-indigo-100 hover:text-indigo-900'
                            onClick={handleToday}>
                            Today
                        </Button>
                        <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 rounded-md border-indigo-100 hover:bg-indigo-100 hover:text-indigo-900'
                            onClick={handleNextMonth}>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className='p-6'>
                {/* Day Headers */}
                <div className='mb-2 grid grid-cols-7'>
                    {DAY_LABELS.map((day) => (
                        <div key={day} className='py-2 text-center font-bold text-indigo-900 text-xs uppercase tracking-widest'>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day Cells */}
                <div className='grid grid-cols-7 gap-2'>
                    {calendarDays.map((day, idx) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayEvents = eventsByDate.get(dateKey) || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, today);
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <div
                                key={idx}
                                className={`relative flex min-h-[80px] cursor-default flex-col rounded-lg border p-2 transition-all duration-200 ${
                                    isCurrentMonth ? 'text-slate-800' : 'bg-slate-50/50 text-slate-400'
                                }
                                    ${
                                        isToday
                                            ? 'border-indigo-500 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-500'
                                            : hasEvents && isCurrentMonth
                                              ? 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                              : 'border-slate-100 bg-white hover:bg-slate-50'
                                    }
                                `}
                                title={dayEvents.map((e) => e.eventName || e.coemE_EventName || e.coeme_eventname).join('\n')}>
                                <div className='flex justify-end'>
                                    <span
                                        className={`font-medium text-sm ${
                                            isToday
                                                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-indigo-200 shadow-md'
                                                : ''
                                        }
                                        `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Event Dots / Bars */}
                                {hasEvents && isCurrentMonth && (
                                    <div className='mt-2 flex flex-col gap-1'>
                                        {dayEvents.slice(0, 2).map((event, eventIdx) => (
                                            <div
                                                key={eventIdx}
                                                className={`truncate rounded px-1.5 py-0.5 font-medium text-[10px] text-white ${dotColors[eventIdx % dotColors.length]}`}>
                                                {event.eventName || event.coemE_EventName || event.coeme_eventname || 'Event'}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div className='pl-1 font-medium text-slate-500 text-xs'>+{dayEvents.length - 2} more</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
