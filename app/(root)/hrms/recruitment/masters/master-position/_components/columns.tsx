'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ColumnDef } from '@tanstack/react-table';

export interface MasterPosition {
    hrmP_Id: number;
    mI_Id: number;
    hrmP_Position: string;
    hrmP_Skills: string;
    hrmP_Desc: string;
    hrmP_ActiveFlg: boolean;
    hrmP_CreatedBy: number;
    hrmP_UpdatedBy: number;
    createdDate: string;
    updatedDate: string;
}

interface MasterPositionColumnsProps {
    onEdit: (row: MasterPosition) => void;
    onToggle?: (row: MasterPosition) => void;
}

export const getMasterPositionColumns = ({ onEdit, onToggle }: MasterPositionColumnsProps): ColumnDef<MasterPosition>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmP_Position',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Position Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmP_Position}</div>
    },
    {
        accessorKey: 'hrmP_Skills',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Skill' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmP_Skills}</div>
    },
    {
        accessorKey: 'hrmP_Desc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.hrmP_Desc}</div>
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
                    toggleConditionKey='hrmP_ActiveFlg'
                />
            );
        }
    }
];
