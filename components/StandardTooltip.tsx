'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type React from 'react';

interface StandardTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    className?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

export function StandardTooltip({ children, content, className, side = 'top' }: StandardTooltipProps) {
    if (!content) return <>{children}</>;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={cn('inline-flex cursor-help items-center', className)}>{children}</span>
                </TooltipTrigger>
                <TooltipContent side={side} className={className}>
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
