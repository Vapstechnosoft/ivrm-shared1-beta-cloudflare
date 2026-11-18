'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSponsor } from '@/types/sports/masters/sponsors';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterSponsor> }) {
    const sponsor = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterSponsor>();

    return (
        <ActionButtons
            rowData={sponsor}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(sponsor)}
            onToggle={() => openToggleForm(sponsor)}
            toggleConditionKey='spccmsP_ActiveFlag'
        />
    );
}

export const MasterSponsorColumns: ColumnDef<IMasterSponsor>[] = [
    {
        accessorKey: 'spccmsP_Id',
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
        accessorKey: 'spccmsP_SponsorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sponsor Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmsP_SponsorName')}</div>
    },
    {
        accessorKey: 'spccmsP_ContactPerson',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Contact Person' />
    },
    {
        accessorKey: 'spccmsP_ContactNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Contact No.' />
    },
    {
        accessorKey: 'spccmsP_SponsorDetails',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sponsor Details' />,
        cell: ({ row }) => (
            <div className='max-w-[300px] truncate' title={row.getValue('spccmsP_SponsorDetails')}>
                {row.getValue('spccmsP_SponsorDetails')}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
