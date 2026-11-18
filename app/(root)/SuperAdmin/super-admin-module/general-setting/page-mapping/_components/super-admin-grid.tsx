'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import type { IPageMappingData } from '@/types/super-admin/super-admin-module/general-setting/page-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { SaveIcon, Search, Trash2, X, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { usePageMapping } from './mapping-context';
import { PageNumberPagination } from './page-number-pagination';

export default function SuperAdminGrid() {
    const { selectedModuleId, cartPages, removeFromCart, saveCart, clearCart } = usePageMapping();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return cartPages;
        const q = searchTerm.toLowerCase().trim();
        return cartPages.filter(
            (item) => item.ivrmP_PageName?.toLowerCase().includes(q) || item.ivrmP_PageDisplayName?.toLowerCase().includes(q)
        );
    }, [cartPages, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, page, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(Math.max(1, totalPages));
        }
    }, [totalPages, page]);

    const handleRemove = (record: IPageMappingData) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete record????',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel!!!!!!'
        }).then((result) => {
            if (result.isConfirmed) {
                removeFromCart([record.ivrmP_Id]);
                Swal.fire('Row as been removed from list Successfully');
            } else {
                Swal.fire('Record Deletion Cancelled');
            }
        });
    };

    const columns = useMemo<ColumnDef<IPageMappingData>[]>(
        () => [
            {
                accessorKey: 'slno',
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
                id: 'remove',
                header: 'Remove',
                cell: ({ row }) => {
                    return (
                        <div className='flex justify-center'>
                            <button
                                type='button'
                                onClick={() => handleRemove(row.original)}
                                className='text-red-500 hover:text-red-700'
                                title='Remove'>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                }
            }
        ],
        [page, pageSize]
    );

    if (!selectedModuleId) return null;

    return (
        <div className='flex h-full flex-col rounded-md border bg-white shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 p-3'>
                <h3 className='font-semibold text-lg text-slate-800'>Saved Master Page Mapping List</h3>
                <div className='relative w-64'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                    <Input
                        placeholder='Search saved list...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className='h-9 rounded-md border-slate-200 bg-white pr-8 pl-9 text-sm focus:ring-1 focus:ring-blue-500'
                    />
                    {searchTerm && (
                        <button
                            type='button'
                            onClick={() => {
                                setSearchTerm('');
                                setPage(1);
                            }}
                            className='-translate-y-1/2 absolute top-1/2 right-2.5 text-slate-400 hover:text-slate-600'>
                            <X className='h-4 w-4' />
                        </button>
                    )}
                </div>
            </div>

            <div className='flex-1 overflow-auto p-2'>
                <GenericDataTable
                    data={paginatedData}
                    columns={columns}
                    isLoading={false}
                    isSearchRequired={false}
                    isPaginationRequired={false}
                    totalItems={filteredData.length}
                />
            </div>

            {filteredData.length > 0 && (
                <div className='flex flex-wrap items-center justify-between gap-2 border-t bg-slate-50/50 px-4 py-2.5 text-slate-600 text-sm'>
                    <div>
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length}{' '}
                        entries
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

            <div className='flex justify-center gap-4 border-t bg-gray-50 p-4'>
                <Button onClick={saveCart} disabled={cartPages.length === 0} className='bg-blue-600 hover:bg-blue-700'>
                    <SaveIcon className='mr-2 h-4 w-4' />
                    Save
                </Button>
                <Button variant='destructive' onClick={clearCart} disabled={cartPages.length === 0}>
                    <XIcon className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
