'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table.config';
import { cn } from '@/lib/utils';
import type { ApiSearchparams } from '@/types';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import {
    type ColumnDef,
    type ColumnPinningState,
    type PaginationState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DataTableSkeleton } from './view-data-table-skeleton';
import { DataTableToolbar } from './view-data-table-toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalItems: number;
    pageSizeOptions?: number[];
    isLoading?: boolean;
    showExportOptions?: boolean;
    showViewOptions?: boolean;
    showPagination?: boolean;
    showSearch?: boolean;
    showSorting?: boolean;
    columnPinning?: ColumnPinningState | undefined;
    onSearchQueryChange?: (value: ApiSearchparams) => void;
    maxSelectableRows?: number;
    defaultSelectedRowIds?: string[];
    onRowSelectionChange?: (selectedRows: TData[]) => void;
    currentApiParams?: ApiSearchparams;
    getRowId?: (originalRow: TData, index: number) => string;
}

export interface DataTableRef {
    resetSelection: () => void;
}

function DataTableInner<TData, TValue>(props: DataTableProps<TData, TValue>, ref: React.Ref<DataTableRef>) {
    const {
        columns,
        data,
        totalItems,
        pageSizeOptions = [10, 20, 30, 40, 50, 60],
        isLoading,
        showExportOptions = false,
        showViewOptions = true,
        showPagination = false,
        showSearch,
        showSorting = false,
        columnPinning,
        maxSelectableRows = 0,
        defaultSelectedRowIds,
        onRowSelectionChange,
        onSearchQueryChange,
        currentApiParams,
        getRowId
    } = props;

    const { page = 1, page_size = 10, search_query = '', sort_column = '', sort_direction = 'desc' } = currentApiParams || {};

    // Initialize states
    const [currentPage, setCurrentPage] = useState<number>(page);
    const [pageSize, setPageSize] = useState<number>(page_size);
    const [localSearchQuery, setLocalSearchQuery] = useState<string>(search_query);
    const [sortBy, setSortBy] = useState<string>(sort_column);
    const [order, setOrder] = useState<'asc' | 'desc'>(sort_direction as 'asc' | 'desc');

    const [searchQuery, setSearchQuery] = useState('');

    // ---------------------------
    // 🔄 Row Selection
    // ---------------------------
    const rowSelectionRef = useRef<Record<string, boolean>>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(() => rowSelectionRef.current);
    useEffect(() => {
        if (!Array.isArray(defaultSelectedRowIds)) return;

        setRowSelection((prev) => {
            const updated = { ...prev };

            // Update OR add
            defaultSelectedRowIds.forEach((id) => {
                updated[id] = true;
            });

            rowSelectionRef.current = updated;

            if (onRowSelectionChange) {
                const selectedRows = table
                    .getFilteredRowModel()
                    .rows.filter((r) => updated[r.id])
                    .map((r) => r.original);

                onRowSelectionChange(selectedRows);
            }

            return updated;
        });
    }, [defaultSelectedRowIds]);
    useEffect(() => {
        rowSelectionRef.current = rowSelection;
    }, [rowSelection]);

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
            setSortBy('');
            setOrder('desc');
        }
        setCurrentPage(1); // Reset to first page on sort
    };

    const paginationState = { pageIndex: currentPage - 1, pageSize };
    const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

    const handlePaginationChange = (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
        const pagination = typeof updaterOrValue === 'function' ? updaterOrValue(paginationState) : updaterOrValue;

        if (data.length === 0) {
            return;
        }

        if (pagination.pageIndex === paginationState.pageIndex && pagination.pageSize === paginationState.pageSize) {
            return;
        }

        setCurrentPage(pagination.pageIndex + 1);
        setPageSize(pagination.pageSize);
    };

    const table = useReactTable({
        data,
        columns,
        pageCount,
        getRowId,
        state: {
            pagination: paginationState,
            sorting: currentSorting,
            globalFilter: searchQuery,
            rowSelection
        },
        onPaginationChange: handlePaginationChange,
        onSortingChange: onSortingChange,

        onRowSelectionChange: (newSelection) => {
            const selectionObj = typeof newSelection === 'function' ? newSelection(rowSelection) : newSelection;

            const selectedCount = Object.keys(selectionObj).filter((k) => selectionObj[k]).length;

            if (maxSelectableRows && selectedCount > maxSelectableRows) {
                toast.error(`You can select up to ${maxSelectableRows} rows only.`);
                return;
            }

            setRowSelection(selectionObj);
            rowSelectionRef.current = selectionObj;

            const selectedRows = table
                .getCoreRowModel()
                .rows.filter((r) => selectionObj[r.id])
                .map((r) => r.original);

            onRowSelectionChange?.(selectedRows);
        },

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,

        initialState: {
            columnPinning: columnPinning || { right: ['actions'] }
        }
    });

    // Expose resetSelection()
    useImperativeHandle(ref, () => ({
        resetSelection: () => {
            setRowSelection({});
            rowSelectionRef.current = {};
            onRowSelectionChange?.([]);
        }
    }));

    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip calling API on first mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const params: ApiSearchparams = {
            page: currentPage,
            page_size: pageSize,
            search_query: localSearchQuery,
            sort_column: sortBy || '',
            sort_direction: order || '',
            search_columns: ''
        };

        onSearchQueryChange?.(params);
    }, [currentPage, pageSize, sortBy, order, localSearchQuery]);

    return (
        <div className='w-full space-y-2.5'>
            {/* Toolbar */}
            <DataTableToolbar
                table={table}
                data={data}
                showExportOptions={showExportOptions}
                showViewOptions={showViewOptions}
                showSearch={showSearch}
                showSorting={showSorting}
                currentSearchQuery={localSearchQuery}
                onSearchQueryChange={(value) => {
                    setLocalSearchQuery(value);
                    setSearchQuery(value);
                }}
            />

            {/* Table Content */}
            {isLoading ? (
                <DataTableSkeleton columnCount={5} rowCount={5} showPagination showViewOptions={false} />
            ) : (
                <>
                    {/* ---------- FIXED TABLE STRUCTURE ---------- */}
                    <div className='overflow-hidden rounded-md border'>
                        <div className='relative max-h-[520px] overflow-auto'>
                            {' '}
                            {/* SINGLE SCROLL CONTAINER */}
                            <Table className='min-w-full table-fixed border-separate border-spacing-0'>
                                {/* column widths stay the same for both header & body */}
                                <colgroup>
                                    {table.getAllLeafColumns().map((col) => (
                                        <col key={col.id} style={{ width: col.getSize() }} />
                                    ))}
                                </colgroup>

                                <TableHeader className='grid-header-row'>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className='border-none hover:bg-transparent'>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                    className='grid-header-cell sticky top-0 z-10'
                                                    style={getCommonPinningStyles({ column: header.column })} // 👈 pinning works here
                                                >
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
                                            <TableRow key={row.id} className='border-b'>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className='whitespace-nowrap border-b'
                                                        style={getCommonPinningStyles({ column: cell.column })} // 👈 NOW body pinning works
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                                                No results found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* ---------- PAGINATION ---------- */}
                    {showPagination && (
                        <div className='flex flex-col gap-2.5'>
                            <div className='flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8'>
                                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                                    <div className='flex-1 whitespace-nowrap text-muted-foreground text-sm'>
                                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
                                        row(s) selected.
                                    </div>
                                ) : (
                                    <div className='pagination-info'>
                                        {totalItems > 0 ? (
                                            <>
                                                Showing{' '}
                                                <span className='pagination-number'>
                                                    {paginationState.pageIndex * paginationState.pageSize + 1}
                                                </span>
                                                to{' '}
                                                <span className='pagination-number'>
                                                    {Math.min((paginationState.pageIndex + 1) * paginationState.pageSize, totalItems)}
                                                </span>
                                                of <span className='pagination-number'>{totalItems}</span> entries
                                            </>
                                        ) : (
                                            'No entries found'
                                        )}
                                    </div>
                                )}

                                {/* Rows per page */}
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
                            </div>

                            {/* Controls */}
                            <div className='flex items-center space-x-2'>
                                <div className='pagination-bar'>
                                    <Button
                                        aria-label='First page'
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 rounded-full p-0'
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}>
                                        <DoubleArrowLeftIcon className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        aria-label='Previous page'
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
                                                    onClick={() => table.setPageIndex(pageNum - 1)}
                                                    className={cn('pagination-item', currentPage === pageNum && 'pagination-item-active')}>
                                                    {pageNum}
                                                </button>
                                            );
                                        });
                                    })()}

                                    <Button
                                        aria-label='Next page'
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 rounded-full p-0'
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}>
                                        <ChevronRightIcon className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        aria-label='Last page'
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
                    )}
                </>
            )}
        </div>
    );
}

export const DataTable = forwardRef(DataTableInner) as <TData, TValue>(
    props: DataTableProps<TData, TValue> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;
