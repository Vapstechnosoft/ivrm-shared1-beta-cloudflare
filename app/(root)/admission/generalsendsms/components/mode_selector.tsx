 'use client';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SendMode } from '@/hooks/admission/sms/reports/useGeneralSms';

const MODES: { value: SendMode; label: string }[] = [
    { value: 'general-sms', label: 'General SMS' },
    { value: 'general-email', label: 'General Email' },
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' }
];

export default function ModeSelector({ value, onChange }: { value: SendMode; onChange: (v: SendMode) => void }) {
    return (
        <div className='mx-auto w-full max-w-3xl rounded-lg border bg-white px-6 py-3 shadow-sm'>
            <RadioGroup
                value={value}
                onValueChange={(v) => onChange(v as SendMode)}
                className='flex flex-wrap items-center justify-center gap-x-10 gap-y-3'>
                {MODES.map((m) => (
                    <div key={m.value} className='flex items-center gap-2'>
                        <RadioGroupItem id={`mode-${m.value}`} value={m.value} />
                        <Label htmlFor={`mode-${m.value}`} className='cursor-pointer'>
                            {m.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}
