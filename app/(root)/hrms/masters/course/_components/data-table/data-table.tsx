'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCommonPinningStyles, tableSearchVariables } from '@/lib/data-table.config';
import { cn } from '@/lib/utils';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnPinningState,
    type PaginationState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon, RotateCcw } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';
import { DataTableToolbar } from './data-table-toolbar';

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 200,
    ...props
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    return <Input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalItems: number;
    pageSizeOptions?: number[];
    isLoading?: boolean;
    showExportOptions?: boolean;
    showViewOptions?: boolean;
    columnPinning?: ColumnPinningState | undefined;
    isSearchRequired?: boolean;
    isPaginationRequired?: boolean;
    maxSelectableRows?: number;
    onRowSelectionChange?: (selectedRows: TData[]) => void;
    showSearchColumns?: boolean;
    scrollable?: boolean;
    maxHeight?: string;
    getRowId?: (originalRow: TData, index: number) => string;
    showPaginationInfo?: boolean;
    showRowsPerPage?: boolean;
}

export interface DataTableRef {
    resetSelection: () => void;
}

function DataTableInner<TData, TValue>(
    {
        columns,
        data,
        totalItems,
        pageSizeOptions = [10, 20, 30, 40, 50],
        isLoading,
        showExportOptions = false,
        showViewOptions = true,
        columnPinning,
        isSearchRequired = true,
        isPaginationRequired = true,
        maxSelectableRows = 0,
        onRowSelectionChange,
        showSearchColumns = false,
        scrollable = false,
        maxHeight = '600px',
        getRowId,
        showPaginationInfo = true,
        showRowsPerPage = true
    }: DataTableProps<TData, TValue>,
    ref: React.Ref<DataTableRef>
) {
    // Pagination state
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false, history: 'push' }).withDefault(10)
    );

    // Sorting and filtering
    const [sortBy, setSortBy] = useQueryState(
        tableSearchVariables.sort_column,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [order, setOrder] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsStringLiteral(['asc', 'desc'] as const)
            .withOptions({ shallow: false })
            .withDefault('asc')
    );
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const currentSorting = sortBy ? [{ id: sortBy, desc: order === 'desc' }] : [];

    const onSortingChange = (updaterOrValue: any) => {
        const newSortingState = typeof updaterOrValue === 'function' ? updaterOrValue(currentSorting) : updaterOrValue;

        const hasChanged = JSON.stringify(newSortingState) !== JSON.stringify(currentSorting);
        if (!hasChanged) {
            return;
        }

        if (newSortingState && newSortingState.length > 0) {
            setSortBy(newSortingState[0].id);
            setOrder(newSortingState[0].desc ? 'desc' : 'asc');
        } else {
            setSortBy(null);
            setOrder(null);
        }
        setCurrentPage(1); // Reset to first page on sort
    };

    // Generate a unique key for this table instance based on current page/filters
    const tableStateKey = `table_selection_${currentPage}_${pageSize}_${sortBy}_${order}_${searchQuery}`;

    // Initialize from ref to preserve across re-renders
    const rowSelectionRef = useRef<Record<string, boolean>>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(() => rowSelectionRef.current);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // Update ref whenever selection changes
    useEffect(() => {
        rowSelectionRef.current = rowSelection;
    }, [rowSelection]);

    const paginationState = { pageIndex: currentPage - 1, pageSize };
    // TanStack Table handles slicing for client-side pagination,
    // but we still want to show the correct page count based on the data length.
    const effectiveTotal = data.length;
    const pageCount = Math.max(1, Math.ceil(effectiveTotal / pageSize));

    const handlePaginationChange = (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
        const pagination = typeof updaterOrValue === 'function' ? updaterOrValue(paginationState) : updaterOrValue;

        if (effectiveTotal === 0) {
            return;
        }

        if (pagination.pageIndex === paginationState.pageIndex && pagination.pageSize === paginationState.pageSize) {
            return;
        }

        setCurrentPage(pagination.pageIndex + 1);
        setPageSize(pagination.pageSize);

        setRowSelection({});
        rowSelectionRef.current = {};
        if (typeof onRowSelectionChange === 'function') {
            onRowSelectionChange([]);
        }
    };

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: paginationState,
            sorting: currentSorting,
            globalFilter: searchQuery,
            rowSelection,
            columnFilters
        },
        onPaginationChange: handlePaginationChange,
        onSortingChange: onSortingChange,
        onColumnFiltersChange: setColumnFilters,

        // ✅ UPDATE THIS HANDLER
        onRowSelectionChange: (newSelection) => {
            const selectionObj = typeof newSelection === 'function' ? newSelection(rowSelection) : newSelection;
            const selectedCount = Object.keys(selectionObj).length;

            if (maxSelectableRows && selectedCount > maxSelectableRows) {
                toast.error(`You can select up to ${maxSelectableRows} rows only.`);
                return;
            }

            // Update both state and ref
            setRowSelection(selectionObj);
            rowSelectionRef.current = selectionObj;

            const selectedRows = table
                .getFilteredRowModel()
                .rows.filter((r) => selectionObj[r.id])
                .map((r) => r.original);

            if (typeof onRowSelectionChange === 'function') {
                onRowSelectionChange(selectedRows);
            }
        },

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: false,
        manualSorting: false,
        manualFiltering: false,
        initialState: {
            columnPinning: columnPinning || { right: ['actions'] }
        }
    });

    // Add this right after useReactTable:
    useImperativeHandle(ref, () => ({
        resetSelection: () => {
            setRowSelection({});
            // ✅ ADD THIS LINE
            rowSelectionRef.current = {};
            if (typeof onRowSelectionChange === 'function') {
                onRowSelectionChange([]);
            }
        }
    }));

    return (
        <div className='w-full space-y-2.5 overflow-auto'>
            {/* Toolbar */}
            {isSearchRequired && (
                <DataTableToolbar
                    table={table}
                    data={data}
                    showExportOptions={showExportOptions}
                    showViewOptions={showViewOptions}
                    columns={columns}
                    showSearchColumns={showSearchColumns}
                />
            )}

            {/* Table Content */}
            {isLoading ? (
                // <DataTableSkeleton columnCount={5} rowCount={5} showPagination showViewOptions={false} />
                <div className='flex h-[120px] w-full flex-col items-center justify-center rounded-md border bg-muted/10'>
                    <RotateCcw className='h-8 w-8 animate-spin text-primary' />
                    <p className='mt-3 text-muted-foreground text-sm'>Loading employee list...</p>
                </div>
            ) : (
                <>
                    <div
                        className='overflow-hidden rounded-md border'
                        style={
                            scrollable
                                ? {
                                      maxHeight: maxHeight,
                                      overflowY: 'auto',
                                      position: 'relative'
                                  }
                                : undefined
                        }>
                        <Table>
                            <TableHeader className='grid-header-row'>
                                <TableRow className='border-b-0 bg-white hover:bg-transparent'>
                                    {table.getHeaderGroups()[0].headers.map((header) => {
                                        const columnId = header.column.id;
                                        const canFilter = header.column.getCanFilter() && columnId !== 'slNo' && columnId !== 'actions';
                                        const title = (header.column.columnDef.meta as any)?.title || columnId;

                                        const disableSearch = (header.column.columnDef.meta as any)?.disableSearch === true;

                                        return (
                                            <TableHead
                                                key={`filter-${header.id}`}
                                                className='border-r p-2 align-bottom last:border-r-0'
                                                style={{ ...getCommonPinningStyles({ column: header.column }) }}>
                                                {canFilter ? (
                                                    <div
                                                        className={`overflow-hidden border bg-white ${disableSearch ? 'border-gray-200' : 'border-gray-400'}`}>
                                                        <DebouncedInput
                                                            placeholder={`Search ${title}`}
                                                            value={(header.column.getFilterValue() ?? '') as string}
                                                            onChange={(value) => header.column.setFilterValue(value)}
                                                            disabled={disableSearch}
                                                            className='h-8 rounded-none border-none px-2 font-normal text-[13px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50'
                                                        />
                                                    </div>
                                                ) : null}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className=' hover:bg-transparent'>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className='grid-header-cell top-0 z-10'
                                                style={{
                                                    ...getCommonPinningStyles({ column: header.column })
                                                }}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>

                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected()}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className='whitespace-nowrap'
                                                    style={{
                                                        ...getCommonPinningStyles({ column: cell.column })
                                                    }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                                            <div className='flex flex-col items-center justify-center space-y-2'>
                                                <p className='font-medium text-muted-foreground'>
                                                    {searchQuery ? `No results found for "${searchQuery}"` : 'No results.'}
                                                </p>
                                                {searchQuery && (
                                                    <p className='text-muted-foreground text-sm'>Try adjusting your search or filters</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {isPaginationRequired && (
                        <div className='flex flex-col gap-2.5'>
                            <div className='flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8'>
                                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                                    <div className='flex-1 whitespace-nowrap text-muted-foreground text-sm'>
                                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
                                        row(s) selected.
                                    </div>
                                ) : (
                                    showPaginationInfo && (
                                        <div className='pagination-info'>
                                            {effectiveTotal > 0 ? (
                                                <>
                                                    Showing{' '}
                                                    <span className='pagination-number'>
                                                        {paginationState.pageIndex * paginationState.pageSize + 1}
                                                    </span>
                                                    to{' '}
                                                    <span className='pagination-number'>
                                                        {Math.min(
                                                            (paginationState.pageIndex + 1) * paginationState.pageSize,
                                                            effectiveTotal
                                                        )}
                                                    </span>
                                                    of <span className='pagination-number'>{effectiveTotal}</span> entries
                                                </>
                                            ) : (
                                                'No entries found'
                                            )}
                                        </div>
                                    )
                                )}

                                {/* Rows per page */}
                                {showRowsPerPage && (
                                    <div className='pagination-size-container'>
                                        <p className='whitespace-nowrap font-semibold text-[11px] text-slate-500 uppercase tracking-wider'>
                                            Rows per page
                                        </p>
                                        <Select
                                            value={`${paginationState.pageSize}`}
                                            onValueChange={(value) => {
                                                table.setPageSize(Number(value));
                                            }}
                                            searchable={false}>
                                            <SelectTrigger className='h-7 w-[70px] rounded-full border-none bg-white/50 shadow-none focus:ring-0'>
                                                <SelectValue placeholder={paginationState.pageSize} />
                                            </SelectTrigger>
                                            <SelectContent side='top' className='rounded-xl border-slate-100 shadow-xl'>
                                                {pageSizeOptions.map((pageSize) => (
                                                    <SelectItem key={pageSize} value={`${pageSize}`} className='rounded-lg'>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                <div className='flex items-center space-x-2'>
                                    <div className='pagination-bar'>
                                        <Button
                                            aria-label='Go to first page'
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 rounded-full p-0'
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}>
                                            <DoubleArrowLeftIcon className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            aria-label='Go to previous page'
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 rounded-full p-0'
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}>
                                            <ChevronLeftIcon className='h-4 w-4' />
                                        </Button>

                                        {(() => {
                                            const currentPage = table.getState().pagination.pageIndex + 1;
                                            const totalPages = table.getPageCount();

                                            if (totalPages <= 1) return null;

                                            const getRange = () => {
                                                if (totalPages <= 7) {
                                                    return Array.from({ length: totalPages }, (_, i) => i + 1);
                                                }

                                                // Complex range logic
                                                if (currentPage <= 3) {
                                                    return [1, 2, 3, 4, '...', totalPages - 2, totalPages - 1, totalPages];
                                                } else if (currentPage >= totalPages - 2) {
                                                    return [1, 2, 3, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                                                } else {
                                                    return [
                                                        1,
                                                        2,
                                                        '...',
                                                        currentPage - 1,
                                                        currentPage,
                                                        currentPage + 1,
                                                        '...',
                                                        totalPages - 1,
                                                        totalPages
                                                    ];
                                                }
                                            };

                                            return getRange().map((page, i) => {
                                                if (page === '...') {
                                                    return (
                                                        <span key={`dots-${i}`} className='px-2 text-slate-400'>
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                const pageNum = page as number;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        type='button'
                                                        onClick={() => table.setPageIndex(pageNum - 1)}
                                                        className={cn(
                                                            'pagination-item',
                                                            currentPage === pageNum && 'pagination-item-active'
                                                        )}>
                                                        {pageNum}
                                                    </button>
                                                );
                                            });
                                        })()}

                                        <Button
                                            aria-label='Go to next page'
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 rounded-full p-0'
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}>
                                            <ChevronRightIcon className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            aria-label='Go to last page'
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 rounded-full p-0'
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            disabled={!table.getCanNextPage()}>
                                            <DoubleArrowRightIcon className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
export const DataTable = forwardRef(DataTableInner) as <TData, TValue>(
    props: DataTableProps<TData, TValue> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;
