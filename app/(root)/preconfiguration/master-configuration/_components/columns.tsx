'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterConfiguration } from '@/types/preconfiguration/master-configuration';
import type { ColumnDef } from '@tanstack/react-table';

export const masterConfigurationColumns: ColumnDef<IMasterConfiguration>[] = [
    {
        id: 'serialNumber',
        header: 'SLNO',
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false,
        size: 50
    },
    {
        accessorKey: 'mO_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Trust' />,
        cell: ({ row }) => <div>{row.getValue('mO_Name')}</div>
    },
    {
        accessorKey: 'mI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Institute' />,
        cell: ({ row }) => <div>{row.getValue('mI_Name')}</div>
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'amC_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.original.amC_Name || row.original.amcoC_Name || '-'}</div>
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const { openEditForm } = useFormContext<IMasterConfiguration>();
            return (
                <ActionButtons
                    rowData={row.original}
                    buttons={{ edit: true, toggle: false, delete: false }}
                    onEdit={(data) => openEditForm(data as IMasterConfiguration)}
                />
            );
        },
        size: 100
    }
];
