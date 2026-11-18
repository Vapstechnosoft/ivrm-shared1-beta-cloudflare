'use client';

import type { IEligibilityCertificateReportDetail } from '@/types/sports/reports/eligibility-certificate-report';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<IEligibilityCertificateReportDetail>[] = [
    {
        accessorKey: 'amst_firstname',
        header: 'Student Name',
        cell: ({ row }) => row.original.amst_firstname || row.original.studentname || '-'
    },
    {
        accessorKey: 'asmcl_classname',
        header: 'Class',
        cell: ({ row }) => row.original.asmcl_classname || row.original.classname || '-'
    },
    {
        accessorKey: 'asmc_sectionname',
        header: 'Section',
        cell: ({ row }) => row.original.asmc_sectionname || row.original.sectionname || '-'
    },
    {
        accessorKey: 'amst_dob',
        header: 'Date of Birth',
        cell: ({ row }) => {
            const date = row.getValue('amst_dob');
            return date ? new Date(date as string).toLocaleDateString() : '-';
        }
    },
    {
        accessorKey: 'fatherName',
        header: 'Father Name'
    },
    {
        accessorKey: 'motherName',
        header: 'Mother Name'
    }
];
