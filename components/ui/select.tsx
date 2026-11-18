'use client';

import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';

// Custom Context for search functionality
const SelectSearchContext = React.createContext<{
    searchable?: boolean;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    isMobile: boolean;
}>({
    searchable: true,
    searchQuery: '',
    setSearchQuery: () => {
        /* default noop */
    },
    isMobile: false
});

// Fixed Select component - removing the forwardRef and properly extending the SelectPrimitive.Root
interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
    searchable?: boolean;
    allowZero?: boolean;
}

const Select = ({ children, searchable = true, allowZero = false, onOpenChange, ...props }: SelectProps & { onOpenChange?: (open: boolean) => void }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    // Check if device is mobile
    const isMobile = React.useMemo(() => {
        if (typeof window !== 'undefined') {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
        return false;
    }, []);

    // Clear search when the dropdown closes using onOpenChange from Radix
    const handleOpenChange = React.useCallback(
        (open: boolean) => {
            if (!open) {
                setSearchQuery('');
            }

            if (typeof onOpenChange === 'function') {
                try {
                    onOpenChange(open);
                } catch {
                    // swallow errors from consumer-provided handler
                }
            }
        },
        [onOpenChange]
    );

    // Normalize common "empty" values to undefined so Radix shows placeholder.
    const { value, ...restProps } = props as any;
    const normalizedValue = value === '' || value === null || (!allowZero && (value === 0 || value === '0')) ? undefined : value;

    const contextValue = React.useMemo(
        () => ({
            searchable,
            searchQuery,
            setSearchQuery,
            isMobile
        }),
        [searchable, searchQuery, isMobile]
    );

    return (
        <SelectSearchContext.Provider value={contextValue}>
            <SelectPrimitive.Root value={normalizedValue} {...restProps} onOpenChange={handleOpenChange}>
                {children}
            </SelectPrimitive.Root>
        </SelectSearchContext.Provider>
    );
};
Select.displayName = 'Select';

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
            className
        )}
        {...props}>
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className='h-4 w-4 opacity-50' />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn('absolute top-0 right-0 left-0 z-10 flex cursor-default items-center justify-center py-1', className)}
        {...props}>
        <ChevronUpIcon className='h-4 w-4' />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn('absolute right-0 bottom-0 left-0 z-10 flex cursor-default items-center justify-center py-1', className)}
        {...props}>
        <ChevronDownIcon className='h-4 w-4' />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

// Search input component for Select
const SelectSearch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
    const { searchQuery, setSearchQuery } = React.useContext(SelectSearchContext);

    return (
        <div className='sticky top-0 z-20 border-b bg-popover p-2'>
            <div className='flex items-center rounded-xl border px-2 py-1'>
                <MagnifyingGlassIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                <input
                    ref={ref}
                    className={cn('flex-1 bg-transparent text-sm outline-none', className)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key !== 'Escape' && e.key !== 'Tab') {
                            e.stopPropagation();
                        }
                    }}
                    autoComplete='off'
                    spellCheck='false'
                    {...props}
                />
            </div>
        </div>
    );
});
SelectSearch.displayName = 'SelectSearch';

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
    const { searchable } = React.useContext(SelectSearchContext);

    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                className={cn(
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-56 min-w-[8rem] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
                    position === 'popper' &&
                        'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
                    className
                )}
                position={position}
                {...props}>
                <SelectScrollUpButton />
                {searchable && <SelectSearch placeholder='Search...' />}
                <SelectPrimitive.Viewport
                    className={cn(
                        'p-1',
                        position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
                    )}>
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={cn('px-2 py-1.5 font-semibold text-sm', className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { textValue?: string }
>(({ className, children, textValue, ...props }, ref) => {
    const { searchQuery } = React.useContext(SelectSearchContext);

    // Pure CSS-based hiding. NEVER return null or toggle disabled — Radix Select
    // uses an internal Collection that re-registers items on mount/unmount/prop-change,
    // which triggers setState during render and causes "Maximum update depth exceeded".
    const isHidden = React.useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) return false;
        const q = searchQuery.trim().toLowerCase();
        const val = String(props.value || '').toLowerCase();
        let text = textValue || '';
        if (!text && typeof children === 'string') {
            text = children;
        } else if (!text && typeof children === 'number') {
            text = String(children);
        }
        return !text.toLowerCase().includes(q) && !val.includes(q);
    }, [searchQuery, textValue, children, props.value]);

    return (
        <SelectPrimitive.Item
            ref={ref}
            className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[disabled]:opacity-50',
                className
            )}
            style={isHidden ? { display: 'none' } : undefined}
            {...props}>
            <span className='absolute right-2 flex h-3.5 w-3.5 items-center justify-center'>
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className='h-4 w-4' />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
    SelectSearch
};
