'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

export interface CustomTableColumn<T> {
    header: ReactNode;
    cell: (item: T, index: number, currentPage: number, itemsPerPage: number) => ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface CustomPaginationTableProps<T> {
    data: T[];
    columns: CustomTableColumn<T>[];
    searchKeys: (keyof T)[];
    idKey: keyof T;
    selectedIds: Set<any>;
    onSelect: (id: any, checked: boolean) => void;
    onSelectAll: (checked: boolean, ids: any[]) => void;
    itemsPerPage?: number;
    searchPlaceholder?: string;
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

export function CustomPaginationTable<T>({
    data,
    columns,
    searchKeys,
    idKey,
    selectedIds,
    onSelect,
    onSelectAll,
    itemsPerPage = 5,
    searchPlaceholder = 'Search...'
}: CustomPaginationTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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
    const isAllSelected = filteredData.length > 0 && filteredData.every((item) => selectedIds.has(item[idKey]));

    const isSomeSelected = filteredData.length > 0 && !isAllSelected && filteredData.some((item) => selectedIds.has(item[idKey]));

    const handleSelectAll = (checked: boolean) => {
        // Pass the currently filtered IDs so the parent knows which ones to select/deselect
        onSelectAll(
            checked,
            filteredData.map((item) => item[idKey])
        );
    };

    return (
        <div className='w-full space-y-4'>
            <div className='flex items-center justify-between'>
                <div className='font-medium text-foreground text-sm'>Items ({filteredData.length} total)</div>
                {searchKeys.length > 0 && (
                    <div className='relative w-64'>
                        <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={searchPlaceholder}
                            className='pl-8'
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                )}
            </div>

            <div className='overflow-hidden rounded-md border'>
                <div className='max-h-[300px] overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead className='sticky top-0 z-10 bg-muted/50'>
                            <tr className='border-b'>
                                <th className='w-12 p-3 text-left'>
                                    <Checkbox
                                        checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                                        onCheckedChange={(value) => handleSelectAll(!!value)}
                                        aria-label='Select all'
                                    />
                                </th>
                                {columns.map((col, index) => (
                                    <th key={index} className={`p-3 text-left font-medium ${col.headerClassName || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className='h-24 text-center text-muted-foreground'>
                                        No Results Found For Selected Criteria
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr key={String(item[idKey])} className='border-b transition-colors hover:bg-muted/50'>
                                        <td className='px-3 py-2'>
                                            <Checkbox
                                                checked={selectedIds.has(item[idKey])}
                                                onCheckedChange={(value) => onSelect(item[idKey], !!value)}
                                                aria-label={`Select item`}
                                            />
                                        </td>
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className={`px-3 ${col.className || ''}`}>
                                                {col.cell(item, index, currentPage, itemsPerPage)}
                                            </td>
                                        ))}
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
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className='p-1 text-gray-400 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'>
                        <ChevronsLeft className='h-4 w-4' />
                    </button>
                    <button
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
                                onClick={() => setCurrentPage(pageNum as number)}
                                className={`flex h-8 min-w-[32px] items-center justify-center rounded-full font-medium text-sm transition-all ${
                                    currentPage === pageNum
                                        ? 'bg-[#E05C2B] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}>
                                {pageNum}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className='ml-2 p-1 text-gray-400 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'>
                        <ChevronRight className='h-4 w-4' />
                    </button>
                    <button
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
