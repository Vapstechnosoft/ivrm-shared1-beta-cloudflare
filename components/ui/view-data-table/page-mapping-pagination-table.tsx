'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

export interface PageMappingTableColumn<T> {
    header: ReactNode;
    cell: (item: T, index: number, currentPage: number, itemsPerPage: number) => ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface PageMappingPaginationTableProps<T> {
    data: T[];
    columns: PageMappingTableColumn<T>[];
    searchKeys: (keyof T)[];
    idKey: keyof T;
    selectedIds?: Set<any>;
    onSelect?: (id: any, checked: boolean) => void;
    onSelectAll?: (checked: boolean, ids: any[]) => void;
    itemsPerPage?: number;
    searchPlaceholder?: string;
    selectionPosition?: 'start' | 'end';
    selectionHeader?: React.ReactNode;
    selectionHeaderLabel?: string;
    variant?: 'default' | 'web-grid';
    headerBgColor?: string;
}

function getPageNumbers(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export function PageMappingPaginationTable<T>({
    data,
    columns,
    searchKeys,
    idKey,
    selectedIds,
    onSelect,
    onSelectAll,
    itemsPerPage = 5,
    searchPlaceholder = 'Search...',
    selectionPosition = 'start',
    selectionHeader,
    selectionHeaderLabel,
    variant = 'default',
    headerBgColor = 'bg-purple-600'
}: PageMappingPaginationTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    // Filter data based on search term and keys
    const filteredData = useMemo(() => {
        if (!searchTerm.trim() || searchKeys.length === 0) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter((item) =>
            searchKeys.some((key) => {
                const val = item[key];
                return val && String(val).toLowerCase().includes(lowerSearch);
            })
        );
    }, [data, searchTerm, searchKeys]);

    // Calculate total pages
    const totalPages = Math.max(0, Math.ceil(filteredData.length / itemsPerPage));

    // Ensure current page is within bounds when search results change
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Determine Selection State for the *Filtered* view
    const isAllSelected = selectedIds && filteredData.length > 0 && filteredData.every((item) => selectedIds.has(item[idKey]));

    const isSomeSelected = selectedIds && filteredData.length > 0 && !isAllSelected && filteredData.some((item) => selectedIds.has(item[idKey]));

    const handleSelectAll = (checked: boolean) => {
        // Pass the currently filtered IDs so the parent knows which ones to select/deselect
        if (onSelectAll) {
            onSelectAll(
                checked,
                filteredData.map((item) => item[idKey])
            );
        }
    };

    const showSelection = !!(selectedIds && onSelect && onSelectAll);
    const isWebGrid = variant === 'web-grid';

    const renderSelectionHeader = () => {
        if (!showSelection) return null;
        return (
            <th
                className={`text-center align-middle ${isWebGrid ? 'border border-white px-2 py-1' : 'w-12 p-3'
                    }`}>
                {selectionHeader !== undefined ? (
                    selectionHeader
                ) : (
                    <div
                        className={`font-bold text-[10px] uppercase text-white ${isWebGrid ? 'flex items-center justify-center gap-1' : 'flex flex-col items-center justify-center gap-1'
                            }`}>
                        {selectionHeaderLabel && <span>{selectionHeaderLabel}</span>}
                        <Checkbox
                            checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                            onCheckedChange={(value) => handleSelectAll(!!value)}
                            aria-label='Select all'
                            className='bg-white'
                        />
                    </div>
                )}
            </th>
        );
    };

    const renderSelectionCell = (item: T) => {
        if (!showSelection || !selectedIds || !onSelect) return null;
        return (
            <td className={isWebGrid ? 'border border-[#c8d3df] px-2 py-1 text-center' : 'px-3 py-2 text-center'}>
                <Checkbox
                    checked={selectedIds.has(item[idKey])}
                    onCheckedChange={(value) => onSelect(item[idKey], !!value)}
                    aria-label={`Select item`}
                />
            </td>
        );
    };

    return (
        <div className='w-full space-y-2'>
            <div className={`flex items-center ${isWebGrid ? 'justify-end' : 'justify-between'}`}>
                {!isWebGrid && <div className='font-medium text-foreground text-sm'>Items ({filteredData.length} total)</div>}
                {searchKeys.length > 0 && (
                    <div className='relative w-64'>
                        <Search
                            className={`absolute left-2 ${isWebGrid ? 'top-1.5 h-4 w-4 text-blue-700' : 'top-2.5 h-4 w-4 text-muted-foreground'
                                }`}
                        />
                        <Input
                            placeholder={searchPlaceholder}
                            className={
                                isWebGrid
                                    ? 'h-7 border-blue-300 pl-8 text-xs placeholder:text-gray-400 focus-visible:ring-blue-500'
                                    : 'pl-8'
                            }
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                )}
            </div>

            <div className='overflow-hidden '>
                <div className='max-h-[350px] overflow-x-auto'>
                    <table className={`w-full text-sm ${isWebGrid ? 'border-collapse' : ''}`}>
                        <thead className={`sticky top-0 z-10 ${isWebGrid ? headerBgColor : 'bg-muted/50'}`}>
                            <tr className={isWebGrid ? 'border-b border-white' : 'border-b'}>
                                {selectionPosition === 'start' && renderSelectionHeader()}
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={`${isWebGrid
                                                ? 'border border-white px-2 py-1 text-center font-bold text-white'
                                                : 'p-3 text-left font-medium'
                                            } ${col.headerClassName || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                                {selectionPosition === 'end' && renderSelectionHeader()}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (showSelection ? 1 : 0)} className='h-24 text-center text-muted-foreground'>
                                        No Results Found For Selected Criteria
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={String(item[idKey])}
                                        className={
                                            isWebGrid
                                                ? `border-b border-[#c8d3df] transition-colors ${
                                                    headerBgColor.includes('green')
                                                        ? 'hover:bg-green-50/50'
                                                        : headerBgColor.includes('purple')
                                                        ? 'hover:bg-purple-50/50'
                                                        : headerBgColor.includes('orange')
                                                        ? 'hover:bg-orange-50/50'
                                                        : 'hover:bg-blue-50'
                                                }`
                                                : 'border-b transition-colors hover:bg-muted/50'
                                        }>
                                        {selectionPosition === 'start' && renderSelectionCell(item)}
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`${isWebGrid
                                                        ? 'border border-[#c8d3df] px-2 py-1 text-sm font-semibold'
                                                        : 'px-3'
                                                    } ${col.className || ''}`}>
                                                {col.cell(item, index, currentPage, itemsPerPage)}
                                            </td>
                                        ))}
                                        {selectionPosition === 'end' && renderSelectionCell(item)}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='mt-6 flex pb-2'>
                <div className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm'>
                    <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className='p-1 text-gray-400 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'>
                        <ChevronsLeft className='h-4 w-4' />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className='mr-2 p-1 text-gray-400 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'>
                        <ChevronLeft className='h-4 w-4' />
                    </button>

                    {getPageNumbers(currentPage, totalPages).map((pageNum, idx) =>
                        pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className='px-2 text-gray-400 text-sm tracking-widest'>
                                ...
                            </span>
                        ) : (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum as number)}
                                className={`flex h-8 min-w-[32px] items-center justify-center rounded-full font-medium text-sm transition-all ${currentPage === pageNum
                                        ? 'bg-[#E05C2B] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}>
                                {pageNum}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className='ml-2 p-1 text-gray-400 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'>
                        <ChevronRight className='h-4 w-4' />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className='p-1 text-gray-400 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'>
                        <ChevronsRight className='h-4 w-4' />
                    </button>
                </div>
            </div>
        </div>
    );
}
