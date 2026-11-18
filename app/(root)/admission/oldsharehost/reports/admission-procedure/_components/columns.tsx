'use client';

import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

export interface IAdmissionProcedureReport {
    AMST_Id: number;
    ASMCL_Id: number;
    FullName: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    [key: string]: any;
}

export const getAdmissionProcedureColumns = (
    onViewProcedure: (row: IAdmissionProcedureReport) => void,
    onViewForm: (row: IAdmissionProcedureReport) => void
): ColumnDef<IAdmissionProcedureReport>[] => [
    {
        header: 'SL. No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'FullName',
        header: 'Student Name'
    },
    {
        accessorKey: 'AMST_AdmNo',
        header: 'Admission No.'
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class Name'
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: 'Section Name'
    },
    {
        header: 'T&C',
        cell: ({ row }) => (
            <Button
                variant='ghost'
                size='icon'
                className='text-primary hover:bg-primary/10'
                onClick={() => onViewProcedure(row.original)}
                title='View T&C Status'>
                <Eye className='h-4 w-4' />
            </Button>
        )
    },
    {
        header: 'Admission',
        cell: ({ row }) => (
            <Button
                variant='ghost'
                size='icon'
                className='text-primary hover:bg-primary/10'
                onClick={() => onViewForm(row.original)}
                title='View Admission Form'>
                <Eye className='h-4 w-4' />
            </Button>
        )
    }
];
