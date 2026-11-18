'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { deactivateFixingPeriodSubject } from '@/server/timetable/constraints/fixing';
import type { TTPeriodSubjectGridData } from '@/types/timetable/constraints/fixing';
import type { ColumnDef } from '@tanstack/react-table';

const ActionButtonsCell = ({ row, deleteFunc }: { row: any; deleteFunc: any }) => {
    const { openEditForm, openToggleForm, openDetailsView } = useFormContext();

    return (
        <div className='flex items-center gap-2'>
            <ActionButtons
                rowData={row.original}
                buttons={{
                    edit: true,
                    toggle: true,
                    delete: false
                }}
                onEdit={(data: any) => {
                    openEditForm(data);
                }}
                onToggle={(data: any) => {
                    openToggleForm(data);
                }}
                toggleConditionKey='ttfpsU_ActiveFlag'
            />
        </div>
    );
};

export const periodSubjectColumns: ColumnDef<TTPeriodSubjectGridData>[] = [
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
        accessorKey: 'ismS_SubjectName',
        header: 'Subject Name'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell row={row} deleteFunc={deactivateFixingPeriodSubject} />
    }
];
