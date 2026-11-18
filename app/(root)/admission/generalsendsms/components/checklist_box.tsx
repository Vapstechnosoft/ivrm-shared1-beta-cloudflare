 'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';

export interface ChecklistOption {
    id: number;
    label: string;
}

interface Props {
    id: string;
    label: string;
    required?: boolean;
    options: ChecklistOption[];
    selectedIds: Set<number>;
    onChange: (ids: Set<number>) => void;
}

// A "select all" header checkbox above a scrollable box of checkboxes.
export default function ChecklistBox({ id, label, required, options, selectedIds, onChange }: Props) {
    const allSelected = options.length > 0 && options.every((o) => selectedIds.has(o.id));
    const someSelected = options.some((o) => selectedIds.has(o.id));

    const toggle = (optId: number) => {
        const next = new Set(selectedIds);
        next.has(optId) ? next.delete(optId) : next.add(optId);
        onChange(next);
    };

    return (
        <div className='space-y-2'>
            <div className='flex items-center gap-2'>
                <Checkbox
                    id={`${id}-all`}
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={(v) => onChange(v === true ? new Set(options.map((o) => o.id)) : new Set())}
                />
                <Label htmlFor={`${id}-all`} className='cursor-pointer'>
                    {label} {required && <span className='text-red-500'>*</span>}
                </Label>
            </div>

            <div className='h-40 space-y-1 overflow-y-auto rounded-sm border border-primary bg-white p-2'>
                {options.map((o) => (
                    <div key={o.id} className='flex items-center gap-2'>
                        <Checkbox id={`${id}-${o.id}`} checked={selectedIds.has(o.id)} onCheckedChange={() => toggle(o.id)} />
                        <Label htmlFor={`${id}-${o.id}`} className='cursor-pointer text-sm font-normal'>
                            {o.label}
                        </Label>
                    </div>
                ))}
                {options.length === 0 && <p className='p-2 text-sm text-muted-foreground'>No records</p>}
            </div>
        </div>
    );
}
