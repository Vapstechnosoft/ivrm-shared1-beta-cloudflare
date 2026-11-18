'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ColumnDef } from '@tanstack/react-table';

export interface MasterLocation {
    hrmlO_Id: number;
    mi_Id: number; // institution ID from API response
    hrmlO_Institution: string;
    hrmlO_LocationName: string;
    hrmlO_LocationDesc: string;
    hrmlO_ActiveFlg: boolean;
    createdDate: string;
}

interface MasterLocationColumnsProps {
    onEdit: (row: MasterLocation) => void;
    onToggle?: (row: MasterLocation) => void;
}

export const getMasterLocationColumns = ({ onEdit, onToggle }: MasterLocationColumnsProps): ColumnDef<MasterLocation>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmlO_LocationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Location Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmlO_LocationName}</div>
    },
    {
        accessorKey: 'hrmlO_LocationDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Location Description' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmlO_LocationDesc}</div>
    },
    {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <ActionButtons
                    rowData={entity}
                    buttons={{ edit: true, toggle: true, delete: false }}
                    onEdit={onEdit}
                    onToggle={() => onToggle?.(entity)}
                    toggleConditionKey='hrmlO_ActiveFlg'
                />
            );
        }
    }
];
