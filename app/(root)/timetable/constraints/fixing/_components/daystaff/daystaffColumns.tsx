'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { deactivateFixingDayStaff } from '@/server/timetable/constraints/fixing';
import type { TTDayStaffGridData } from '@/types/timetable/constraints/fixing';
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
            toggleConditionKey='ttfdS_ActiveFlag'
        />
    );
};

export const dayStaffColumns: ColumnDef<TTDayStaffGridData>[] = [
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
        accessorKey: 'ttmD_DayName',
        header: 'Day Name'
    },
    {
        accessorKey: 'staffName',
        header: 'Staff Name'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell row={row} deleteFunc={deactivateFixingDayStaff} />
    }
];
