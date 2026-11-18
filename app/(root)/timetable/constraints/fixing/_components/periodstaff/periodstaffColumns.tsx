'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { deactivateFixingPeriodStaff } from '@/server/timetable/constraints/fixing';
import type { TTPeriodStaffGridData } from '@/types/timetable/constraints/fixing';
import type { ColumnDef } from '@tanstack/react-table';

const ActionButtonsCell = ({ row, deleteFunc }: { row: any; deleteFunc: any }) => {
    const { openEditForm, openToggleForm } = useFormContext();

    return (
        <ActionButtons
            rowData={row.original}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={(data) => {
                openEditForm(data);
            }}
            onToggle={(data) => {
                openToggleForm(data);
            }}
            toggleConditionKey='ttfpS_ActiveFlag'
        />
    );
};

export const periodStaffColumns: ColumnDef<TTPeriodStaffGridData>[] = [
    {
        id: 'sno',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Academic Year'
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: 'Period Name'
    },
    {
        accessorKey: 'staffName',
        header: 'Staff Name'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell row={row} deleteFunc={deactivateFixingPeriodStaff} />
    }
];
