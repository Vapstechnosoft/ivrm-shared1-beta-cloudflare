'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ColumnDef } from '@tanstack/react-table';

export interface MasterPriority {
    hrmpR_Id: number;
    hrmP_Name: string;
    hrmP_Order: number;
    hrmP_ActiveFlag: boolean;
    mI_Id: number;
    hrmP_CreatedBy: number;
    hrmP_UpdatedBy: number;
    createdDate: string;
    updatedDate: string;
}

interface MasterPriorityColumnsProps {
    onEdit: (row: MasterPriority) => void;
    onToggle: (row: MasterPriority) => void;
}

export const getMasterPriorityColumns = ({ onEdit, onToggle }: MasterPriorityColumnsProps): ColumnDef<MasterPriority>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmP_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Priority Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmP_Name}</div>
    },
    {
        accessorKey: 'hrmP_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Priority Order' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmP_Order}</div>
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
                    toggleConditionKey='hrmP_ActiveFlag'
                />
            );
        }
    }
];
