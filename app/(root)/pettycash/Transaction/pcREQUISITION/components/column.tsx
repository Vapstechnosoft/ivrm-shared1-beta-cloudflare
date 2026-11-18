'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDocumentViewData } from '@/server/pettycash/transaction/pcREQUISITION';
import type { IPcRequisition } from '@/types/pettycash/transaction/pcREQUISITION';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const pcRequisitionColumns: ColumnDef<IPcRequisition>[] = [
    {
        accessorKey: 'pcreqtN_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;

            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'pcreqtN_RequisitionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Requisition No' />,
        cell: ({ row }) => <div style={{ marginLeft: '-77px' }}>{row.getValue('pcreqtN_RequisitionNo')}</div>
    },
    {
        accessorKey: 'departmentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('departmentname')}</div>
    },
    {
        accessorKey: 'employeename',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Requested By' />,
        cell: ({ row }) => <div>{row.getValue('employeename')}</div>
    },
    {
        accessorKey: 'pcreqtN_CreatedDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Created Date' />,
        cell: ({ row }) => <div>{new Date(row.getValue('pcreqtN_CreatedDate')).toLocaleDateString()}</div>
    },
    {
        accessorKey: 'pcreqtN_Purpose',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Purpose' />,
        cell: ({ row }) => <div>{row.getValue('pcreqtN_Purpose')}</div>
    },
    {
        id: 'document',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Document' />,
        cell: ({ row }) => {
            const handleView = async () => {
                try {
                    const response = await getDocumentViewData(row.original.pcreqtN_Id);

                    if (response?.success) {
                        // handle your document view here
                        console.log('Document Data:', response.data);
                    } else {
                        console.error(response?.message);
                    }
                } catch (error) {
                    console.error('Error fetching document:', error);
                }
            };

            return (
                <div className='flex justify-center' style={{ marginLeft: '-77px' }}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleView()}
                                    className='h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600'>
                                    <Eye className='h-4 w-4' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Document</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        },
        enableSorting: false
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IPcRequisition }) {
    const { openDeleteForm, openEditForm, openToggleForm, openDetailsView } = useFormContext<IPcRequisition>();

    const handleDelete = useCallback((data: IPcRequisition) => openDeleteForm(data), [openDeleteForm]);
    const handleEdit = useCallback((data: IPcRequisition) => openEditForm(data), [openEditForm]);
    const handleToggle = useCallback((data: IPcRequisition) => openToggleForm(data), [openToggleForm]);

    const handleView = useCallback(() => {
        openDetailsView?.(rowData);
    }, [openDetailsView, rowData]);

    return (
        <div className='flex items-center justify-end gap-1 pr-2'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleView}
                            className='h-8 w-8 p-0 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600'>
                            <Eye className='h-4 w-4' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                toggleConditionKey='pcreqtN_ActiveFlg'
                onDelete={handleDelete}
                onToggle={handleToggle}
                onEdit={handleEdit}
            />
        </div>
    );
}
