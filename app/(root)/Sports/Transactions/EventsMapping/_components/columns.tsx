'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useEventMapping } from '@/hooks/sports/useEventMapping';
import type { IEventsMappingData } from '@/types/sports/events-mapping';
import type { ColumnDef } from '@tanstack/react-table';

export const eventsMappingColumns: ColumnDef<IEventsMappingData>[] = [
    {
        id: 'SPCCE_Id',
        accessorKey: 'spccE_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
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
        id: 'ASMAY_Year',
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        enableSorting: true
    },
    {
        id: 'SPCCME_EventName',
        accessorKey: 'spccmE_EventName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event Name' />,
        enableSorting: true
    },
    {
        id: 'SPCCMEV_EventVenue',
        accessorKey: 'spccmeV_EventVenue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Venue Name' />,
        enableSorting: true
    },
    {
        id: 'SPCCE_StartDate',
        accessorKey: 'spccE_StartDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Start Date' />,
        cell: ({ row }) => {
            const date = row.original.spccE_StartDate;
            return date ? new Date(date).toLocaleDateString() : '';
        },
        enableSorting: true
    },
    {
        id: 'SPCCE_StartTime',
        accessorKey: 'spccE_StartTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Start Time' />,
        cell: ({ row }) => {
            return <div className='lowercase'>{row.original.spccE_StartTime}</div>;
        },
        enableSorting: true
    },
    {
        id: 'SPCCE_EndDate',
        accessorKey: 'spccE_EndDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='End Date' />,
        cell: ({ row }) => {
            const date = row.original.spccE_EndDate;
            return date ? new Date(date).toLocaleDateString() : '';
        },
        enableSorting: true
    },
    {
        id: 'SPCCE_EndTime',
        accessorKey: 'spccE_EndTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='End Time' />,
        cell: ({ row }) => {
            return <div className='lowercase'>{row.original.spccE_EndTime}</div>;
        },
        enableSorting: true
    },
    {
        id: 'SPCCE_Remarks',
        accessorKey: 'spccE_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            return <ActionsCell row={row.original} />;
        }
    }
];

const ActionsCell = ({ row }: { row: IEventsMappingData }) => {
    const { deactivate } = useEventMapping();
    const { openEditForm } = useFormContext<IEventsMappingData>();

    return (
        <ActionButtons
            rowData={row}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(row)}
            onToggle={(data) => {
                deactivate.mutate({ ASMAY_Id: data.asmaY_Id, SPCCE_Id: data.spccE_Id });
            }}
            toggleConditionKey='spccE_ActiveFlag'
        />
    );
};
