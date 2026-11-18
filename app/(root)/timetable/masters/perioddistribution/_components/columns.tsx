'use client';
import type { PeriodDistributionColumn } from '@/types/timetable/masters/masters';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const createPeriodDistributionColumns: ColumnDef<PeriodDistributionColumn>[] = [
    {
        accessorKey: 'ttfpD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('staffName')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'ttfpD_TotWeekPeriods',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No Of Periods' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttfpD_TotWeekPeriods')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: PeriodDistributionColumn }) {
    const { openEditForm, openToggleForm, openDetailsView } = useFormContext<PeriodDistributionColumn>();

    const handleEdit = useCallback(
        (data: PeriodDistributionColumn) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: PeriodDistributionColumn) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    return (
        <div className='flex items-center gap-3'>
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
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='ttfpD_ActiveFlag'
            />
        </div>
    );
}
