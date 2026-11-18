'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { deactivateFixingDaySubject } from '@/server/timetable/constraints/fixing';
import type { TTDaySubjectGridData } from '@/types/timetable/constraints/fixing';
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
            toggleConditionKey='ttfdsU_ActiveFlag'
        />
    );
};

export const daySubjectColumns: ColumnDef<TTDaySubjectGridData>[] = [
    {
        id: 'sno',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'ttfdsU_Id',
        header: 'ID'
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
        accessorKey: 'ismS_SubjectName',
        header: 'Subject Name'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell row={row} deleteFunc={deactivateFixingDaySubject} />
    }
];
