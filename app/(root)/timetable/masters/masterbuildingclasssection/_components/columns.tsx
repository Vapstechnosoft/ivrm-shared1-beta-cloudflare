'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterBuildClassSectionGrid } from '@/types/timetable/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterBuildingsClassSectionColumns: ColumnDef<IMasterBuildClassSectionGrid>[] = [
    {
        accessorKey: 'ttmbcS_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ttmB_BuildingName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Building Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmB_BuildingName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section  Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterBuildClassSectionGrid }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterBuildClassSectionGrid>();

    const handleEdit = useCallback(
        (data: IMasterBuildClassSectionGrid) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterBuildClassSectionGrid) => {
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
            toggleConditionKey='ttmbcS_ActiveFlag'
        />
    );
}
