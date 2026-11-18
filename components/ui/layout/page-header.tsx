'use client';

import { cn } from '@/lib/utils';
import type * as React from 'react';

interface PageHeaderProps {
    title: string;
    highlightWord?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, highlightWord, description, className, children }: PageHeaderProps) {
    const parts = highlightWord ? title.split(highlightWord) : [title];

    return (
        <div className={cn('flex flex-col justify-between gap-4 md:flex-row md:items-end', className)}>
            <div className='space-y-2'>
                <h1 className='font-black text-4xl text-[#1E293B] tracking-tight'>
                    {highlightWord && parts.length > 1 ? (
                        <>
                            {parts[0]}
                            <span className='text-[#7C3AED]'>{highlightWord}</span>
                            {parts[1]}
                        </>
                    ) : (
                        title
                    )}
                </h1>
                {description && <p className='max-w-2xl font-medium text-slate-500'>{description}</p>}
            </div>
            {children && <div className='flex items-center gap-3'>{children}</div>}
        </div>
    );
}
