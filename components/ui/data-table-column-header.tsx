import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from '@radix-ui/react-icons';
import type { Column } from '@tanstack/react-table';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect } from 'react';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
    // Manage sortBy and order in query state
    const [sortBy, setSortBy] = useQueryState('sort_column', parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order, setOrder] = useQueryState(
        'sort_direction',
        parseAsStringLiteral(['asc', 'desc'] as const)
            .withOptions({ shallow: false })
            .withDefault('asc')
    );

    // Initialize sorting from URL parameters on mount
    useEffect(() => {
        if (sortBy === column.id) {
            const currentIsDesc = column.getIsSorted() === 'desc';
            const expectedIsDesc = order === 'desc';
            if (column.getIsSorted() === false || currentIsDesc !== expectedIsDesc) {
                column.toggleSorting(expectedIsDesc);
            }
        }
    }, [column, sortBy, order]);

    // Check if column is sorted
    const isSortedAsc = column.getIsSorted() === 'asc';
    const isSortedDesc = column.getIsSorted() === 'desc';

    // Check if column can be sorted
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <Button
                aria-label={
                    isSortedDesc
                        ? 'Sorted descending. Click to sort ascending.'
                        : isSortedAsc
                          ? 'Sorted ascending. Click to sort descending.'
                          : 'Not sorted. Click to sort ascending.'
                }
                variant='ghost'
                size='sm'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='-ml-3 h-8 w-fit hover:bg-accent hover:text-accent-foreground'>
                <span>{title}</span>
                {column.getCanSort() && isSortedDesc ? (
                    <ArrowDownIcon className='ml-2 size-4' aria-hidden='true' />
                ) : isSortedAsc ? (
                    <ArrowUpIcon className='ml-2 size-4' aria-hidden='true' />
                ) : (
                    <CaretSortIcon className='ml-2 size-4' aria-hidden='true' />
                )}
            </Button>
        </div>
    );
}
