'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
export interface MasterLeave extends BaseEntity {
    hrmL_LeaveName: string;
    hrmL_LeaveCode: string;
    hrmL_LeaveType: string;
    hrmL_LeaveApplyCriteria?: string;
    hrmL_DaysForApplyCriteria?: string;
    hrmL_MaxDaysForApply?: string;
    hrmL_LeaveDetails: string;
    hrmL_LeaveCreditFlg: boolean;
    hrmL_LateDeductFlag: boolean;
    hrmL_ProbationNotApplicableFlg?: boolean;
    hrmL_LateDeductOrder?: number;
    isActive?: boolean;
}
export type Leave = MasterLeave;
interface MasterLeaveColumnsProps {
    onEdit: (row: MasterLeave) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (row: MasterLeave) => void;
}
export const getMasterLeaveColumns = ({ onEdit, onDelete, onToggleStatus }: MasterLeaveColumnsProps): ColumnDef<MasterLeave>[] => [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div className='font-medium text-black-600'>{row.getValue('hrmL_LeaveName')}</div>
    },
    {
        accessorKey: 'hrmL_LeaveCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Code' />,
        cell: ({ row }) => <div className='font-mono text-xs'>{row.getValue('hrmL_LeaveCode')}</div>
    },
    // {
    //     accessorKey: 'hrmL_LeaveType',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Type' />,
    //     cell: ({ row }) => {
    //         const type = row.getValue('hrmL_LeaveType') as string;
    //         return (
    //             <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${type === 'CL' ? 'bg-blue-100 text-blue-800' :
    //                 type === 'EL' ? 'bg-green-100 text-green-800' :
    //                     'bg-gray-100 text-gray-800'
    //                 }`}>
    //                 {type}
    //             </span>
    //         );
    //     }
    // },
    // {
    //     accessorKey: 'hrmL_LateDeductOrder',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
    //     cell: ({ row }) => <div className='text-center font-bold text-gray-500'>{row.getValue('hrmL_LateDeductOrder')}</div>
    // },
    // {
    //     accessorKey: 'hrmL_LeaveCreditFlg',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Credit' />,
    //     cell: ({ row }) => (
    //         <div className='flex justify-center'>
    //             {row.original.hrmL_LeaveCreditFlg ? (
    //                 <div className="rounded-full bg-green-100 p-1"><Check className='h-3 w-3 text-green-600' /></div>
    //             ) : (
    //                 <div className="rounded-full bg-red-100 p-1"><X className='h-3 w-3 text-red-600' /></div>
    //             )}
    //         </div>
    //     )
    // },
    // {
    //     accessorKey: 'hrmL_LateDeductFlag',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Late Deduct' />,
    //     cell: ({ row }) => (
    //         <div className='flex justify-center'>
    //             {row.original.hrmL_LateDeductFlag ? (
    //                 <div className="rounded-full bg-green-100 p-1"><Check className='h-3 w-3 text-green-600' /></div>
    //             ) : (
    //                 <div className="rounded-full bg-red-100 p-1"><X className='h-3 w-3 text-red-600' /></div>
    //             )}
    //         </div>
    //     )
    // },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <ActionButtons
                    rowData={entity}
                    buttons={{ edit: true, delete: true, toggle: false }}
                    onEdit={onEdit}
                    onDelete={() => onDelete(entity.id)}
                    // onToggle={() => onToggleStatus(entity)}
                    toggleConditionKey='isActive'
                />
            );
        }
    }
];
