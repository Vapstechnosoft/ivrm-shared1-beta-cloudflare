'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

export interface MultiSelectOption {
    id: number | string;
    label: string;
    code?: string;
    disabled?: boolean;
}

interface MultiSelectSearchProps {
    title: string;
    placeholder?: string;
    options: MultiSelectOption[];
    selectedIds: (number | string)[];
    onChange: (selectedIds: (number | string)[]) => void;
    disabled?: boolean;
    required?: boolean;
    maxDisplayBadges?: number;
    className?: string;
}

export function MultiSelectSearch({
    title,
    placeholder = 'Select items...',
    options = [],
    selectedIds = [],
    onChange,
    disabled = false,
    maxDisplayBadges = 2,
    className
}: MultiSelectSearchProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const query = searchTerm.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(query) || opt.code?.toLowerCase().includes(query));
    }, [options, searchTerm]);

    const isAllSelected = options.length > 0 && options.every((opt) => selectedIds.includes(opt.id));

    const handleToggle = (id: number | string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            onChange([]);
        } else {
            onChange(options.map((opt) => opt.id));
        }
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const selectedLabels = useMemo(() => {
        return options.filter((opt) => selectedIds.includes(opt.id));
    }, [options, selectedIds]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-auto min-h-[40px] w-full justify-between border-input bg-background px-3 py-2 text-left font-normal hover:bg-accent/50',
                        selectedIds.length === 0 && 'text-muted-foreground',
                        className
                    )}>
                    <div className='flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden'>
                        {selectedLabels.length === 0 ? (
                            <span>{placeholder}</span>
                        ) : (
                            <>
                                {selectedLabels.slice(0, maxDisplayBadges).map((opt) => (
                                    <Badge
                                        key={opt.id}
                                        variant='secondary'
                                        className='border border-primary/20 bg-primary/10 px-2 py-0.5 font-normal text-primary text-xs'>
                                        {opt.label}
                                    </Badge>
                                ))}
                                {selectedLabels.length > maxDisplayBadges && (
                                    <Badge variant='outline' className='px-1.5 py-0.5 font-semibold text-xs'>
                                        +{selectedLabels.length - maxDisplayBadges} more
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>

                    <div className='ml-2 flex shrink-0 items-center gap-1'>
                        {selectedIds.length > 0 && (
                            <span
                                role='button'
                                tabIndex={0}
                                onClick={handleClearAll}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onChange([]);
                                    }
                                }}
                                className='cursor-pointer rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'>
                                <X className='h-3.5 w-3.5' />
                            </span>
                        )}
                        <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className='w-[320px] border p-0 shadow-lg' align='start'>
                <div className='space-y-2 border-b bg-muted/40 p-2'>
                    <div className='flex items-center justify-between px-1 font-medium text-muted-foreground text-xs'>
                        <span>{title}</span>
                        <span>
                            {selectedIds.length} / {options.length} Selected
                        </span>
                    </div>
                    <div className='relative'>
                        <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                        <Input
                            placeholder='Search here...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='h-8 pl-8 text-xs'
                        />
                    </div>
                    <div className='flex items-center justify-between pt-1'>
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={handleSelectAll}
                            className='h-7 px-2 font-medium text-primary text-xs hover:text-primary'>
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                        {selectedIds.length > 0 && (
                            <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => onChange([])}
                                className='h-7 px-2 text-destructive text-xs hover:text-destructive'>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className='h-[200px] p-2'>
                    {filteredOptions.length === 0 ? (
                        <div className='py-6 text-center text-muted-foreground text-xs'>No results found.</div>
                    ) : (
                        <div className='space-y-1'>
                            {filteredOptions.map((option) => {
                                const isChecked = selectedIds.includes(option.id);
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleToggle(option.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleToggle(option.id);
                                            }
                                        }}
                                        role='checkbox'
                                        aria-checked={isChecked}
                                        tabIndex={0}
                                        className={cn(
                                            'flex cursor-pointer select-none items-center space-x-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                                            isChecked ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-muted'
                                        )}>
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={() => handleToggle(option.id)}
                                            className='pointer-events-none'
                                        />
                                        <Label className='pointer-events-none flex-1 cursor-pointer truncate'>{option.label}</Label>
                                        {isChecked && <Check className='h-3.5 w-3.5 shrink-0 text-primary' />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
