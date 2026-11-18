'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';

interface GenericInputFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    type?: string;
    className?: string;
}

export function GenericInputField({ name, label, placeholder, required, disabled, type = 'text', className }: GenericInputFieldProps) {
    const {
        register,
        formState: { errors }
    } = useFormContext();
    const error = errors[name];

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Label htmlFor={name} className={cn(required && "after:ml-0.5 after:text-red-500 after:content-['*']")}>
                {label}
            </Label>
            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
                {...register(name)}
            />
            {error && <span className='text-destructive text-xs'>{error.message as string}</span>}
        </div>
    );
}

interface GenericTextAreaFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    rows?: number;
}

export function GenericTextAreaField({ name, label, placeholder, required, disabled, className, rows }: GenericTextAreaFieldProps) {
    const {
        register,
        formState: { errors }
    } = useFormContext();
    const error = errors[name];

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Label htmlFor={name} className={cn(required && "after:ml-0.5 after:text-red-500 after:content-['*']")}>
                {label}
            </Label>
            <Textarea
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
                {...register(name)}
                rows={rows}
            />
            {error && <span className='text-destructive text-xs'>{error.message as string}</span>}
        </div>
    );
}

interface GenericSelectFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    options: { value: string | number; label: string }[];
}

export function GenericSelectField({
    name,
    label,
    placeholder = '--Select--',
    required,
    disabled,
    className,
    options
}: GenericSelectFieldProps) {
    const {
        register,
        formState: { errors },
        setValue,
        watch
    } = useFormContext();
    const error = errors[name];
    const value = watch(name);

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Label htmlFor={name} className={cn(required && "after:ml-0.5 after:text-red-500 after:content-['*']")}>
                {label}
            </Label>
            <select
                id={name}
                disabled={disabled}
                className={cn(
                    'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                    error && 'border-destructive focus-visible:ring-destructive'
                )}
                value={value || ''}
                onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                        setValue(name, '', { shouldValidate: true });
                    } else {
                        const numVal = Number(val);
                        setValue(name, isNaN(numVal) ? val : numVal, { shouldValidate: true });
                    }
                }}>
                <option value='' disabled hidden>
                    {placeholder}
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className='text-destructive text-xs'>{error.message as string}</span>}
        </div>
    );
}
