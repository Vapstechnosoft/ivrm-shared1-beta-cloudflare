'use client';

import { StandardTooltip } from '@/components/StandardTooltip';
import { FormDescription, FormError, Label } from '@/components/ui/extension/field';
import { cn } from '@/lib/utils';
import React from 'react';
import { Input } from '../input';

export interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    error?: string;
    optional?: boolean;
    requiredTooltip?: string;
}

const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
    ({ label, description, error, required, className, type, optional, requiredTooltip, ...props }, ref) => {
        return (
            <div className={cn('group flex flex-col gap-1.5', className)}>
                {label && (
                    <Label aria-label={label} htmlFor={props.id}>
                        {label}
                        {required && (
                            <StandardTooltip content={requiredTooltip || `${label} is mandatory. Please fill it.`}>
                                <span className='ml-1 font-bold text-red-500 transition-transform hover:scale-110'>*</span>
                            </StandardTooltip>
                        )}
                        {optional && <span className='text-[0.8rem] text-muted-foreground'>(optional)</span>}
                    </Label>
                )}

                <Input ref={ref} {...props} />

                {description && !error && <FormDescription>{description}</FormDescription>}

                {error && <FormError>{error}</FormError>}
            </div>
        );
    }
);
InputText.displayName = 'InputText';

export { InputText };
