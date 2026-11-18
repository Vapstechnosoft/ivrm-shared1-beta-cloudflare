'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ColumnDef } from '@tanstack/react-table';

export interface MasterJob {
    hrmJ_Id: number;
    hrmJ_JobCode: string;
    hrmJ_JobTiTle: string;
    hrmlO_Id: number;
    hrmlO_LocationName?: string;
    hrmJ_Posted: string;
    hrC_Id?: number;
    hrmJ_ActiveFlg: number;
}

interface MasterJobColumnsProps {
    onEdit: (row: MasterJob) => void;
    onToggle: (row: MasterJob) => void;
}
export const getMasterJobColumns = ({ onEdit, onToggle }: MasterJobColumnsProps): ColumnDef<MasterJob>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='text-center ' />,
        cell: ({ row }) => <div className='text-center font-medium'>{row.index + 1}</div>,
        size: 10,
        enableSorting: false
    },
    {
        accessorKey: 'hrmJ_JobCode',
        header: ({ column }) => (
            <div className='flex items-center justify-center'>
                <DataTableColumnHeader column={column} title='Job Code' />
            </div>
        ),
        cell: ({ row }) => <div className='flex justify-center font-medium'>{row.original.hrmJ_JobCode}</div>
    },
    {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Job Title' />,
        accessorKey: 'hrmJ_JobTiTle'
    },
    {
        header: ({ column }) => <DataTableColumnHeader column={column} title='Job Location' />,
        accessorKey: 'hrmlO_LocationName'
    },
    // TODO: Add other columns based on the entity fields
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <ActionButtons
                    rowData={entity}
                    buttons={{ edit: true, toggle: true, delete: false }}
                    onEdit={onEdit}
                    onToggle={() => onToggle(entity)}
                    toggleConditionKey='hrmJ_ActiveFlg'
                />
            );
        }
    }
];
