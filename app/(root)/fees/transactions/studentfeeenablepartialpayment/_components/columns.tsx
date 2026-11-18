'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IStudentFeeEnablePartialPaymentList } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { format, isValid } from 'date-fns';
import { useCallback } from 'react';

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'dd/MM/yyyy') : dateStr;
};

export const studentFeeEnablePartialPaymentColumns: ColumnDef<IStudentFeeEnablePartialPaymentList>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex || 0;
            const pageSize = table.getState().pagination.pageSize || 10;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='px-4 py-2 font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        id: 'studentName',
        accessorFn: (row: any) =>
            row.studentName ||
            row.amsT_FirstName ||
            row.AMST_FirstName ||
            [row.amsT_FirstName ?? row.AMST_FirstName, row.amsT_MiddleName ?? row.AMST_MiddleName, row.amsT_LastName ?? row.AMST_LastName]
                .filter(Boolean)
                .join(' '),
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => {
            const firstName = row.original.amsT_FirstName ?? (row.original as any).AMST_FirstName ?? '';
            const middleName = row.original.amsT_MiddleName ?? (row.original as any).AMST_MiddleName ?? '';
            const lastName = row.original.amsT_LastName ?? (row.original as any).AMST_LastName ?? '';
            const constructedName = [firstName, middleName, lastName].filter(Boolean).join(' ');
            const fullName = row.original.studentName || (row.original as any).StudentName || constructedName || '-';
            const admNo = row.original.amsT_AdmNo ?? (row.original as any).AMST_AdmNo;
            return <div className='font-medium text-foreground'>{admNo ? `${admNo} : ${fullName}` : fullName}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'fsepP_RemarksDate',
        accessorFn: (row: any) => row.fsepP_RemarksDate ?? row.FSEPP_RemarksDate ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Entry Date' className='font-bold text-black' />,
        cell: ({ row }) => {
            const dateVal = row.original.fsepP_RemarksDate ?? (row.original as any).FSEPP_RemarksDate;
            return <div>{formatDate(dateVal)}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'asmaY_Year',
        accessorFn: (row: any) => row.asmaY_Year ?? row.ASMAY_Year ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' className='font-bold text-black' />,
        cell: ({ row }) => {
            const yearVal = row.original.asmaY_Year ?? (row.original as any).ASMAY_Year ?? '-';
            return <div>{yearVal}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'fsepP_Remarks',
        accessorFn: (row: any) => row.fsepP_Remarks ?? row.FSEPP_Remarks ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' className='font-bold text-black' />,
        cell: ({ row }) => (
            <div className='max-w-[300px] truncate' title={row.getValue('fsepP_Remarks')}>
                {row.getValue('fsepP_Remarks') || '-'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IStudentFeeEnablePartialPaymentList }) {
    const { openToggleForm } = useFormContext<IStudentFeeEnablePartialPaymentList>();

    const handleToggle = useCallback(
        (data: IStudentFeeEnablePartialPaymentList) => {
            openToggleForm?.(data);
        },
        [openToggleForm]
    );

    const activeFlag =
        rowData.fsepP_ActiveFlag ?? (rowData as any).FSEPP_ActiveFlag ?? (rowData as any).is_Active ?? (rowData as any).isActive;

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={{ ...rowData, fsepP_ActiveFlag: Boolean(activeFlag) }}
                buttons={{ edit: false, toggle: true, delete: false }}
                onToggle={handleToggle}
                toggleConditionKey='fsepP_ActiveFlag'
            />
        </div>
    );
}
