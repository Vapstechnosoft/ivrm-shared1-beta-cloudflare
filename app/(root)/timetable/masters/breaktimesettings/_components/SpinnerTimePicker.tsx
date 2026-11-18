'use client';

import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SpinnerTimePickerProps {
    value?: Date;
    onChange: (date: Date) => void;
}

export function SpinnerTimePicker({ value, onChange }: SpinnerTimePickerProps) {
    const hasValue = !!value;
    const displayHour = hasValue
        ? value.getHours() % 12 === 0
            ? 12
            : value.getHours() % 12
        : undefined;
    const minute = hasValue ? value.getMinutes() : undefined;
    const isPM = hasValue ? value.getHours() >= 12 : false;

    const updateTime = (h: number | undefined, m: number | undefined, pm: boolean) => {
        const d = value ? new Date(value) : new Date();

        if (!value) {
            d.setHours(0, 0, 0, 0);
        }

        let inputHour = h ?? 12;
        if (inputHour === 0) inputHour = 12;
        if (inputHour > 12) inputHour = 12;

        let newHour = inputHour % 12;
        if (pm) newHour += 12;

        d.setHours(newHour);
        d.setMinutes(m ?? 0);
        d.setSeconds(0); // ✅ force seconds to 0
        d.setMilliseconds(0); // optional but good practice

        onChange(d);
    };

    const handleHourUp = () => {
        const nextHour = displayHour === undefined ? 1 : displayHour === 12 ? 1 : displayHour + 1;
        updateTime(nextHour, minute ?? 0, isPM);
    };

    const handleHourDown = () => {
        const prevHour = displayHour === undefined ? 12 : displayHour === 1 ? 12 : displayHour - 1;
        updateTime(prevHour, minute ?? 0, isPM);
    };

    return (
        <div className='flex items-center gap-3'>
            {/* Hour */}
            <TimeColumn>
                <ArrowUp onClick={handleHourUp} />
                <InputBox value={displayHour} max={12} placeholder='HH' onChange={(v) => updateTime(v, minute ?? 0, isPM)} />
                <ArrowDown onClick={handleHourDown} />
            </TimeColumn>

            {/* Minute */}
            <TimeColumn>
                <ArrowUp onClick={() => updateTime(displayHour, ((minute ?? 0) + 1) % 60, isPM)} />
                <InputBox value={minute} max={59} placeholder='MM' pad onChange={(v) => updateTime(displayHour, v, isPM)} />
                <ArrowDown onClick={() => updateTime(displayHour, ((minute ?? 0) + 59) % 60, isPM)} />
            </TimeColumn>

            {/* AM / PM */}
            <TimeColumn>
                <ArrowUp onClick={() => updateTime(displayHour, minute ?? 0, !isPM)} />
                <Input
                    value={isPM ? 'PM' : 'AM'}
                    readOnly
                    className='w-14 cursor-pointer text-center font-semibold'
                    onClick={() => updateTime(displayHour, minute ?? 0, !isPM)}
                />
                <ArrowDown onClick={() => updateTime(displayHour, minute ?? 0, !isPM)} />
            </TimeColumn>
        </div>
    );
}

/* ---------- Helpers ---------- */

function TimeColumn({ children }: { children: React.ReactNode }) {
    return <div className='flex flex-col items-center gap-1'>{children}</div>;
}

function ArrowUp({ onClick }: { onClick: () => void }) {
    return <ChevronUp className='h-4 w-4 cursor-pointer text-gray-600' onClick={onClick} />;
}

function ArrowDown({ onClick }: { onClick: () => void }) {
    return <ChevronDown className='h-4 w-4 cursor-pointer text-gray-600' onClick={onClick} />;
}

function InputBox({
    value,
    max,
    pad,
    placeholder,
    onChange
}: {
    value: number | undefined;
    max: number;
    pad?: boolean;
    placeholder?: string;
    onChange: (v: number) => void;
}) {
    const formatValue = (v: number | undefined) => {
        if (v === undefined) return '';
        return pad ? v.toString().padStart(2, '0') : v.toString();
    };

    const [inputValue, setInputValue] = useState<string>(formatValue(value));

    useEffect(() => {
        const formatted = formatValue(value);
        if (inputValue !== formatted && inputValue !== '' && inputValue !== '0') {
            setInputValue(formatted);
        } else if (value !== undefined && inputValue === '') {
            // If value becomes defined but we are in an empty-input state, sync it
            setInputValue(formatted);
        }
    }, [value, pad]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (v === '') {
            setInputValue('');
            return;
        }

        if (!/^\d*$/.test(v)) return;

        const num = Number.parseInt(v, 10);
        if (Number.isNaN(num) || num > max) return;

        setInputValue(v);
        onChange(num);
    };

    const handleBlur = () => {
        if (inputValue === '') {
            return;
        } else if (pad) {
            setInputValue(inputValue.padStart(2, '0'));
        } else if (value !== undefined) {
            setInputValue(formatValue(value));
        }
    };

    return (
        <Input
            type='text'
            value={inputValue}
            placeholder={placeholder}
            onBlur={handleBlur}
            onChange={handleInputChange}
            className='w-14 text-center font-semibold'
        />
    );
}
