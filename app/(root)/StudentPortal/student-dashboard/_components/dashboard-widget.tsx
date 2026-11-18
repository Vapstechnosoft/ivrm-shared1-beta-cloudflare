import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface DashboardWidgetProps {
    title: string;
    icon: React.ReactNode;
    colorClass: string; // e.g. "bg-green-500"
    children?: React.ReactNode;
    footerText?: string;
    onViewClick?: () => void;
}

export function DashboardWidget({ title, icon, colorClass, children, footerText, onViewClick }: DashboardWidgetProps) {
    // Helper to get text color based on bg color (simple mapping or convention)
    // The legacy code uses classes like "text-c-blue" for the title.
    // We'll use the same color class but replace 'bg-' with 'text-' for the title if it follows standard Tailwind patterns,
    // or just default to a standard dark blue/gray if not perfectly matchable.

    // Legacy style: Icon is floating on the left/top-left, content is right aligned.

    const textColorClass = colorClass.replace('bg-', 'text-');

    return (
        <div className='relative pt-8 md:pt-10'>
            <Card className='relative overflow-visible rounded-lg border-0 shadow-md'>
                <div className='flex min-h-[140px] flex-col justify-between p-4 pt-8 md:pt-8'>
                    {/* Floating Icon */}
                    <div
                        className={cn(
                            '-top-6 absolute left-4 flex h-16 w-16 items-center justify-center rounded-md text-white shadow-lg',
                            colorClass
                        )}>
                        {/* Render icon with a specific size */}
                        <div className='[&>svg]:h-8 [&>svg]:w-8'>{icon}</div>
                    </div>

                    {/* Content Section */}
                    <div className='space-y-2 text-right'>
                        <span className={cn('font-bold text-lg uppercase tracking-wide', textColorClass)}>{title}</span>

                        <div className='mt-2 text-slate-600 dark:text-slate-300'>
                            {/* Children content (Name, Fees, etc.) */}
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {footerText && (
                    <div
                        className='flex cursor-pointer items-center gap-2 border-t bg-slate-50 px-4 py-3 text-muted-foreground transition-colors hover:text-primary dark:bg-zinc-900/50'
                        onClick={onViewClick}>
                        <span className={cn('font-bold text-xs uppercase', textColorClass)}>{icon}</span>
                        <span className='flex-1 font-bold text-xs uppercase'>{footerText}</span>
                        <div className='rounded-full bg-slate-200 p-1 dark:bg-slate-700'>
                            <ArrowRight className='h-3 w-3' />
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
