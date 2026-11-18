import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

interface CollapsibleSectionProps {
    title?: ReactNode;
    description?: string;
    children: ReactNode;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    keepContentMounted?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    rightElement?: ReactNode;
    icon?: ReactNode;
}

export function CollapsibleSection({
    title,
    description,
    children,
    defaultOpen = false,
    onOpenChange,
    className = '',
    headerClassName = '',
    contentClassName = '',
    variant = 'default',
    size = 'md',
    keepContentMounted = true,
    rightElement,
    icon
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen);

    useEffect(() => {
        if (isOpen && !hasBeenOpened) {
            setHasBeenOpened(true);
        }
    }, [isOpen, hasBeenOpened]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const variantClasses = {
        default: 'card-bordered',
        ghost: 'border-0 shadow-none bg-transparent',
        outline: 'border-2 shadow-none'
    };

    // Compact header when no title/description
    const compactHeader = !title && !description ? 'py-2' : 'py-3';

    return (
        <Collapsible open={isOpen} onOpenChange={handleOpenChange} className={className}>
            <Card className={cn(variantClasses[variant], 'transition-all duration-300', className)}>
                <CollapsibleTrigger asChild>
                    <div className='w-full' role='button' tabIndex={0}>
                        <CardHeader
                            className={cn(
                                'transition-colors duration-300 hover:bg-slate-50/50 dark:hover:bg-white/5',
                                variant === 'default' && 'card-bordered-header',
                                compactHeader,
                                headerClassName
                            )}>
                            <div className='flex w-full items-center justify-between'>
                                <div className='flex items-center pl-2'>
                                    {icon && <div className='mr-4 text-slate-400 transition-colors group-hover:text-slate-600'>{icon}</div>}
                                    {(title || description) && (
                                        <div className='space-y-0.5 text-left'>
                                            {title && (
                                                <div className={cn('card-bordered-title tracking-tight', sizeClasses[size])}>{title}</div>
                                            )}
                                            {description && (
                                                <p className='font-medium text-[11px] text-slate-400 leading-tight'>{description}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className='flex items-center gap-4'>
                                    {rightElement && <div onClick={(e) => e.stopPropagation()}>{rightElement}</div>}
                                    <div className='flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-slate-200 hover:bg-slate-50 dark:border-white/5 dark:bg-slate-900/50 dark:hover:border-white/20'>
                                        <ChevronRight
                                            className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent
                    className='transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'
                    forceMount={true}
                    style={keepContentMounted && !isOpen ? { display: 'none' } : undefined}>
                    <CardContent className={cn('pt-6 pb-8', contentClassName)}>{children}</CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
