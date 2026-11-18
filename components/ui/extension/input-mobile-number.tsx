import { FieldError, FieldGroup, Label } from '@/components/ui/extension/field';
import { cn } from '@/lib/utils';
import type * as React from 'react';
import { Input } from 'react-aria-components';

interface MobileNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    required?: boolean;
    optional?: boolean;
    error?: string;
    inputFieldClassName?: string;
    showSpinner?: boolean;
    requiredTooltip?: string;
}

import { StandardTooltip } from '@/components/StandardTooltip';

function MobileNumberInput({
    label,
    description,
    error,
    className,
    inputFieldClassName,
    required,
    optional,
    showSpinner = true,
    value,
    requiredTooltip,
    ...props
}: MobileNumberInputProps) {
    const handleNumericInput = (event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        target.value = target.value.replace(/\D/g, '');
        props.onChange?.(event as any);
    };

    return (
        <div className={cn('group flex flex-col gap-1.5', className)}>
            <Label aria-label={label}>
                {label}
                {required && (
                    <StandardTooltip content={requiredTooltip || `${label} is mandatory. Please fill it.`}>
                        <span className='ml-1 font-bold text-red-500 transition-transform hover:scale-110'>*</span>
                    </StandardTooltip>
                )}
                {optional && <span className='text-muted-foreground'>(optional)</span>}
            </Label>
            <FieldGroup className={cn('w-full', inputFieldClassName)}>
                <Input
                    {...props}
                    type='tel'
                    pattern='[0-9]*'
                    inputMode='numeric'
                    className='w-fit min-w-0 flex-1 border-transparent bg-background pr-2 outline-none placeholder:text-muted-foreground disabled:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                    onInput={handleNumericInput}
                    value={value ?? ''}
                />
            </FieldGroup>
            {description && !error && <span className='text-[0.8rem] text-muted-foreground'>{description}</span>}
            <FieldError>{error}</FieldError>
        </div>
    );
}

export { MobileNumberInput };
export type { MobileNumberInputProps };
