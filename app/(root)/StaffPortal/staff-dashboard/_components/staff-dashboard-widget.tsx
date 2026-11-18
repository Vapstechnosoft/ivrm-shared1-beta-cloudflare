'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface StaffDashboardWidgetProps {
    title: string;
    icon: React.ReactNode;
    colorClass: string; // e.g. "bg-primary", "bg-secondary", "bg-[#00c0ef]"
    children?: React.ReactNode;
    footerText?: string;
    onViewClick?: () => void;
}

export function StaffDashboardWidget({ title, icon, colorClass, children, footerText, onViewClick }: StaffDashboardWidgetProps) {
    // Determine glow color class based on input colorClass
    const getGlowClass = (cls: string) => {
        if (cls.includes('00c0ef') || cls.includes('blue')) return 'neon-glow-blue';
        if (cls.includes('00a65a') || cls.includes('green')) return 'neon-glow-green';
        if (cls.includes('f39c12') || cls.includes('ff851b') || cls.includes('orange')) return 'neon-glow-orange';
        if (cls.includes('605ca8') || cls.includes('purple')) return 'neon-glow-purple';
        return 'neon-glow-purple'; // Default
    };

    const glowClass = getGlowClass(colorClass);

    return (
        <div className='group cursor-pointer' onClick={onViewClick}>
            <Card className='card-bento card-bento-reveal flex min-h-[180px] flex-col justify-between overflow-hidden transition-all duration-500 hover:scale-[1.02]'>
                {/* Visual Accent - Neon Glow Strip */}
                <div className={glowClass} />

                <div className='relative z-10 p-6'>
                    <div className='mb-4 flex items-start justify-between'>
                        {/* Icon with colored background circular container */}
                        <div
                            className={cn(
                                'flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110',
                                colorClass
                            )}>
                            <div className='[&>svg]:h-7 [&>svg]:w-7'>{icon}</div>
                        </div>

                        {/* Animated Arrow that appears on hover */}
                        <div className='translate-x-4 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
                                <ArrowUpRight className='h-4 w-4 text-primary' />
                            </div>
                        </div>
                    </div>

                    {/* Title and Content */}
                    <div className='space-y-1'>
                        <h3 className='font-bold text-slate-500 text-sm uppercase tracking-widest dark:text-slate-400'>{title}</h3>
                        <div className='font-black text-2xl text-slate-800 tracking-tight dark:text-white'>{children}</div>
                    </div>
                </div>

                {/* Glassmorphism Bottom Bar */}
                {footerText && (
                    <div className='glass-pane flex items-center justify-between rounded-none border-x-0 border-b-0 px-6 py-4 transition-colors group-hover:bg-white/60 dark:group-hover:bg-slate-900/80'>
                        <span className='font-bold text-slate-600 text-xs uppercase tracking-wider dark:text-slate-300'>{footerText}</span>
                        <ChevronRightIcon className='h-4 w-4 text-slate-400 transition-colors group-hover:text-primary' />
                    </div>
                )}
            </Card>
        </div>
    );
}

function ChevronRightIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='m9 18 6-6-6-6' />
        </svg>
    );
}
