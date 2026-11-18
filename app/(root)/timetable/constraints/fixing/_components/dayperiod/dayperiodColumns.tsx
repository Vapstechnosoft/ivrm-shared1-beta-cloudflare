'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { deactivateFixingDayPeriod } from '@/server/timetable/constraints/fixing';
import type { TTDayPeriodGridData } from '@/types/timetable/constraints/fixing';
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
            toggleConditionKey='ttfdP_ActiveFlag'
        />
    );
};

export const dayPeriodColumns: ColumnDef<TTDayPeriodGridData>[] = [
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
        accessorKey: 'ttmC_CategoryName',
        header: 'Category Name'
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: 'Class Name'
    },
    {
        accessorKey: 'asmC_SectionName',
        header: 'Section Name'
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: 'Subject Name'
    },
    {
        accessorKey: 'staffName',
        header: 'Staff Name'
    },
    {
        accessorKey: 'ttmD_DayName',
        header: 'Day Name'
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: 'Period Name'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell row={row} deleteFunc={deactivateFixingDayPeriod} />
    }
];
