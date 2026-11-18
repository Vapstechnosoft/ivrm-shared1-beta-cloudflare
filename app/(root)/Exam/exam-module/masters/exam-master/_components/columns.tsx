'use client';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterExam } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const MasterExamColumns: ColumnDef<IMasterExam>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        id: 'emE_ExamName',
        accessorFn: (row: any) => row.emE_ExamName ?? row.eme_ExamName ?? row.EME_ExamName ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Name' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = row.getValue('emE_ExamName') || rowData?.emE_ExamName || rowData?.eme_ExamName || rowData?.EME_ExamName || '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        id: 'emE_IVRSExamName',
        accessorFn: (row: any) => row.emE_IVRSExamName ?? row.eme_IVRSExamName ?? row.EME_IVRSExamName ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IVRS Exam Name' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = row.getValue('emE_IVRSExamName') || rowData?.emE_IVRSExamName || rowData?.eme_IVRSExamName || rowData?.EME_IVRSExamName || '-';
            return <div>{val}</div>;
        }
    },
    {
        id: 'emE_ExamDescription',
        accessorFn: (row: any) =>
            row.emE_ExamDescription ??
            row.emE_ExamDiscription ??
            row.eme_ExamDescription ??
            row.emE_Examdescription ??
            row.emE_ExamDesc ??
            row.eme_examdescription ??
            row.EME_ExamDescription ??
            row.EME_ExamDiscription ??
            row.examDescription ??
            '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Description' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val =
                row.getValue('emE_ExamDescription') ||
                rowData?.emE_ExamDescription ||
                rowData?.emE_ExamDiscription ||
                rowData?.eme_ExamDescription ||
                rowData?.emE_Examdescription ||
                rowData?.emE_ExamDesc ||
                rowData?.eme_examdescription ||
                rowData?.EME_ExamDescription ||
                rowData?.EME_ExamDiscription ||
                rowData?.examDescription ||
                '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        id: 'emE_ExamCode',
        accessorFn: (row: any) => row.emE_ExamCode ?? row.eme_ExamCode ?? row.EME_ExamCode ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Code' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = row.getValue('emE_ExamCode') || rowData?.emE_ExamCode || rowData?.eme_ExamCode || rowData?.EME_ExamCode || '-';
            return <div>{val}</div>;
        }
    },
    {
        id: 'emE_FinalExamFlag',
        accessorFn: (row: any) => row.emE_FinalExamFlag ?? row.eme_FinalExamFlag ?? row.EME_FinalExamFlag ?? false,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Final Exam Flag' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = row.getValue('emE_FinalExamFlag') ?? rowData?.emE_FinalExamFlag ?? rowData?.eme_FinalExamFlag ?? rowData?.EME_FinalExamFlag;
            return getStatusBadge(val === true || val === 1 || val === 'true' ? 'yes' : 'no');
        }
    },
    {
        id: 'emE_ExamOrder',
        accessorFn: (row: any) => row.emE_ExamOrder ?? row.eme_ExamOrder ?? row.EME_ExamOrder ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Order' />,
        cell: ({ row }) => {
            const rowData: any = row.original;
            const val = row.getValue('emE_ExamOrder') ?? rowData?.emE_ExamOrder ?? rowData?.eme_ExamOrder ?? rowData?.EME_ExamOrder ?? '-';
            return <div>{val}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterExam }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterExam>();

    const handleEdit = useCallback(
        (data: IMasterExam) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterExam) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='emE_ActiveFlag'
        />
    );
}
