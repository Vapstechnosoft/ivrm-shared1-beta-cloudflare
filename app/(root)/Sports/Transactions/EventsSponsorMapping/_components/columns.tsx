'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useEventsSponsor } from '@/hooks/sports/useEventsSponsor';
import type { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IEventSponsorMapping> }) {
    const mapping = row.original;
    const { deactivateMutation } = useEventsSponsor();
    const { openEditForm } = useFormContext<IEventSponsorMapping>();

    return (
        <ActionButtons
            rowData={mapping}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(mapping)}
            onToggle={async () => {
                await deactivateMutation.mutateAsync({
                    spccesP_Id: mapping.spccesP_Id,
                    spccesP_ActiveFlag: !mapping.spccesP_ActiveFlag
                });
            }}
            toggleConditionKey='spccesP_ActiveFlag'
        />
    );
}

export const eventSponsorColumns: ColumnDef<IEventSponsorMapping>[] = [
    {
        accessorKey: 'spccesP_Id',
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
        accessorKey: 'spccpM_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Program Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccpM_Name')}</div>
    },
    {
        accessorKey: 'sponsorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sponsor Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('sponsorName')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
