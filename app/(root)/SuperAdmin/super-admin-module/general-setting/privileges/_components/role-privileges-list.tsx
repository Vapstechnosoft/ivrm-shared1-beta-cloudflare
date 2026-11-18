'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import type { IRolePrivilegeMapping } from '@/types/super-admin/super-admin-module/general-setting/privileges';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import React from 'react';

interface RolePrivilegesListProps {
    data: IRolePrivilegeMapping[];
    onDelete?: (item: IRolePrivilegeMapping) => void;
    isLoading?: boolean;
    totalItems?: number;
    pagination?: {
        pageIndex: number;
        pageSize: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (size: number) => void;
    };
    searchValue?: string;
    onSearch?: (value: string) => void;
}

export function RolePrivilegesList({
    data,
    onDelete,
    isLoading = true,
    totalItems,
    pagination = { pageIndex: 1, pageSize: 10, onPageChange: () => {}, onPageSizeChange: () => {} },
    searchValue = '',
    onSearch
}: RolePrivilegesListProps) {
    const [searchTerm, setSearchTerm] = React.useState(searchValue);

    React.useEffect(() => {
        setSearchTerm(searchValue);
    }, [searchValue]);

    const columns: ColumnDef<IRolePrivilegeMapping>[] = [
        {
            id: 'serialNumber',
            header: 'SL.NO',
            cell: ({ row }) => {
                const pageIndex = pagination?.pageIndex || 1;
                const pageSize = pagination?.pageSize || 10;
                return <div>{(pageIndex - 1) * pageSize + row.index + 1}</div>;
            }
        },
        {
            accessorKey: 'ivrmrT_Role',
            header: 'Role Name'
        },
        {
            accessorKey: 'ivrmM_ModuleName',
            header: 'Module Page'
        },
        {
            accessorKey: 'ivrmmP_PageName',
            header: 'Page Name'
        },
        {
            id: 'actions',
            header: 'Delete',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-red-500 hover:bg-red-50 hover:text-red-700'
                        onClick={() => onDelete?.(item)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                );
            }
        }
    ];

    if (!data && !isLoading) return null;

    return (
        <div className='mb-4 rounded-md border bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='font-semibold'>Rolewise Module Page list</h3>
                <div className='w-64'>
                    <InputText
                        placeholder='Search here...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            onSearch?.(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className='p-4'>
                <GenericDataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    totalItems={totalItems}
                    isSearchRequired={false}
                    isPaginationRequired={true}
                    onPageChange={pagination?.onPageChange}
                />
            </div>
        </div>
    );
}
