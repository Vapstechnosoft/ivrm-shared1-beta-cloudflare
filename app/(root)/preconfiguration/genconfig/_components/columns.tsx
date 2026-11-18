'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IGeneralConfiguration } from '@/types/preconfiguration/general-config';
import type { ColumnDef } from '@tanstack/react-table';
import { useConfigStore } from './genconfig-store';

export const columns: ColumnDef<IGeneralConfiguration>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No.' />,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false,
        size: 50
    },
    {
        accessorKey: 'instuitename',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Institute Name' />,
        cell: ({ row }) => <div>{row.getValue('instuitename')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const { openEditForm } = useFormContext<IGeneralConfiguration>();
            const { setEditId } = useConfigStore();

            return (
                <ActionButtons
                    rowData={row.original}
                    buttons={{ edit: true, toggle: false, delete: false }}
                    onEdit={(data) => {
                        setEditId((data as IGeneralConfiguration).ivrmgC_Id);
                        openEditForm(data as IGeneralConfiguration);
                    }}
                />
            );
        },
        size: 100
    }
];
