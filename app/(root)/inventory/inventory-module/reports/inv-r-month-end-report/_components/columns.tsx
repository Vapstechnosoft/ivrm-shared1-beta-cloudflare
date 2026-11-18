'use client';

import type { IInvRMonthEndReportTableRow } from '@/types/inventory/reports/inv-r-month-end-report';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<IInvRMonthEndReportTableRow>[] = [
    {
        accessorKey: 'id',
        header: 'SL.NO'
    },
    {
        accessorKey: 'inventory',
        header: 'INVENTORY'
    },
    {
        accessorKey: 'count',
        header: 'COUNT'
    },
    {
        accessorKey: 'sms',
        header: 'SMS'
    },
    {
        accessorKey: 'email',
        header: 'EMAIL'
    }
];
