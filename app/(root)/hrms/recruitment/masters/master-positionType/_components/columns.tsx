'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ColumnDef } from '@tanstack/react-table';

export interface MasterPositionType {
    hrmpT_Id: number;
    mI_Id: number;
    hrmpT_Name: string;
    hrmpT_Desc: string;
    hrmpT_ActiveFlg: boolean;
    hrmpT_CreatedBy: number;
    hrmpT_UpdatedBy: number;
    createdDate: string;
    updatedDate: string;
}
interface MasterPositionTypeColumnsProps {
    onEdit: (row: MasterPositionType) => void;
    onToggle: (row: MasterPositionType) => void;
}
export const getMasterPositionTypeColumns = ({ onEdit, onToggle }: MasterPositionTypeColumnsProps): ColumnDef<MasterPositionType>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmpT_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Position Type' />,
        cell: ({ row }) => <div>{row.original.hrmpT_Name}</div>
    },
    {
        accessorKey: 'hrmpT_Desc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => <div>{row.original.hrmpT_Desc}</div>
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
                    toggleConditionKey='hrmpT_ActiveFlg'
                />
            );
        }
    }
];
