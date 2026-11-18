 'use client';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { StudentMessageCategory } from '@/hooks/admission/sms/reports/useGeneralSms';


const CATEGORIES: { value: StudentMessageCategory; label: string }[] = [
    { value: 'exam', label: 'Exam' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'transport', label: 'Transport' },
    { value: 'template', label: 'Template' }
];

interface Props {
    value: StudentMessageCategory | null;
    onChange: (v: StudentMessageCategory) => void;
}

export default function StudentCategorySelector({ value, onChange }: Props) {
    return (
        <div className='mx-auto w-full max-w-xl rounded-lg border bg-white px-6 py-3 shadow-sm'>
            <RadioGroup
                value={value ?? ''}
                onValueChange={(v) => onChange(v as StudentMessageCategory)}
                className='flex flex-wrap items-center justify-center gap-x-8 gap-y-3'>
                {CATEGORIES.map((c) => (
                    <div key={c.value} className='flex items-center gap-2'>
                        <RadioGroupItem id={`cat-${c.value}`} value={c.value} />
                        <Label htmlFor={`cat-${c.value}`} className='cursor-pointer'>
                            {c.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}


