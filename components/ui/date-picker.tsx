'use client';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import type { DayPicker } from 'react-day-picker';

interface DatePickerProps extends Omit<React.ComponentProps<typeof DayPicker>, 'selected' | 'onSelect' | 'mode'> {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, placeholder = 'Pick a date', className, ...props }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground', className)}>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, 'PPP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
                <DatePickerWithYear
                    mode='single'
                    {...props}
                    selected={date}
                    onDayClick={(day) => {
                        setDate(day);
                        setOpen(false);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
