'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IBranchChange } from '@/types/college/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const branchChangeColumns: ColumnDef<IBranchChange>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>SL NO</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'sName',
        header: () => <div className='font-bold text-black'>Student Name</div>,
        cell: ({ row }) => <div>{row.original.sName || (row.original as any).amcsT_Name || (row.original as any).AMCST_Name || '-'}</div>,
        size: 180
    },
    {
        accessorKey: 'amcO_CourseName',
        header: () => <div className='font-bold text-black'>Course Name</div>,
        cell: ({ row }) => <div>{row.original.amcO_CourseName || (row.original as any).AMCO_CourseName || '-'}</div>,
        size: 160
    },
    {
        accessorKey: 'amB_BranchName',
        header: () => <div className='font-bold text-black'>Branch Name</div>,
        cell: ({ row }) => <div>{row.original.amB_BranchName || (row.original as any).AMB_BranchName || '-'}</div>,
        size: 160
    },
    {
        accessorKey: 'newBranch',
        header: () => <div className='font-bold text-black'>New Branch</div>,
        cell: ({ row }) => <div>{row.original.newBranch || (row.original as any).NewBranch || '-'}</div>,
        size: 160
    },
    {
        accessorKey: 'acscoB_COBFees',
        header: () => <div className='font-bold text-black'>COB Fees</div>,
        cell: ({ row }) => <div>{row.original.acscoB_COBFees ?? (row.original as any).ACSCOB_COBFees ?? '-'}</div>,
        size: 110
    },
    {
        accessorKey: 'acscoB_OldRegNo',
        header: () => <div className='font-bold text-black'>Old Reg No</div>,
        cell: ({ row }) => <div>{row.original.acscoB_OldRegNo || (row.original as any).ACSCOB_OldRegNo || '-'}</div>,
        size: 130
    },
    {
        accessorKey: 'acscoB_NewRegNo',
        header: () => <div className='font-bold text-black'>New Reg No</div>,
        cell: ({ row }) => <div>{row.original.acscoB_NewRegNo || (row.original as any).ACSCOB_NewRegNo || '-'}</div>,
        size: 130
    },
    {
        accessorKey: 'acscoB_Remarks',
        header: () => <div className='font-bold text-black'>Remarks</div>,
        cell: ({ row }) => <div>{row.original.acscoB_Remarks || (row.original as any).ACSCOB_Remarks || '-'}</div>,
        size: 180
    },
    {
        id: 'actions',
        header: () => <div className='text-center font-bold text-black'>Actions</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ActionButtonsCell rowData={row.original} />
            </div>
        ),
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IBranchChange }) {
    const { openToggleForm } = useFormContext<IBranchChange>();

    const handleToggle = useCallback(
        (data: IBranchChange) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }}
            onToggle={handleToggle}
            toggleConditionKey='acscoB_ActiveFlag'
        />
    );
}
