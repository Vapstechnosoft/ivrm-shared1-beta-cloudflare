'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, Edit, Trash2, X } from 'lucide-react';
export interface LeaveAuthorization extends BaseEntity {
    institution: string;
    hrmG_GradeName: string;
    hrmgT_EmployeeGroupType: string;
    hrmD_DepartmentName: string;
    hrmdeS_DesignationName: string;
    hrmL_LeaveName: string;
    hrlaoN_SanctionLevelNo: string;
    hrmE_EmployeeFirstName: string;
    finalFlag: boolean;
    // Optional IDs for editing
    _HRLA_Id?: number;
    mI_Id?: number;
    hrmG_Id?: number;
    hrmgT_Id?: number;
    hrmD_Id?: number;
    hrmdeS_Id?: number;
    hrmL_Id?: number;
    approvalPersonId?: number;
    hrlaoN_SanctionLevelNo_Num?: number;
}
interface LeaveAuthorizationColumnsProps {
    onEdit: (row: LeaveAuthorization) => void;
    onDelete: (row: LeaveAuthorization) => void;
}
export const getLeaveAuthorizationColumns = ({ onEdit, onDelete }: LeaveAuthorizationColumnsProps): ColumnDef<LeaveAuthorization>[] => [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row }) => <div className='w-10 text-center'>{row.index + 1}</div>
    },
    {
        accessorKey: 'hrmG_GradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade' />,
        cell: ({ row }) => <div className='whitespace-nowrap'>{row.getValue('hrmG_GradeName')}</div>
    },
    {
        accessorKey: 'hrmgT_EmployeeGroupType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
        cell: ({ row }) => (
            <div className='max-w-[100px] truncate' title={row.getValue('hrmgT_EmployeeGroupType')}>
                {row.getValue('hrmgT_EmployeeGroupType')}
            </div>
        )
    },
    {
        accessorKey: 'hrmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Dept' />,
        cell: ({ row }) => (
            <div className='max-w-[100px] truncate' title={row.getValue('hrmD_DepartmentName')}>
                {row.getValue('hrmD_DepartmentName')}
            </div>
        )
    },
    {
        accessorKey: 'hrmdeS_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Desig' />,
        cell: ({ row }) => (
            <div className='max-w-[100px] truncate' title={row.getValue('hrmdeS_DesignationName')}>
                {row.getValue('hrmdeS_DesignationName')}
            </div>
        )
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave' />,
        cell: ({ row }) => <div className='whitespace-nowrap'>{row.getValue('hrmL_LeaveName')}</div>
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Approver' />,
        cell: ({ row }) => <div className='whitespace-nowrap'>{row.getValue('hrmE_EmployeeFirstName')}</div>
    },
    {
        accessorKey: 'hrlaoN_SanctionLevelNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrlaoN_SanctionLevelNo')}</div>
    },
    {
        accessorKey: 'finalFlag',
        header: ({ column }) => <div className='px-2 font-semibold text-xs uppercase'>Final</div>,
        cell: ({ row }) => (
            <div className='flex items-center justify-center'>
                {row.original.finalFlag ? (
                    <div className='flex h-6 w-6 items-center justify-center rounded-full border border-green-200 bg-green-100 shadow-sm'>
                        <Check className='h-3.5 w-3.5 font-bold text-green-700' strokeWidth={3} />
                    </div>
                ) : (
                    <div className='flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-red-100 shadow-sm'>
                        <X className='h-3.5 w-3.5 font-bold text-red-700' strokeWidth={3} />
                    </div>
                )}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => onEdit(entity)} title='Edit'>
                        <Edit className='h-4 w-4 text-primary' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => onDelete(entity)} title='Delete'>
                        <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                </div>
            );
        }
    }
];
