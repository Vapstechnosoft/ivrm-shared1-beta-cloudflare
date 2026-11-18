'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

/**
 * Returns the column definitions for the Schedule Report data table.
 */
export const getScheduleReportColumns = (): ColumnDef<IScheduleReportList>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        id: 'sno',
        header: () => <div className='font-bold text-black uppercase'>SL.NO</div>,
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'name',
        header: () => <div className='font-bold text-black uppercase'>Name</div>
    },
    {
        accessorKey: 'regno',
        header: () => <div className='font-bold text-black uppercase'>RegNo</div>
    },
    {
        accessorKey: 'class',
        header: () => <div className='font-bold text-black uppercase'>Class</div>
    },
    {
        accessorKey: 'gender',
        header: () => <div className='font-bold text-black uppercase'>Gender</div>
    },
    {
        id: 'scheduledate',
        header: () => <div className='font-bold text-black uppercase'>Schedule Date</div>,
        accessorFn: (row) => row.ScheduleDate || row.scheduledate,
        cell: ({ getValue }) => {
            const date = getValue() as string;
            if (!date) return 'N/A';
            try {
                return format(new Date(date), 'dd-MM-yyyy');
            } catch (e) {
                return date;
            }
        }
    },
    {
        id: 'scheduletime',
        header: () => <div className='font-bold text-black uppercase'>From</div>,
        accessorFn: (row) => row.ScheduleTime || row.scheduletime,
        cell: ({ getValue }) => (getValue() as string) || 'N/A'
    },
    {
        id: 'scheduletimeto',
        header: () => <div className='font-bold text-black uppercase'>To</div>,
        accessorFn: (row) => row.ScheduleTimeTo || row.scheduletimeto,
        cell: ({ getValue }) => (getValue() as string) || 'N/A'
    },
    {
        id: 'remarks',
        header: () => <div className='font-bold text-black uppercase'>Remarks</div>,
        accessorFn: (row) => row.PAOTS_Remarks || row.remarks,
        cell: ({ getValue }) => (getValue() as string) || ''
    }
];
