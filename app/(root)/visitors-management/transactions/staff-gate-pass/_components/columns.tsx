'use client';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useStaffGatePass } from '@/hooks/visitors-management/transactions/useStaffGatePass';
import type { StaffGatePassData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Power, PowerOff, Printer } from 'lucide-react';

export const staffGatePassColumns: ColumnDef<StaffGatePassData>[] = [
    {
        id: 'serialNumber',
        header: 'Sl.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'empname',
        header: 'Staff Name',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('empname')}</div>
    },
    {
        accessorKey: 'hrmD_DepartmentName',
        header: 'Department'
    },
    {
        accessorKey: 'hrmdeS_DesignationName',
        header: 'Designation'
    },
    {
        accessorKey: 'gphsT_GatePassNo',
        header: 'Gate Pass No.'
    },
    {
        accessorKey: 'gphsT_DateTime',
        header: 'Date',
        cell: ({ row }) => {
            const dateStr = row.getValue('gphsT_DateTime') as string;
            return dateStr ? format(new Date(dateStr), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'gphsT_OutTime',
        header: 'Out Time'
    },
    {
        accessorKey: 'gphsT_Remarks',
        header: 'Remark'
    },
    {
        id: 'actions',
        header: 'Action',
        cell: function ActionCell({ row }) {
            const { openEditForm } = useFormContext<StaffGatePassData>();
            const { changeStatus, isChangingStatus } = useStaffGatePass();
            const isActive = row.original.gphsT_ActiveFlg;

            return (
                <div className='flex justify-end gap-2 pr-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        title='Print Gate Pass'
                        onClick={() => {}}>
                        <Printer className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        title='Edit'
                        onClick={() => openEditForm(row.original)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        className={
                            isActive
                                ? 'text-red-600 hover:bg-red-50 hover:text-red-800'
                                : 'text-green-600 hover:bg-green-50 hover:text-green-800'
                        }
                        title={isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => changeStatus(row.original.gphsT_Id)}
                        disabled={isChangingStatus}>
                        {isActive ? (
                            <div className='flex items-center'>
                                <PowerOff className='mr-1 h-4 w-4' /> De-Activate
                            </div>
                        ) : (
                            <div className='flex items-center'>
                                <Power className='mr-1 h-4 w-4' /> Activate
                            </div>
                        )}
                    </Button>
                </div>
            );
        }
    }
];
