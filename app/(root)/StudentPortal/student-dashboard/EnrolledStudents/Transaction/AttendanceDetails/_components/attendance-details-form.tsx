'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AttendanceDetailsFormProps {
    years: { asmaY_Id: number; asmaY_Year: string }[];
    selectedYear: string;
    onYearChange: (yearId: string) => void;
}

export default function AttendanceDetailsForm({ years, selectedYear, onYearChange }: AttendanceDetailsFormProps) {
    return (
        <div className='flex items-center gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm'>
            <Label htmlFor='academic-year' className='whitespace-nowrap font-medium'>
                Academic Year :<span className='text-red-500'>*</span>
            </Label>
            <div className='w-full max-w-xs'>
                <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger id='academic-year'>
                        <SelectValue placeholder='Select Year' />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                {year.asmaY_Year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
