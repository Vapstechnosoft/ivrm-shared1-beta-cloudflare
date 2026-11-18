'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { getAvailablePages } from '@/server/super-admin/super-admin-module/general-setting/page-mapping';
import type { IPageMappingData } from '@/types/super-admin/super-admin-module/general-setting/page-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePageMapping } from './mapping-context';
import { PageNumberPagination } from './page-number-pagination';

export default function AvailableGrid() {
    const { selectedModuleId, addToCart, cartPages, removeFromCart } = usePageMapping();
    const [data, setData] = useState<IPageMappingData[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const debouncedSearch = useDebounce(searchTerm, 400);

    const fetchData = useCallback(async () => {
        if (!selectedModuleId) {
            setData([]);
            setTotalItems(0);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const searchParams = {
                ivrmM_Id: selectedModuleId,
                page,
                page_size: pageSize,
                search_query: debouncedSearch
            };
            const res = await getAvailablePages(searchParams);
            if (res.success) {
                setData(res.data || []);
                setTotalItems(res.total || 0);
            } else {
                setData([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Failed to fetch master pages', error);
            setData([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    }, [selectedModuleId, page, pageSize, debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [selectedModuleId, debouncedSearch]);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const handleToggle = (pageItem: IPageMappingData, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            addToCart([pageItem]);
        } else {
            removeFromCart([pageItem.ivrmP_Id]);
        }
    };

    const isChecked = (id: number) => {
        return cartPages.some((p) => p.ivrmP_Id === id);
    };

    const columns = useMemo<ColumnDef<IPageMappingData>[]>(
        () => [
            {
                accessorKey: 'serialNumber',
                header: 'SL.NO',
                cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
                enableSorting: false
            },
            {
                accessorKey: 'ivrmP_PageName',
                header: 'Page Name',
                enableSorting: true
            },
            {
                id: 'actions',
                header: 'Select',
                cell: ({ row }) => {
                    const checked = isChecked(row.original.ivrmP_Id);
                    return (
                        <div className='flex justify-center'>
                            <Checkbox
                                checked={checked}
                                onCheckedChange={(checked) => handleToggle(row.original, checked)}
                                aria-label='Select row'
                            />
                        </div>
                    );
                },
                enableSorting: false
            }
        ],
        [cartPages, page, pageSize]
    );

    if (!selectedModuleId) return null;

    return (
        <div className='flex h-full flex-col rounded-md border bg-white shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 p-3'>
                <h3 className='font-semibold text-lg text-slate-800'>Master Pages</h3>
                <div className='relative w-64'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                    <Input
                        placeholder='Search master pages...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='h-9 rounded-md border-slate-200 bg-white pr-8 pl-9 text-sm focus:ring-1 focus:ring-blue-500'
                    />
                    {searchTerm && (
                        <button
                            type='button'
                            onClick={() => setSearchTerm('')}
                            className='-translate-y-1/2 absolute top-1/2 right-2.5 text-slate-400 hover:text-slate-600'>
                            <X className='h-4 w-4' />
                        </button>
                    )}
                </div>
            </div>

            <div className='flex-1 overflow-auto p-2'>
                <GenericDataTable
                    data={data}
                    columns={columns}
                    isLoading={isLoading}
                    isSearchRequired={false}
                    isPaginationRequired={false}
                    totalItems={totalItems}
                />
            </div>

            {totalItems > 0 && (
                <div className='flex flex-wrap items-center justify-between gap-2 border-t bg-slate-50/50 px-4 py-2.5 text-slate-600 text-sm'>
                    <div>
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1.5'>
                            <span className='text-slate-500 text-xs'>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className='h-8 rounded border border-slate-200 bg-white px-2 font-medium text-slate-700 text-xs shadow-sm'>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <PageNumberPagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                </div>
            )}
        </div>
    );
}
